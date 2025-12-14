import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * CV documents storage metadata
 */
export const cvDocuments = mysqlTable("cv_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  industry: varchar("industry", { length: 255 }),
  isDefault: boolean("isDefault").default(false),
  atsOptimized: boolean("atsOptimized").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CvDocument = typeof cvDocuments.$inferSelect;
export type InsertCvDocument = typeof cvDocuments.$inferInsert;

/**
 * Cover letter templates
 */
export const coverLetterTemplates = mysqlTable("cover_letter_templates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  content: text("content").notNull(),
  industry: varchar("industry", { length: 255 }),
  isDefault: boolean("isDefault").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoverLetterTemplate = typeof coverLetterTemplates.$inferSelect;
export type InsertCoverLetterTemplate = typeof coverLetterTemplates.$inferInsert;

/**
 * Job search configurations
 */
export const searchConfigurations = mysqlTable("search_configurations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  industries: text("industries"),
  keywords: text("keywords"),
  locations: text("locations"),
  platforms: text("platforms"),
  minSalary: int("minSalary"),
  maxSalary: int("maxSalary"),
  experienceLevel: varchar("experienceLevel", { length: 100 }),
  employmentType: varchar("employmentType", { length: 100 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SearchConfiguration = typeof searchConfigurations.$inferSelect;
export type InsertSearchConfiguration = typeof searchConfigurations.$inferInsert;

/**
 * Job postings discovered by scrapers
 */
export const jobPostings = mysqlTable("job_postings", {
  id: int("id").autoincrement().primaryKey(),
  externalId: varchar("externalId", { length: 255 }).notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  company: varchar("company", { length: 255 }),
  location: varchar("location", { length: 255 }),
  description: text("description"),
  requirements: text("requirements"),
  salary: varchar("salary", { length: 255 }),
  employmentType: varchar("employmentType", { length: 100 }),
  industry: varchar("industry", { length: 255 }),
  url: text("url").notNull(),
  postedDate: timestamp("postedDate"),
  expiryDate: timestamp("expiryDate"),
  hasAts: boolean("hasAts").default(false),
  atsSystem: varchar("atsSystem", { length: 100 }),
  relevanceScore: int("relevanceScore"),
  status: mysqlEnum("status", ["new", "reviewed", "applied", "ignored", "expired"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobPosting = typeof jobPostings.$inferSelect;
export type InsertJobPosting = typeof jobPostings.$inferInsert;

/**
 * Job applications tracking
 */
export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  jobPostingId: int("jobPostingId").notNull(),
  cvDocumentId: int("cvDocumentId"),
  coverLetter: text("coverLetter"),
  status: mysqlEnum("status", [
    "pending",
    "submitted",
    "in_review",
    "interview_scheduled",
    "rejected",
    "accepted",
    "withdrawn",
    "failed"
  ]).default("pending").notNull(),
  submittedAt: timestamp("submittedAt"),
  responseReceivedAt: timestamp("responseReceivedAt"),
  notes: text("notes"),
  errorMessage: text("errorMessage"),
  retryCount: int("retryCount").default(0),
  lastRetryAt: timestamp("lastRetryAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

/**
 * Application activity log
 */
export const applicationLogs = mysqlTable("application_logs", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApplicationLog = typeof applicationLogs.$inferSelect;
export type InsertApplicationLog = typeof applicationLogs.$inferInsert;

/**
 * Scheduler job runs tracking
 */
export const schedulerRuns = mysqlTable("scheduler_runs", {
  id: int("id").autoincrement().primaryKey(),
  runType: varchar("runType", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["running", "completed", "failed"]).default("running").notNull(),
  jobsFound: int("jobsFound").default(0),
  applicationsSubmitted: int("applicationsSubmitted").default(0),
  errors: text("errors"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  duration: int("duration"),
});

export type SchedulerRun = typeof schedulerRuns.$inferSelect;
export type InsertSchedulerRun = typeof schedulerRuns.$inferInsert;
