import { describe, expect, it } from "vitest";
import { scrapeJobs, type ScraperConfig } from "./jobScraper";

describe("Job Scraper", () => {
  it("should accept valid scraper configuration", () => {
    const config: ScraperConfig = {
      keywords: ["Software Developer", "Full Stack"],
      locations: ["Berlin", "München"],
      industries: ["IT", "Software"],
      platforms: ["indeed", "stepstone"],
    };

    expect(config.keywords).toHaveLength(2);
    expect(config.locations).toHaveLength(2);
    expect(config.platforms).toContain("indeed");
    expect(config.platforms).toContain("stepstone");
  });

  it("should handle empty configuration gracefully", async () => {
    const config: ScraperConfig = {
      keywords: [],
      locations: [],
      industries: [],
      platforms: [],
    };

    const result = await scrapeJobs(config);

    expect(result).toHaveProperty("totalFound");
    expect(result).toHaveProperty("newJobs");
    expect(result).toHaveProperty("updatedJobs");
    expect(result.totalFound).toBe(0);
  });

  it("should return proper result structure", async () => {
    const config: ScraperConfig = {
      keywords: ["test"],
      locations: ["test"],
      industries: ["test"],
      platforms: ["indeed"],
    };

    const result = await scrapeJobs(config);

    expect(result).toHaveProperty("totalFound");
    expect(result).toHaveProperty("newJobs");
    expect(result).toHaveProperty("updatedJobs");
    expect(typeof result.totalFound).toBe("number");
    expect(typeof result.newJobs).toBe("number");
    expect(typeof result.updatedJobs).toBe("number");
  });
});
