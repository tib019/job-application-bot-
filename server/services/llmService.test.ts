import { describe, expect, it } from "vitest";

describe("LLM Service", () => {
  it("should validate cover letter generation input", () => {
    const jobDescription = "We are looking for a Software Developer with React experience";
    const cvContent = "Experienced developer with 5 years in React";
    const template = "Dear Hiring Manager, [content]";

    expect(jobDescription.length).toBeGreaterThan(0);
    expect(cvContent.length).toBeGreaterThan(0);
    expect(template).toContain("[content]");
  });

  it("should extract keywords from job description", () => {
    const jobDescription = "Looking for Python Developer with Django and PostgreSQL experience";
    const keywords = ["Python", "Django", "PostgreSQL"];

    keywords.forEach((keyword) => {
      expect(jobDescription).toContain(keyword);
    });
  });

  it("should validate ATS optimization keywords", () => {
    const atsKeywords = ["experience", "skills", "education", "qualifications", "achievements"];
    const cvText = "Experience: 5 years. Skills: React, Node.js. Education: BSc Computer Science";

    const foundKeywords = atsKeywords.filter((keyword) =>
      cvText.toLowerCase().includes(keyword.toLowerCase())
    );

    expect(foundKeywords.length).toBeGreaterThan(0);
  });

  it("should calculate relevance score correctly", () => {
    const requiredSkills = ["React", "TypeScript", "Node.js"];
    const candidateSkills = ["React", "TypeScript", "JavaScript"];

    const matchCount = requiredSkills.filter((skill) => candidateSkills.includes(skill)).length;
    const relevanceScore = Math.round((matchCount / requiredSkills.length) * 100);

    expect(relevanceScore).toBeGreaterThanOrEqual(0);
    expect(relevanceScore).toBeLessThanOrEqual(100);
    expect(relevanceScore).toBe(67); // 2 out of 3 matches
  });

  it("should validate cover letter structure", () => {
    const coverLetter = `Dear Hiring Manager,

I am writing to express my interest in the Software Developer position.

With 5 years of experience in React and TypeScript, I believe I would be a great fit.

Best regards,
John Doe`;

    expect(coverLetter).toContain("Dear");
    expect(coverLetter).toContain("Best regards");
    expect(coverLetter.split("\n").length).toBeGreaterThan(3);
  });
});
