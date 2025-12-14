import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getCvDocumentsByUserId,
  getCvDocumentById,
  updateCvDocument,
  deleteCvDocument,
  getCoverLetterTemplatesByUserId,
  getCoverLetterTemplateById,
  updateCoverLetterTemplate,
  deleteCoverLetterTemplate,
  getSearchConfigurationsByUserId,
  createSearchConfiguration,
  updateSearchConfiguration,
  deleteSearchConfiguration,
  getJobPostings,
  getJobPostingStats,
  getApplicationsByUserId,
  getApplicationById,
  getApplicationStats,
  getApplicationLogsByApplicationId,
  getRecentSchedulerRuns,
  updateJobPosting,
} from "./db";
import {
  uploadCvDocument,
  createCoverLetter,
  updateCvDocumentMetadata,
  updateCoverLetterTemplateData,
} from "./services/documentManager";
import { applyToJob } from "./services/applicationAutomation";
import { triggerManualRun, getSchedulerStatus } from "./services/scheduler";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // CV Management
  cv: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getCvDocumentsByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getCvDocumentById(input.id);
      }),

    upload: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileData: z.string(), // base64 encoded
          mimeType: z.string(),
          industry: z.string().optional(),
          isDefault: z.boolean().optional(),
          atsOptimized: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const fileBuffer = Buffer.from(input.fileData, "base64");
        return await uploadCvDocument(ctx.user.id, fileBuffer, input.fileName, input.mimeType, {
          industry: input.industry,
          isDefault: input.isDefault,
          atsOptimized: input.atsOptimized,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          industry: z.string().optional(),
          isDefault: z.boolean().optional(),
          atsOptimized: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        await updateCvDocumentMetadata(id, ctx.user.id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCvDocument(input.id);
        return { success: true };
      }),
  }),

  // Cover Letter Templates
  coverLetter: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getCoverLetterTemplatesByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getCoverLetterTemplateById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          content: z.string(),
          industry: z.string().optional(),
          isDefault: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await createCoverLetter(ctx.user.id, input.name, input.content, {
          industry: input.industry,
          isDefault: input.isDefault,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          content: z.string().optional(),
          industry: z.string().optional(),
          isDefault: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        await updateCoverLetterTemplateData(id, ctx.user.id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCoverLetterTemplate(input.id);
        return { success: true };
      }),
  }),

  // Search Configurations
  searchConfig: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getSearchConfigurationsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          industries: z.array(z.string()),
          keywords: z.array(z.string()),
          locations: z.array(z.string()),
          platforms: z.array(z.string()),
          minSalary: z.number().optional(),
          maxSalary: z.number().optional(),
          experienceLevel: z.string().optional(),
          employmentType: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await createSearchConfiguration({
          userId: ctx.user.id,
          name: input.name,
          industries: JSON.stringify(input.industries),
          keywords: JSON.stringify(input.keywords),
          locations: JSON.stringify(input.locations),
          platforms: JSON.stringify(input.platforms),
          minSalary: input.minSalary,
          maxSalary: input.maxSalary,
          experienceLevel: input.experienceLevel,
          employmentType: input.employmentType,
          isActive: input.isActive ?? true,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          industries: z.array(z.string()).optional(),
          keywords: z.array(z.string()).optional(),
          locations: z.array(z.string()).optional(),
          platforms: z.array(z.string()).optional(),
          minSalary: z.number().optional(),
          maxSalary: z.number().optional(),
          experienceLevel: z.string().optional(),
          employmentType: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        const updateData: any = { ...updates };
        
        if (updates.industries) updateData.industries = JSON.stringify(updates.industries);
        if (updates.keywords) updateData.keywords = JSON.stringify(updates.keywords);
        if (updates.locations) updateData.locations = JSON.stringify(updates.locations);
        if (updates.platforms) updateData.platforms = JSON.stringify(updates.platforms);
        
        await updateSearchConfiguration(id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSearchConfiguration(input.id);
        return { success: true };
      }),
  }),

  // Job Postings
  jobs: router({
    list: protectedProcedure
      .input(
        z.object({
          status: z.array(z.string()).optional(),
          platform: z.string().optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return await getJobPostings(input);
      }),

    stats: protectedProcedure.query(async () => {
      return await getJobPostingStats();
    }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["new", "reviewed", "applied", "ignored", "expired"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateJobPosting(input.id, { status: input.status });
        return { success: true };
      }),
  }),

  // Applications
  applications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await getApplicationsByUserId(ctx.user.id, input.limit);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getApplicationById(input.id);
      }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      return await getApplicationStats(ctx.user.id);
    }),

    logs: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .query(async ({ input }) => {
        return await getApplicationLogsByApplicationId(input.applicationId);
      }),

    submitApplication: protectedProcedure
      .input(
        z.object({
          jobPostingId: z.number(),
          cvDocumentId: z.number().optional(),
          customCoverLetter: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await applyToJob(ctx.user.id, input.jobPostingId, {
          cvDocumentId: input.cvDocumentId,
          customCoverLetter: input.customCoverLetter,
        });
      }),
  }),

  // Scheduler
  scheduler: router({
    status: protectedProcedure.query(() => {
      return getSchedulerStatus();
    }),

    runs: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await getRecentSchedulerRuns(input.limit || 10);
      }),

    triggerManual: protectedProcedure.mutation(async () => {
      return await triggerManualRun();
    }),
  }),

  // Dashboard Stats
  dashboard: router({
    overview: protectedProcedure.query(async ({ ctx }) => {
      const [jobStats, appStats, recentRuns] = await Promise.all([
        getJobPostingStats(),
        getApplicationStats(ctx.user.id),
        getRecentSchedulerRuns(5),
      ]);

      return {
        jobs: jobStats,
        applications: appStats,
        recentRuns,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
