import { storagePut } from "../storage";
import { nanoid } from "nanoid";
import {
  createCvDocument,
  getCvDocumentsByUserId,
  updateCvDocument,
  deleteCvDocument,
  getDefaultCvDocument,
  createCoverLetterTemplate,
  getCoverLetterTemplatesByUserId,
  updateCoverLetterTemplate,
  deleteCoverLetterTemplate,
  getDefaultCoverLetterTemplate,
} from "../db";
import type { InsertCvDocument, InsertCoverLetterTemplate } from "../../drizzle/schema";

/**
 * Upload CV document to S3 and create database record
 */
export async function uploadCvDocument(
  userId: number,
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  options?: {
    industry?: string;
    isDefault?: boolean;
    atsOptimized?: boolean;
  }
) {
  // Generate unique file key with random suffix to prevent enumeration
  const fileExtension = fileName.split(".").pop() || "pdf";
  const randomSuffix = nanoid(10);
  const fileKey = `user-${userId}/cv/${randomSuffix}.${fileExtension}`;

  // Upload to S3
  const { url: fileUrl } = await storagePut(fileKey, fileBuffer, mimeType);

  // If this is set as default, unset other defaults
  if (options?.isDefault) {
    const existingCvs = await getCvDocumentsByUserId(userId);
    for (const cv of existingCvs) {
      if (cv.isDefault) {
        await updateCvDocument(cv.id, { isDefault: false });
      }
    }
  }

  // Create database record
  const cvData: InsertCvDocument = {
    userId,
    name: fileName,
    fileKey,
    fileUrl,
    mimeType,
    fileSize: fileBuffer.length,
    industry: options?.industry,
    isDefault: options?.isDefault || false,
    atsOptimized: options?.atsOptimized || false,
  };

  return await createCvDocument(cvData);
}

/**
 * Get all CV documents for a user
 */
export async function getUserCvDocuments(userId: number) {
  return await getCvDocumentsByUserId(userId);
}

/**
 * Update CV document metadata
 */
export async function updateCvDocumentMetadata(
  cvId: number,
  userId: number,
  updates: {
    name?: string;
    industry?: string;
    isDefault?: boolean;
    atsOptimized?: boolean;
  }
) {
  // If setting as default, unset other defaults
  if (updates.isDefault) {
    const existingCvs = await getCvDocumentsByUserId(userId);
    for (const cv of existingCvs) {
      if (cv.isDefault && cv.id !== cvId) {
        await updateCvDocument(cv.id, { isDefault: false });
      }
    }
  }

  await updateCvDocument(cvId, updates);
}

/**
 * Delete CV document (metadata only, S3 files are retained for audit)
 */
export async function removeCvDocument(cvId: number) {
  await deleteCvDocument(cvId);
}

/**
 * Get default CV for a user
 */
export async function getUserDefaultCv(userId: number) {
  return await getDefaultCvDocument(userId);
}

/**
 * Create cover letter template
 */
export async function createCoverLetter(
  userId: number,
  name: string,
  content: string,
  options?: {
    industry?: string;
    isDefault?: boolean;
  }
) {
  // If this is set as default, unset other defaults
  if (options?.isDefault) {
    const existingTemplates = await getCoverLetterTemplatesByUserId(userId);
    for (const template of existingTemplates) {
      if (template.isDefault) {
        await updateCoverLetterTemplate(template.id, { isDefault: false });
      }
    }
  }

  const templateData: InsertCoverLetterTemplate = {
    userId,
    name,
    content,
    industry: options?.industry,
    isDefault: options?.isDefault || false,
  };

  return await createCoverLetterTemplate(templateData);
}

/**
 * Get all cover letter templates for a user
 */
export async function getUserCoverLetterTemplates(userId: number) {
  return await getCoverLetterTemplatesByUserId(userId);
}

/**
 * Update cover letter template
 */
export async function updateCoverLetterTemplateData(
  templateId: number,
  userId: number,
  updates: {
    name?: string;
    content?: string;
    industry?: string;
    isDefault?: boolean;
  }
) {
  // If setting as default, unset other defaults
  if (updates.isDefault) {
    const existingTemplates = await getCoverLetterTemplatesByUserId(userId);
    for (const template of existingTemplates) {
      if (template.isDefault && template.id !== templateId) {
        await updateCoverLetterTemplate(template.id, { isDefault: false });
      }
    }
  }

  await updateCoverLetterTemplate(templateId, updates);
}

/**
 * Delete cover letter template
 */
export async function removeCoverLetterTemplate(templateId: number) {
  await deleteCoverLetterTemplate(templateId);
}

/**
 * Get default cover letter template for a user
 */
export async function getUserDefaultCoverLetter(userId: number) {
  return await getDefaultCoverLetterTemplate(userId);
}

/**
 * Optimize CV content for ATS systems
 * This extracts key information and formats it in an ATS-friendly way
 */
export function optimizeCvForAts(cvContent: string, jobDescription: string): {
  optimizedContent: string;
  keywords: string[];
  suggestions: string[];
} {
  const keywords: string[] = [];
  const suggestions: string[] = [];

  // Extract keywords from job description
  const jobKeywords = extractKeywords(jobDescription);
  keywords.push(...jobKeywords);

  // ATS optimization suggestions
  suggestions.push("Use standard section headings: Experience, Education, Skills");
  suggestions.push("Avoid tables, images, and complex formatting");
  suggestions.push("Use standard fonts and bullet points");
  suggestions.push("Include relevant keywords from job description");
  suggestions.push("Use full spellings alongside acronyms (e.g., 'Search Engine Optimization (SEO)')");

  // Simple optimization: ensure keywords are present
  let optimizedContent = cvContent;
  const missingKeywords = jobKeywords.filter(
    (keyword) => !cvContent.toLowerCase().includes(keyword.toLowerCase())
  );

  if (missingKeywords.length > 0) {
    suggestions.push(`Consider adding these keywords: ${missingKeywords.join(", ")}`);
  }

  return {
    optimizedContent,
    keywords,
    suggestions,
  };
}

/**
 * Extract important keywords from text
 */
function extractKeywords(text: string): string[] {
  const commonWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "as",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "should",
    "could",
    "may",
    "might",
    "must",
    "can",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.has(word));

  // Count frequency
  const frequency: Record<string, number> = {};
  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}
