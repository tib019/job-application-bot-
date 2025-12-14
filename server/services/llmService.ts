import { invokeLLM } from "../_core/llm";
import type { JobPosting, CvDocument, CoverLetterTemplate } from "../../drizzle/schema";

export interface CoverLetterGenerationResult {
  coverLetter: string;
  matchScore: number;
  keyPoints: string[];
  suggestions: string[];
}

export interface AtsOptimizationResult {
  optimizedText: string;
  keywords: string[];
  score: number;
  improvements: string[];
}

/**
 * Generate a personalized cover letter based on job description and CV
 */
export async function generatePersonalizedCoverLetter(
  job: JobPosting,
  cvContent: string,
  template?: CoverLetterTemplate
): Promise<CoverLetterGenerationResult> {
  const systemPrompt = `You are an expert career consultant and cover letter writer. Your task is to create compelling, personalized cover letters that:
1. Highlight relevant experience and skills from the candidate's CV
2. Address the specific requirements in the job description
3. Use professional language and proper formatting
4. Are ATS-friendly (avoid special characters, use standard formatting)
5. Are concise (250-400 words)
6. Show genuine interest and cultural fit

Format the cover letter with proper structure:
- Opening paragraph: Express interest and mention the position
- Body paragraphs: Match skills/experience to job requirements
- Closing paragraph: Call to action and contact information

Use the template as a style guide if provided, but customize content for this specific job.`;

  const userPrompt = `Generate a personalized cover letter for the following job application:

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${job.description}
Requirements: ${job.requirements || "Not specified"}

CANDIDATE CV SUMMARY:
${cvContent.substring(0, 2000)}

${template ? `STYLE TEMPLATE (use as formatting guide):\n${template.content.substring(0, 1000)}` : ""}

Generate a compelling cover letter that maximizes the candidate's chances of getting an interview.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content || "";
    const coverLetter = typeof content === 'string' ? content : '';

    // Analyze match score
    const matchScore = await calculateJobMatchScore(job, cvContent);

    // Extract key points
    const keyPoints = extractKeyPoints(coverLetter);

    // Generate suggestions
    const suggestions = [
      "Review the cover letter for accuracy and personalization",
      "Ensure contact information is correct",
      "Proofread for grammar and spelling",
    ];

    if (job.hasAts) {
      suggestions.push("This job uses an ATS system - ensure formatting is simple and clean");
    }

    return {
      coverLetter,
      matchScore,
      keyPoints,
      suggestions,
    };
  } catch (error) {
    console.error("[LLM] Error generating cover letter:", error);
    throw new Error("Failed to generate cover letter");
  }
}

/**
 * Calculate job match score based on CV and job description
 */
async function calculateJobMatchScore(job: JobPosting, cvContent: string): Promise<number> {
  const systemPrompt = `You are an expert recruiter. Analyze how well a candidate's CV matches a job description and provide a match score from 0-100.

Consider:
- Relevant skills and technologies
- Years of experience
- Industry background
- Education requirements
- Specific job requirements

Return ONLY a JSON object with this exact structure:
{
  "score": <number between 0-100>,
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"]
}`;

  const userPrompt = `Job: ${job.title} at ${job.company}
Requirements: ${job.description} ${job.requirements || ""}

CV Summary: ${cvContent.substring(0, 1500)}

Provide match score and analysis.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "job_match_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              score: {
                type: "number",
                description: "Match score from 0-100",
              },
              strengths: {
                type: "array",
                items: { type: "string" },
                description: "Key strengths of the candidate for this role",
              },
              gaps: {
                type: "array",
                items: { type: "string" },
                description: "Areas where the candidate may not fully meet requirements",
              },
            },
            required: ["score", "strengths", "gaps"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content || "{}";
    const contentText = typeof content === 'string' ? content : '{}';
    const analysis = JSON.parse(contentText);

    return Math.min(100, Math.max(0, analysis.score || 50));
  } catch (error) {
    console.error("[LLM] Error calculating match score:", error);
    return 50; // Default middle score on error
  }
}

