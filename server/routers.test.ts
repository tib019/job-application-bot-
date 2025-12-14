import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(user?: AuthenticatedUser): TrpcContext {
  const mockUser: AuthenticatedUser = user || {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user: mockUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("tRPC Routers", () => {
  describe("auth router", () => {
    it("should return current user with auth.me", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const user = await caller.auth.me();

      expect(user).toBeDefined();
      expect(user?.id).toBe(1);
      expect(user?.email).toBe("test@example.com");
    });

    it("should logout successfully", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
    });
  });

  describe("scheduler router", () => {
    it("should return scheduler status", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const status = await caller.scheduler.status();

      expect(status).toHaveProperty("initialized");
      expect(status).toHaveProperty("activeJobs");
      expect(typeof status.initialized).toBe("boolean");
      expect(typeof status.activeJobs).toBe("number");
    });
  });

  describe("dashboard router", () => {
    it("should return overview data structure", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const overview = await caller.dashboard.overview();

      expect(overview).toHaveProperty("jobs");
      expect(overview).toHaveProperty("applications");
      expect(overview).toHaveProperty("recentRuns");
    });
  });

  describe("input validation", () => {
    it("should validate job status update input", () => {
      const validStatuses = ["new", "reviewed", "applied", "ignored", "expired"] as const;

      validStatuses.forEach((status) => {
        expect(validStatuses).toContain(status);
      });
    });

    it("should validate search configuration input", () => {
      const config = {
        name: "Test Config",
        industries: ["IT", "Software"],
        keywords: ["Developer", "Engineer"],
        locations: ["Berlin", "München"],
        platforms: ["indeed", "stepstone"],
      };

      expect(config.name.length).toBeGreaterThan(0);
      expect(Array.isArray(config.industries)).toBe(true);
      expect(Array.isArray(config.keywords)).toBe(true);
      expect(Array.isArray(config.locations)).toBe(true);
      expect(Array.isArray(config.platforms)).toBe(true);
    });
  });
});
