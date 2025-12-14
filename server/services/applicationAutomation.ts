import {
  createApplication,
  updateApplication,
  createApplicationLog,
  getJobPostingById,
  getCvDocumentById,
  updateJobPosting,
} from "../db";
import type { JobPosting, CvDocument, InsertApplication } from "../../drizzle/schema";
import { generatePersonalizedCoverLetter } from "./llmService";
import { getUserDefaultCv, getUserDefaultCoverLetter } from "./documentManager";
import { notifyOwner } from "../_core/notification";

export interface ApplicationResult {
  success: boolean;
  applicationId?: number;
  error?: string;
  message: string;
}

export interface ApplicationStrategy {
  waitBeforeSubmit: number; // milliseconds
  retryAttempts: number;
  retryDelay: number; // milliseconds
  validateBeforeSubmit: boolean;
}

const DEFAULT_STRATEGY: ApplicationStrategy = {
  waitBeforeSubmit: 2000,
  retryAttempts: 3,
  retryDelay: 5000,
  validateBeforeSubmit: true,
};

/**
 * Best practices for job applications
 */
const BEST_PRACTICES = {
  timing: {
    bestDaysToApply: ["Monday", "Tuesday", "Wednesday"],
    bestHoursToApply: [8, 9, 10, 14, 15], // 8-10 AM, 2-3 PM
    avoidWeekends: true,
  },
  content: {
    personalizeGreeting: true,
    mentionCompanyName: true,
    highlightRelevantExperience: true,
    keepConcise: true,
    proofread: true,
  },
  followUp: {
    sendThankYouNote: true,
    followUpAfterDays: 7,
  },
};

/**
 * Check if current time is optimal for job applications
 */
function isOptimalApplicationTime(): boolean {
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });
  const hour = now.getHours();

  if (BEST_PRACTICES.timing.avoidWeekends && (dayOfWeek === "Saturday" || dayOfWeek === "Sunday")) {
    return false;
  }

  return (
    BEST_PRACTICES.timing.bestDaysToApply.includes(dayOfWeek) &&
    BEST_PRACTICES.timing.bestHoursToApply.includes(hour)
  );
}

/**
 * Validate application data before submission
 */
