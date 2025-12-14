import axios from "axios";
import * as cheerio from "cheerio";
import {
  createJobPosting,
  getJobPostingByExternalId,
  updateJobPosting,
} from "../db";
import type { InsertJobPosting } from "../../drizzle/schema";

export interface ScraperConfig {
  keywords: string[];
  locations: string[];
  industries: string[];
  platforms: string[];
  minSalary?: number;
  maxSalary?: number;
  experienceLevel?: string;
  employmentType?: string;
}

export interface ScrapedJob {
  externalId: string;
  platform: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements?: string;
  salary?: string;
  employmentType?: string;
  industry?: string;
  url: string;
  postedDate?: Date;
  hasAts?: boolean;
  atsSystem?: string;
}

/**
 * Detect if a job posting uses an ATS system
 */
function detectATS(url: string, html: string): { hasAts: boolean; atsSystem?: string } {
  const atsPatterns = [
    { pattern: /greenhouse\.io/i, name: "Greenhouse" },
    { pattern: /lever\.co/i, name: "Lever" },
    { pattern: /workday\.com/i, name: "Workday" },
    { pattern: /taleo\.net/i, name: "Oracle Taleo" },
    { pattern: /successfactors\.com/i, name: "SAP SuccessFactors" },
    { pattern: /icims\.com/i, name: "iCIMS" },
    { pattern: /smartrecruiters\.com/i, name: "SmartRecruiters" },
    { pattern: /jobvite\.com/i, name: "Jobvite" },
    { pattern: /breezy\.hr/i, name: "BreezyHR" },
    { pattern: /recruitee\.com/i, name: "Recruitee" },
    { pattern: /personio\.de/i, name: "Personio" },
  ];

  for (const { pattern, name } of atsPatterns) {
    if (pattern.test(url) || pattern.test(html)) {
      return { hasAts: true, atsSystem: name };
    }
  }

  return { hasAts: false };
}

/**
 * Calculate relevance score based on keywords and requirements
 */
function calculateRelevanceScore(job: ScrapedJob, config: ScraperConfig): number {
  let score = 50; // Base score

  const textToSearch = `${job.title} ${job.description} ${job.requirements || ""}`.toLowerCase();

  // Check keywords
  const matchedKeywords = config.keywords.filter((keyword) =>
    textToSearch.includes(keyword.toLowerCase())
  );
  score += matchedKeywords.length * 10;

  // Check industry match
  if (job.industry && config.industries.some((ind) => ind.toLowerCase() === job.industry?.toLowerCase())) {
    score += 15;
  }

  // Check location match
  if (job.location && config.locations.some((loc) => job.location.toLowerCase().includes(loc.toLowerCase()))) {
    score += 10;
  }

  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Scrape jobs from Indeed
 */
export async function scrapeIndeed(config: ScraperConfig): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];

  try {
    for (const location of config.locations) {
      for (const keyword of config.keywords) {
        const searchUrl = `https://de.indeed.com/jobs?q=${encodeURIComponent(keyword)}&l=${encodeURIComponent(location)}`;

        try {
          const response = await axios.get(searchUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
            },
            timeout: 15000,
          });

          const $ = cheerio.load(response.data);

          $(".job_seen_beacon, .jobsearch-SerpJobCard, [data-jk]").each((_, element) => {
            try {
              const $job = $(element);
              const jobKey = $job.attr("data-jk") || $job.find("[data-jk]").attr("data-jk");

              if (!jobKey) return;

              const title = $job.find(".jobTitle, h2.jobTitle").text().trim();
              const company = $job.find(".companyName").text().trim();
              const jobLocation = $job.find(".companyLocation").text().trim();
              const snippet = $job.find(".job-snippet").text().trim();
              const salary = $job.find(".salary-snippet").text().trim();

              if (!title) return;

              const jobUrl = `https://de.indeed.com/viewjob?jk=${jobKey}`;
              const atsInfo = detectATS(jobUrl, response.data);

              jobs.push({
                externalId: jobKey,
                platform: "indeed",
                title,
                company: company || "Unknown",
                location: jobLocation || location,
                description: snippet,
                salary: salary || undefined,
                url: jobUrl,
                hasAts: atsInfo.hasAts,
                atsSystem: atsInfo.atsSystem,
                industry: config.industries[0] || undefined,
              });
            } catch (err) {
              console.error("[Indeed] Error parsing job element:", err);
            }
          });

          // Rate limiting
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (err) {
          console.error(`[Indeed] Error scraping ${keyword} in ${location}:`, err);
        }
      }
    }
  } catch (error) {
    console.error("[Indeed] Scraping error:", error);
  }

  return jobs;
}

