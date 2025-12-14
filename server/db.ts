import { eq, desc, and, or, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  cvDocuments,
  InsertCvDocument,
  CvDocument,
  coverLetterTemplates,
  InsertCoverLetterTemplate,
  CoverLetterTemplate,
  searchConfigurations,
  InsertSearchConfiguration,
  SearchConfiguration,
  jobPostings,
  InsertJobPosting,
  JobPosting,
  applications,
  InsertApplication,
  Application,
  applicationLogs,
  InsertApplicationLog,
  ApplicationLog,
  schedulerRuns,
  InsertSchedulerRun,
  SchedulerRun,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ========== USER OPERATIONS ==========

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== CV DOCUMENT OPERATIONS ==========

export async function createCvDocument(cv: InsertCvDocument): Promise<CvDocument> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(cvDocuments).values(cv);
  const inserted = await db
    .select()
    .from(cvDocuments)
    .where(eq(cvDocuments.id, Number(result[0].insertId)))
    .limit(1);

  return inserted[0]!;
}

export async function getCvDocumentsByUserId(userId: number): Promise<CvDocument[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(cvDocuments).where(eq(cvDocuments.userId, userId)).orderBy(desc(cvDocuments.createdAt));
}

export async function getCvDocumentById(id: number): Promise<CvDocument | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(cvDocuments).where(eq(cvDocuments.id, id)).limit(1);
  return result[0];
}

export async function updateCvDocument(id: number, updates: Partial<InsertCvDocument>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(cvDocuments).set(updates).where(eq(cvDocuments.id, id));
}

export async function deleteCvDocument(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(cvDocuments).where(eq(cvDocuments.id, id));
}

export async function getDefaultCvDocument(userId: number): Promise<CvDocument | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(cvDocuments)
    .where(and(eq(cvDocuments.userId, userId), eq(cvDocuments.isDefault, true)))
    .limit(1);

  return result[0];
}

// ========== COVER LETTER TEMPLATE OPERATIONS ==========

export async function createCoverLetterTemplate(template: InsertCoverLetterTemplate): Promise<CoverLetterTemplate> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(coverLetterTemplates).values(template);
  const inserted = await db
    .select()
    .from(coverLetterTemplates)
    .where(eq(coverLetterTemplates.id, Number(result[0].insertId)))
    .limit(1);

  return inserted[0]!;
}

export async function getCoverLetterTemplatesByUserId(userId: number): Promise<CoverLetterTemplate[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(coverLetterTemplates)
    .where(eq(coverLetterTemplates.userId, userId))
    .orderBy(desc(coverLetterTemplates.createdAt));
}

export async function getCoverLetterTemplateById(id: number): Promise<CoverLetterTemplate | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(coverLetterTemplates).where(eq(coverLetterTemplates.id, id)).limit(1);
  return result[0];
}

export async function updateCoverLetterTemplate(id: number, updates: Partial<InsertCoverLetterTemplate>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(coverLetterTemplates).set(updates).where(eq(coverLetterTemplates.id, id));
}

export async function deleteCoverLetterTemplate(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(coverLetterTemplates).where(eq(coverLetterTemplates.id, id));
}

export async function getDefaultCoverLetterTemplate(userId: number): Promise<CoverLetterTemplate | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(coverLetterTemplates)
    .where(and(eq(coverLetterTemplates.userId, userId), eq(coverLetterTemplates.isDefault, true)))
    .limit(1);

  return result[0];
}

// ========== SEARCH CONFIGURATION OPERATIONS ==========

export async function createSearchConfiguration(config: InsertSearchConfiguration): Promise<SearchConfiguration> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(searchConfigurations).values(config);
  const inserted = await db
    .select()
    .from(searchConfigurations)
    .where(eq(searchConfigurations.id, Number(result[0].insertId)))
    .limit(1);

  return inserted[0]!;
}

export async function getSearchConfigurationsByUserId(userId: number): Promise<SearchConfiguration[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(searchConfigurations)
    .where(eq(searchConfigurations.userId, userId))
    .orderBy(desc(searchConfigurations.createdAt));
}

export async function getActiveSearchConfigurations(userId: number): Promise<SearchConfiguration[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(searchConfigurations)
    .where(and(eq(searchConfigurations.userId, userId), eq(searchConfigurations.isActive, true)))
    .orderBy(desc(searchConfigurations.createdAt));
}

export async function updateSearchConfiguration(id: number, updates: Partial<InsertSearchConfiguration>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(searchConfigurations).set(updates).where(eq(searchConfigurations.id, id));
}

export async function deleteSearchConfiguration(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(searchConfigurations).where(eq(searchConfigurations.id, id));
}

// ========== JOB POSTING OPERATIONS ==========

export async function createJobPosting(job: InsertJobPosting): Promise<JobPosting> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(jobPostings).values(job);
  const inserted = await db
    .select()
    .from(jobPostings)
    .where(eq(jobPostings.id, Number(result[0].insertId)))
    .limit(1);

  return inserted[0]!;
}

