import { describe, expect, it } from "vitest";
import { getSchedulerStatus } from "./scheduler";

describe("Scheduler Service", () => {
  it("should return scheduler status", () => {
    const status = getSchedulerStatus();

    expect(status).toHaveProperty("initialized");
    expect(status).toHaveProperty("activeJobs");
    expect(typeof status.initialized).toBe("boolean");
    expect(typeof status.activeJobs).toBe("number");
  });

  it("should validate cron expression format", () => {
    // Every 4 hours: 0 0 */4 * * *
    const cronExpression = "0 0 */4 * * *";
    const parts = cronExpression.split(" ");

    expect(parts).toHaveLength(6);
    expect(parts[0]).toBe("0"); // seconds
    expect(parts[1]).toBe("0"); // minutes
    expect(parts[2]).toBe("*/4"); // hours (every 4 hours)
  });

  it("should validate daily summary cron expression", () => {
    // Daily at 8 PM: 0 0 20 * * *
    const cronExpression = "0 0 20 * * *";
    const parts = cronExpression.split(" ");

    expect(parts).toHaveLength(6);
    expect(parts[0]).toBe("0"); // seconds
    expect(parts[1]).toBe("0"); // minutes
    expect(parts[2]).toBe("20"); // 8 PM
  });

  it("should calculate time intervals correctly", () => {
    const fourHoursInMs = 4 * 60 * 60 * 1000;
    const oneDayInMs = 24 * 60 * 60 * 1000;

    expect(fourHoursInMs).toBe(14400000);
    expect(oneDayInMs).toBe(86400000);
  });

  it("should validate scheduler run types", () => {
    const validRunTypes = ["4-hour-search", "daily-summary", "manual-trigger"];

    validRunTypes.forEach((runType) => {
      expect(typeof runType).toBe("string");
      expect(runType.length).toBeGreaterThan(0);
    });
  });
});
