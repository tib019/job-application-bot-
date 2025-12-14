CREATE TABLE `application_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `application_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobPostingId` int NOT NULL,
	`cvDocumentId` int,
	`coverLetter` text,
	`status` enum('pending','submitted','in_review','interview_scheduled','rejected','accepted','withdrawn','failed') NOT NULL DEFAULT 'pending',
	`submittedAt` timestamp,
	`responseReceivedAt` timestamp,
	`notes` text,
	`errorMessage` text,
	`retryCount` int DEFAULT 0,
	`lastRetryAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cover_letter_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`industry` varchar(255),
	`isDefault` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cover_letter_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cv_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` text NOT NULL,
	`mimeType` varchar(100),
	`fileSize` int,
	`industry` varchar(255),
	`isDefault` boolean DEFAULT false,
	`atsOptimized` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cv_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_postings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalId` varchar(255) NOT NULL,
	`platform` varchar(100) NOT NULL,
	`title` varchar(500) NOT NULL,
	`company` varchar(255),
	`location` varchar(255),
	`description` text,
	`requirements` text,
	`salary` varchar(255),
	`employmentType` varchar(100),
	`industry` varchar(255),
	`url` text NOT NULL,
	`postedDate` timestamp,
	`expiryDate` timestamp,
	`hasAts` boolean DEFAULT false,
	`atsSystem` varchar(100),
	`relevanceScore` int,
	`status` enum('new','reviewed','applied','ignored','expired') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_postings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduler_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runType` varchar(100) NOT NULL,
	`status` enum('running','completed','failed') NOT NULL DEFAULT 'running',
	`jobsFound` int DEFAULT 0,
	`applicationsSubmitted` int DEFAULT 0,
	`errors` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`duration` int,
	CONSTRAINT `scheduler_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `search_configurations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`industries` text,
	`keywords` text,
	`locations` text,
	`platforms` text,
	`minSalary` int,
	`maxSalary` int,
	`experienceLevel` varchar(100),
	`employmentType` varchar(100),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `search_configurations_id` PRIMARY KEY(`id`)
);