export async function getJobPostingByExternalId(platform: string, externalId: string): Promise<JobPosting | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(jobPostings)
    .where(and(eq(jobPostings.platform, platform), eq(jobPostings.externalId, externalId)))
    .limit(1);

  return result[0];
}

export async function getJobPostingById(id: number): Promise<JobPosting | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(jobPostings).where(eq(jobPostings.id, id)).limit(1);
  return result[0];
}

export async function getJobPostings(filters?: {
  status?: string[];
  platform?: string;
  limit?: number;
  offset?: number;
}): Promise<JobPosting[]> {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(jobPostings);

  const conditions = [];
  if (filters?.status && filters.status.length > 0) {
    conditions.push(inArray(jobPostings.status, filters.status as any));
  }
  if (filters?.platform) {
    conditions.push(eq(jobPostings.platform, filters.platform));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  query = query.orderBy(desc(jobPostings.createdAt)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return query;
}

export async function updateJobPosting(id: number, updates: Partial<InsertJobPosting>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(jobPostings).set(updates).where(eq(jobPostings.id, id));
}

export async function getJobPostingStats(): Promise<{
  total: number;
  new: number;
  applied: number;
  ignored: number;
}> {
  const db = await getDb();
  if (!db) return { total: 0, new: 0, applied: 0, ignored: 0 };

  const result = await db
    .select({
      status: jobPostings.status,
      count: sql<number>`count(*)`,
    })
    .from(jobPostings)
    .groupBy(jobPostings.status);

  const stats = { total: 0, new: 0, applied: 0, ignored: 0 };
  result.forEach((row) => {
    const count = Number(row.count);
    stats.total += count;
    if (row.status === "new") stats.new = count;
    if (row.status === "applied") stats.applied = count;
    if (row.status === "ignored") stats.ignored = count;
  });

  return stats;
}

// ========== APPLICATION OPERATIONS ==========

export async function createApplication(application: InsertApplication): Promise<Application> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(applications).values(application);
  const inserted = await db
    .select()
    .from(applications)
    .where(eq(applications.id, Number(result[0].insertId)))
    .limit(1);

  return inserted[0]!;
}

export async function getApplicationsByUserId(userId: number, limit?: number): Promise<Application[]> {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(applications).where(eq(applications.userId, userId)).orderBy(desc(applications.createdAt));

  if (limit) {
    query = query.limit(limit) as any;
  }

  return query;
}

export async function getApplicationById(id: number): Promise<Application | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  return result[0];
}

export async function updateApplication(id: number, updates: Partial<InsertApplication>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(applications).set(updates).where(eq(applications.id, id));
}

export async function getApplicationStats(userId: number): Promise<{
  total: number;
  pending: number;
  submitted: number;
  rejected: number;
  accepted: number;
}> {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, submitted: 0, rejected: 0, accepted: 0 };

  const result = await db
    .select({
      status: applications.status,
      count: sql<number>`count(*)`,
    })
    .from(applications)
    .where(eq(applications.userId, userId))
    .groupBy(applications.status);

  const stats = { total: 0, pending: 0, submitted: 0, rejected: 0, accepted: 0 };
  result.forEach((row) => {
    const count = Number(row.count);
    stats.total += count;
    if (row.status === "pending") stats.pending = count;
    if (row.status === "submitted") stats.submitted = count;
    if (row.status === "rejected") stats.rejected = count;
    if (row.status === "accepted") stats.accepted = count;
  });

  return stats;
}

// ========== APPLICATION LOG OPERATIONS ==========

export async function createApplicationLog(log: InsertApplicationLog): Promise<ApplicationLog> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(applicationLogs).values(log);
  const inserted = await db
    .select()
    .from(applicationLogs)
    .where(eq(applicationLogs.id, Number(result[0].insertId)))
    .limit(1);

  return inserted[0]!;
}

export async function getApplicationLogsByApplicationId(applicationId: number): Promise<ApplicationLog[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(applicationLogs)
    .where(eq(applicationLogs.applicationId, applicationId))
    .orderBy(desc(applicationLogs.createdAt));
}

// ========== SCHEDULER RUN OPERATIONS ==========

export async function createSchedulerRun(run: InsertSchedulerRun): Promise<SchedulerRun> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(schedulerRuns).values(run);
  const inserted = await db
    .select()
    .from(schedulerRuns)
    .where(eq(schedulerRuns.id, Number(result[0].insertId)))
    .limit(1);

  return inserted[0]!;
}

export async function updateSchedulerRun(id: number, updates: Partial<InsertSchedulerRun>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(schedulerRuns).set(updates).where(eq(schedulerRuns.id, id));
}

export async function getRecentSchedulerRuns(limit: number = 10): Promise<SchedulerRun[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(schedulerRuns).orderBy(desc(schedulerRuns.startedAt)).limit(limit);
}