function validateApplicationData(data: {
  job: JobPosting;
  cv: CvDocument;
  coverLetter: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.job.url) {
    errors.push("Job URL is missing");
  }

  if (!data.cv.fileUrl) {
    errors.push("CV file URL is missing");
  }

  if (!data.coverLetter || data.coverLetter.length < 100) {
    errors.push("Cover letter is too short or missing");
  }

  if (data.coverLetter.length > 5000) {
    errors.push("Cover letter is too long (max 5000 characters)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Simulate form filling (in production, this would use Puppeteer or similar)
 */
async function fillApplicationForm(
  job: JobPosting,
  cv: CvDocument,
  coverLetter: string,
  strategy: ApplicationStrategy
): Promise<{ success: boolean; error?: string }> {
  // Wait before submission (simulate human behavior)
  await new Promise((resolve) => setTimeout(resolve, strategy.waitBeforeSubmit));

  // In production, this would:
  // 1. Navigate to job URL
  // 2. Detect form fields
  // 3. Fill in personal information
  // 4. Upload CV
  // 5. Paste cover letter
  // 6. Handle additional questions
  // 7. Submit form

  // For now, we simulate success/failure
  const simulatedSuccess = Math.random() > 0.1; // 90% success rate

  if (!simulatedSuccess) {
    return {
      success: false,
      error: "Form submission failed - captcha detected or network error",
    };
  }

  return { success: true };
}

/**
 * Apply to a job posting automatically
 */
export async function applyToJob(
  userId: number,
  jobPostingId: number,
  options?: {
    cvDocumentId?: number;
    coverLetterTemplateId?: number;
    customCoverLetter?: string;
    strategy?: Partial<ApplicationStrategy>;
  }
): Promise<ApplicationResult> {
  const strategy = { ...DEFAULT_STRATEGY, ...options?.strategy };

  try {
    // Get job posting
    const job = await getJobPostingById(jobPostingId);
    if (!job) {
      return {
        success: false,
        error: "Job posting not found",
        message: "The specified job posting does not exist",
      };
    }

    // Check if job is still available
    if (job.status === "expired" || job.status === "applied") {
      return {
        success: false,
        error: "Job not available",
        message: `Job status is ${job.status}`,
      };
    }

    // Get CV
    let cv: CvDocument | undefined;
    if (options?.cvDocumentId) {
      cv = await getCvDocumentById(options.cvDocumentId);
    } else {
      cv = await getUserDefaultCv(userId);
    }

    if (!cv) {
      return {
        success: false,
        error: "No CV available",
        message: "Please upload a CV before applying",
      };
    }

    // Generate or use custom cover letter
    let coverLetter: string;
    if (options?.customCoverLetter) {
      coverLetter = options.customCoverLetter;
    } else {
      const template = await getUserDefaultCoverLetter(userId);
      const result = await generatePersonalizedCoverLetter(job, "CV content placeholder", template || undefined);
      coverLetter = result.coverLetter;
    }

    // Validate application data
    if (strategy.validateBeforeSubmit) {
      const validation = validateApplicationData({ job, cv, coverLetter });
      if (!validation.valid) {
        return {
          success: false,
          error: "Validation failed",
          message: `Application validation errors: ${validation.errors.join(", ")}`,
        };
      }
    }

    // Create application record
    const applicationData: InsertApplication = {
      userId,
      jobPostingId,
      cvDocumentId: cv.id,
      coverLetter,
      status: "pending",
    };

    const application = await createApplication(applicationData);

    // Log application creation
    await createApplicationLog({
      applicationId: application.id,
      action: "created",
      details: `Application created for ${job.title} at ${job.company}`,
    });

    // Attempt to submit application
    let submitSuccess = false;
    let lastError: string | undefined;

    for (let attempt = 1; attempt <= strategy.retryAttempts; attempt++) {
      try {
        await createApplicationLog({
          applicationId: application.id,
          action: "submit_attempt",
          details: `Attempt ${attempt} of ${strategy.retryAttempts}`,
        });

        const result = await fillApplicationForm(job, cv, coverLetter, strategy);

        if (result.success) {
          submitSuccess = true;
          break;
        } else {
          lastError = result.error;
          if (attempt < strategy.retryAttempts) {
            await new Promise((resolve) => setTimeout(resolve, strategy.retryDelay));
          }
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Unknown error";
        if (attempt < strategy.retryAttempts) {
          await new Promise((resolve) => setTimeout(resolve, strategy.retryDelay));
        }
      }
    }

    // Update application status
    if (submitSuccess) {
      await updateApplication(application.id, {
        status: "submitted",
        submittedAt: new Date(),
      });

      await updateJobPosting(jobPostingId, {
        status: "applied",
      });

      await createApplicationLog({
        applicationId: application.id,
        action: "submitted",
        details: "Application successfully submitted",
      });

      // Notify owner of successful application
      await notifyOwner({
        title: "Bewerbung erfolgreich eingereicht",
        content: `Bewerbung für ${job.title} bei ${job.company} wurde erfolgreich eingereicht.`,
      });

      return {
        success: true,
        applicationId: application.id,
        message: `Successfully applied to ${job.title} at ${job.company}`,
      };
    } else {
      await updateApplication(application.id, {
        status: "failed",
        errorMessage: lastError,
        retryCount: strategy.retryAttempts,
        lastRetryAt: new Date(),
      });

      await createApplicationLog({
        applicationId: application.id,
        action: "failed",
        details: `Application failed after ${strategy.retryAttempts} attempts: ${lastError}`,
      });

      return {
        success: false,
        applicationId: application.id,
        error: lastError,
        message: `Failed to apply after ${strategy.retryAttempts} attempts`,
      };
    }
  } catch (error) {
    console.error("[Application] Error applying to job:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "An unexpected error occurred during application",
    };
  }
}

/**
 * Batch apply to multiple jobs
 */
export async function batchApplyToJobs(
  userId: number,
  jobPostingIds: number[],
  options?: {
    cvDocumentId?: number;
    maxApplicationsPerRun?: number;
    delayBetweenApplications?: number;
  }
): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: ApplicationResult[];
}> {
  const maxApplications = options?.maxApplicationsPerRun || 30;
  const delay = options?.delayBetweenApplications || 5000;

  const results: ApplicationResult[] = [];
  let successful = 0;
  let failed = 0;

  const jobsToProcess = jobPostingIds.slice(0, maxApplications);

  for (const jobId of jobsToProcess) {
    // Check if timing is optimal
    if (!isOptimalApplicationTime()) {
      console.log("[Application] Waiting for optimal application time...");
      // In production, this would wait or schedule for later
    }

    const result = await applyToJob(userId, jobId, {
      cvDocumentId: options?.cvDocumentId,
    });

    results.push(result);

    if (result.success) {
      successful++;
    } else {
      failed++;
    }

    // Delay between applications to avoid rate limiting
    if (jobsToProcess.indexOf(jobId) < jobsToProcess.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return {
    total: jobsToProcess.length,
    successful,
    failed,
    results,
  };
}

/**
 * Get application statistics
 */
export function getApplicationBestPractices() {
  return BEST_PRACTICES;
}
