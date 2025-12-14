import * as cron from "node-cron";
import { scrapeJobs, type ScraperConfig } from "./jobScraper";
import { batchApplyToJobs } from "./applicationAutomation";
import {
  getActiveSearchConfigurations,
  getJobPostings,
  createSchedulerRun,
  updateSchedulerRun,
  getUserByOpenId,
} from "../db";
import { notifyOwner } from "../_core/notification";
import { ENV } from "../_core/env";

let schedulerInitialized = false;
let activeJobs: ReturnType<typeof cron.schedule>[] = [];

/**
 * Run job search and application process
 */
async function runJobSearchAndApply(): Promise<{
  jobsFound: number;
  applicationsSubmitted: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let totalJobsFound = 0;
  let totalApplicationsSubmitted = 0;

  try {
    // Get owner user - if not found, skip this run (user needs to log in first)
    const owner = await getUserByOpenId(ENV.ownerOpenId);
    if (!owner) {
      console.log("[Scheduler] Owner user not found - waiting for first login");
      return { jobsFound: 0, applicationsSubmitted: 0, errors: [] };
    }

    // Get active search configurations
    const searchConfigs = await getActiveSearchConfigurations(owner.id);

    if (searchConfigs.length === 0) {
      console.log("[Scheduler] No active search configurations found");
      return { jobsFound: 0, applicationsSubmitted: 0, errors };
    }

    // Run scraping for each configuration
    for (const config of searchConfigs) {
      try {
        const scraperConfig: ScraperConfig = {
          keywords: config.keywords ? JSON.parse(config.keywords) : [],
          locations: config.locations ? JSON.parse(config.locations) : [],
          industries: config.industries ? JSON.parse(config.industries) : [],
          platforms: config.platforms ? JSON.parse(config.platforms) : ["indeed", "stepstone"],
          minSalary: config.minSalary || undefined,
          maxSalary: config.maxSalary || undefined,
          experienceLevel: config.experienceLevel || undefined,
          employmentType: config.employmentType || undefined,
        };

        console.log(`[Scheduler] Running scraper with config: ${config.name}`);
        const scrapeResult = await scrapeJobs(scraperConfig);

        totalJobsFound += scrapeResult.newJobs;

        console.log(
          `[Scheduler] Found ${scrapeResult.newJobs} new jobs, updated ${scrapeResult.updatedJobs} existing jobs`
        );
      } catch (err) {
        const errorMsg = `Error scraping with config ${config.name}: ${err instanceof Error ? err.message : "Unknown error"}`;
        console.error(`[Scheduler] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    // Get new jobs with high relevance score
    const newJobs = await getJobPostings({
      status: ["new"],
      limit: 50,
    });

    // Filter jobs with relevance score >= 60
    const relevantJobs = newJobs.filter((job) => (job.relevanceScore || 0) >= 60);

    if (relevantJobs.length > 0) {
      console.log(`[Scheduler] Applying to ${relevantJobs.length} relevant jobs`);

      const applyResult = await batchApplyToJobs(
        owner.id,
        relevantJobs.map((j) => j.id),
        {
          maxApplicationsPerRun: 30,
          delayBetweenApplications: 5000,
        }
      );

      totalApplicationsSubmitted = applyResult.successful;

      console.log(
        `[Scheduler] Applied to ${applyResult.successful} jobs, ${applyResult.failed} failed`
      );

      // Notify owner if applications were submitted
      if (applyResult.successful > 0) {
        await notifyOwner({
          title: "Neue Bewerbungen eingereicht",
          content: `${applyResult.successful} Bewerbungen wurden automatisch eingereicht. ${totalJobsFound} neue Stellen gefunden.`,
        });
      }
    } else {
      console.log("[Scheduler] No relevant jobs found to apply to");
    }
  } catch (err) {
    const errorMsg = `Scheduler run error: ${err instanceof Error ? err.message : "Unknown error"}`;
    console.error(`[Scheduler] ${errorMsg}`);
    errors.push(errorMsg);
  }

  return {
    jobsFound: totalJobsFound,
    applicationsSubmitted: totalApplicationsSubmitted,
    errors,
  };
}

/**
 * Execute scheduled job search and application
 */
async function executeScheduledRun(runType: string): Promise<void> {
  const startTime = Date.now();

  // Create scheduler run record
  const run = await createSchedulerRun({
    runType,
    status: "running",
    jobsFound: 0,
    applicationsSubmitted: 0,
  });

  console.log(`[Scheduler] Starting ${runType} run (ID: ${run.id})`);

  try {
    const result = await runJobSearchAndApply();

    const duration = Date.now() - startTime;

    await updateSchedulerRun(run.id, {
      status: "completed",
      jobsFound: result.jobsFound,
      applicationsSubmitted: result.applicationsSubmitted,
      errors: result.errors.length > 0 ? JSON.stringify(result.errors) : null,
      completedAt: new Date(),
      duration,
    });

    console.log(
      `[Scheduler] Completed ${runType} run in ${duration}ms - Found: ${result.jobsFound}, Applied: ${result.applicationsSubmitted}`
    );

    // Notify owner if there were errors
    if (result.errors.length > 0) {
      await notifyOwner({
        title: "Scheduler-Fehler aufgetreten",
        content: `Beim automatischen Bewerbungslauf sind Fehler aufgetreten: ${result.errors.join(", ")}`,
      });
    }
  } catch (err) {
    const duration = Date.now() - startTime;
    const errorMsg = err instanceof Error ? err.message : "Unknown error";

    await updateSchedulerRun(run.id, {
      status: "failed",
      errors: JSON.stringify([errorMsg]),
      completedAt: new Date(),
      duration,
    });

    console.error(`[Scheduler] Failed ${runType} run:`, err);

    await notifyOwner({
      title: "Scheduler-Fehler",
      content: `Der automatische Bewerbungslauf ist fehlgeschlagen: ${errorMsg}`,
    });
  }
}

/**
 * Initialize scheduler with 4-hour intervals
 */
export function initializeScheduler(): void {
  if (schedulerInitialized) {
    console.log("[Scheduler] Already initialized");
    return;
  }

  console.log("[Scheduler] Initializing automated job search scheduler");

  // Run every 4 hours: 0 0 */4 * * * (at minute 0, hour 0, 4, 8, 12, 16, 20)
  const fourHourJob = cron.schedule(
    "0 0 */4 * * *",
    async () => {
      console.log("[Scheduler] Triggered 4-hour job search");
      await executeScheduledRun("4-hour-search");
    },
    {
      timezone: "Europe/Berlin",
    }
  );

  activeJobs.push(fourHourJob);

  // Daily summary at 8 PM: 0 0 20 * * *
  const dailySummaryJob = cron.schedule(
    "0 0 20 * * *",
    async () => {
      console.log("[Scheduler] Triggered daily summary");
      await executeScheduledRun("daily-summary");
    },
    {
      timezone: "Europe/Berlin",
    }
  );

  activeJobs.push(dailySummaryJob);

  schedulerInitialized = true;

  console.log("[Scheduler] Scheduler initialized successfully");
  console.log("[Scheduler] - 4-hour job search: Every 4 hours (0, 4, 8, 12, 16, 20)");
  console.log("[Scheduler] - Daily summary: Every day at 20:00");
}

/**
 * Stop all scheduled jobs
 */
export function stopScheduler(): void {
  console.log("[Scheduler] Stopping all scheduled jobs");

  activeJobs.forEach((job) => {
    job.stop();
  });

  activeJobs = [];
  schedulerInitialized = false;

  console.log("[Scheduler] All scheduled jobs stopped");
}

/**
 * Manually trigger a job search run
 */
export async function triggerManualRun(): Promise<{
  jobsFound: number;
  applicationsSubmitted: number;
  errors: string[];
}> {
  console.log("[Scheduler] Manual run triggered");
  await executeScheduledRun("manual-trigger");
  return await runJobSearchAndApply();
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): {
  initialized: boolean;
  activeJobs: number;
} {
  return {
    initialized: schedulerInitialized,
    activeJobs: activeJobs.length,
  };
}