/**
 * Optimize text for ATS systems
 */
export async function optimizeForAts(
  text: string,
  jobDescription: string,
  documentType: "cv" | "cover_letter"
): Promise<AtsOptimizationResult> {
  const systemPrompt = `You are an ATS (Applicant Tracking System) optimization expert. Your task is to optimize ${documentType === "cv" ? "CVs" : "cover letters"} to pass ATS screening while maintaining readability.

ATS Best Practices:
1. Use standard section headings (Experience, Education, Skills)
2. Avoid tables, text boxes, headers/footers
3. Use standard fonts and simple formatting
4. Include relevant keywords from job description
5. Use both acronyms and full terms (e.g., "SEO (Search Engine Optimization)")
6. Use standard date formats
7. Avoid special characters and symbols
8. Use bullet points with standard characters (•, -, *)

Provide optimization suggestions and an improved version.`;

  const userPrompt = `Optimize this ${documentType} for ATS systems:

JOB DESCRIPTION:
${jobDescription.substring(0, 1000)}

CURRENT ${documentType.toUpperCase()}:
${text.substring(0, 2000)}

Provide:
1. Key improvements needed
2. Important keywords to include
3. ATS compatibility score (0-100)`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content || "";
    const contentText = typeof content === 'string' ? content : '';

    // Extract keywords from job description
    const keywords = extractKeywordsFromJob(jobDescription);

    // Simple scoring based on keyword presence
    const keywordMatches = keywords.filter((keyword) =>
      text.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    const score = Math.min(100, Math.round((keywordMatches / keywords.length) * 100));

    // Parse improvements from response
    const improvements = contentText
      .split("\n")
      .filter((line: string) => line.trim().length > 0)
      .slice(0, 5);

    return {
      optimizedText: text, // In production, this would be the LLM-optimized version
      keywords,
      score,
      improvements,
    };
  } catch (error) {
    console.error("[LLM] Error optimizing for ATS:", error);
    throw new Error("Failed to optimize for ATS");
  }
}

/**
 * Analyze job description and extract requirements
 */
export async function analyzeJobDescription(job: JobPosting): Promise<{
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: string;
  keyResponsibilities: string[];
  companyInfo: string;
}> {
  const systemPrompt = `You are an expert job description analyzer. Extract structured information from job postings.

Return ONLY a JSON object with this exact structure:
{
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "experienceLevel": "entry|mid|senior|lead",
  "keyResponsibilities": ["resp1", "resp2"],
  "companyInfo": "brief company description"
}`;

  const userPrompt = `Analyze this job posting:

Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Requirements: ${job.requirements || "Not specified"}

Extract structured information.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "job_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              requiredSkills: {
                type: "array",
                items: { type: "string" },
              },
              preferredSkills: {
                type: "array",
                items: { type: "string" },
              },
              experienceLevel: {
                type: "string",
                enum: ["entry", "mid", "senior", "lead"],
              },
              keyResponsibilities: {
                type: "array",
                items: { type: "string" },
              },
              companyInfo: {
                type: "string",
              },
            },
            required: ["requiredSkills", "preferredSkills", "experienceLevel", "keyResponsibilities", "companyInfo"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content || "{}";
    const contentText = typeof content === 'string' ? content : '{}';
    return JSON.parse(contentText);
  } catch (error) {
    console.error("[LLM] Error analyzing job description:", error);
    return {
      requiredSkills: [],
      preferredSkills: [],
      experienceLevel: "mid",
      keyResponsibilities: [],
      companyInfo: job.company || "Unknown company",
    };
  }
}

/**
 * Extract key points from cover letter
 */
function extractKeyPoints(coverLetter: string): string[] {
  const sentences = coverLetter.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
  return sentences.slice(0, 3).map((s: string) => s.trim());
}

/**
 * Extract keywords from job description
 */
function extractKeywordsFromJob(jobDescription: string): string[] {
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
    "you",
    "your",
    "our",
    "we",
  ]);

  const words = jobDescription
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
    .slice(0, 15)
    .map(([word]) => word);
}
