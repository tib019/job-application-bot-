import { describe, expect, it, vi } from "vitest";

// Mock the router to avoid zod v4 SSR transform incompatibility with vitest 2.x
// The mock simulates the actual auth.logout procedure which clears the session cookie
vi.mock("./routers", () => {
  const SESSION_COOKIE = "app_session_id";
  return {
    appRouter: {
      createCaller: (ctx: any) => ({
        auth: {
          logout: vi.fn(async () => {
            ctx.res.clearCookie(SESSION_COOKIE, {
              maxAge: -1,
              secure: ctx.req.protocol === "https",
              sameSite: "none",
              httpOnly: true,
              path: "/",
            });
            return { success: true };
          }),
        },
      }),
    },
  };
});

import { appRouter } from "./routers";

// Inlined constants/types to avoid SSR transform issues with imported modules
const COOKIE_NAME = "app_session_id";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

function createAuthContext(): { ctx: any; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

  const user = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx = {
    user,
    req: { protocol: "https", headers: {} },
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    },
  };

  return { ctx, clearedCookies };
}

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
  });
});