/**
 * Scrape jobs from StepStone
 */
export async function scrapeStepStone(config: ScraperConfig): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];

  try {
    for (const location of config.locations) {
      for (const keyword of config.keywords) {
        const searchUrl = `https://www.stepstone.de/jobs/${encodeURIComponent(keyword)}?location=${encodeURIComponent(location)}`;

        try {
          const response = await axios.get(searchUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
            },
            timeout: 15000,
          });

          const $ = cheerio.load(response.data);

          $('article[data-at="job-item"], .resultlist-item').each((_, element) => {
            try {
              const $job = $(element);
              const titleElement = $job.find('[data-at="job-item-title"], .resultlist-title a');
              const title = titleElement.text().trim();
              const jobUrl = titleElement.attr("href");

              if (!title || !jobUrl) return;

              const company = $job.find('[data-at="job-item-company-name"], .resultlist-company').text().trim();
              const jobLocation = $job.find('[data-at="job-item-location"], .resultlist-location').text().trim();
              const snippet = $job.find('[data-at="job-item-snippet"], .resultlist-snippet').text().trim();

              // Extract job ID from URL
              const jobIdMatch = jobUrl.match(/--(\d+)-inline\.html/);
              const externalId = jobIdMatch ? jobIdMatch[1] : jobUrl;

              const fullUrl = jobUrl.startsWith("http") ? jobUrl : `https://www.stepstone.de${jobUrl}`;
              const atsInfo = detectATS(fullUrl, response.data);

              jobs.push({
                externalId: externalId || "",
                platform: "stepstone",
                title,
                company: company || "Unknown",
                location: jobLocation || location,
                description: snippet,
                url: fullUrl,
                hasAts: atsInfo.hasAts,
                atsSystem: atsInfo.atsSystem,
                industry: config.industries[0] || undefined,
              });
            } catch (err) {
              console.error("[StepStone] Error parsing job element:", err);
            }
          });

          // Rate limiting
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (err) {
          console.error(`[StepStone] Error scraping ${keyword} in ${location}:`, err);
        }
      }
    }
  } catch (error) {
    console.error("[StepStone] Scraping error:", error);
  }

  return jobs;
}

/**
 * Main scraping orchestrator
 */
export async function scrapeJobs(config: ScraperConfig): Promise<{
  totalFound: number;
  newJobs: number;
  updatedJobs: number;
}> {
  const allScrapedJobs: ScrapedJob[] = [];

  // Scrape from all configured platforms
  if (config.platforms.includes("indeed")) {
    const indeedJobs = await scrapeIndeed(config);
    allScrapedJobs.push(...indeedJobs);
  }

  if (config.platforms.includes("stepstone")) {
    const stepstoneJobs = await scrapeStepStone(config);
    allScrapedJobs.push(...stepstoneJobs);
  }

  let newJobs = 0;
  let updatedJobs = 0;

  // Save to database
  for (const job of allScrapedJobs) {
    try {
      const existing = await getJobPostingByExternalId(job.platform, job.externalId);

      const relevanceScore = calculateRelevanceScore(job, config);

      const jobData: InsertJobPosting = {
        externalId: job.externalId,
        platform: job.platform,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        requirements: job.requirements,
        salary: job.salary,
        employmentType: job.employmentType,
        industry: job.industry,
        url: job.url,
        postedDate: job.postedDate,
        hasAts: job.hasAts || false,
        atsSystem: job.atsSystem,
        relevanceScore,
        status: "new",
      };

      if (existing) {
        await updateJobPosting(existing.id, jobData);
        updatedJobs++;
      } else {
        await createJobPosting(jobData);
        newJobs++;
      }
    } catch (err) {
      console.error(`[Scraper] Error saving job ${job.externalId}:`, err);
    }
  }

  return {
    totalFound: allScrapedJobs.length,
    newJobs,
    updatedJobs,
  };
}
