import { describe, expect, it } from "vitest";
import {
  AI_DISCLOSURE_DE,
  AI_LEGAL_BASIS,
  aiDisclosure,
} from "./aiDisclosure";

/**
 * Art. 50 Abs. 2 KI-VO verlangt eine maschinenlesbare Kennzeichnung
 * synthetischer Inhalte. Diese Suite haelt fest, dass die Kennzeichnung die
 * dafuer noetigen Felder traegt und nicht bloss ein Freitexthinweis ist.
 */
describe("aiDisclosure", () => {
  it("weist die Ausgabe als KI-erzeugt aus", () => {
    expect(aiDisclosure("cover_letter").aiGenerated).toBe(true);
  });

  it("uebernimmt den Zweck", () => {
    expect(aiDisclosure("cover_letter").purpose).toBe("cover_letter");
  });

  it("nennt die Rechtsgrundlage", () => {
    expect(aiDisclosure("cover_letter").legalBasis).toBe(AI_LEGAL_BASIS);
    expect(AI_LEGAL_BASIS).toContain("2024/1689");
  });

  it("nennt Artikel 50 Absatz 2", () => {
    expect(aiDisclosure("cover_letter").applicableParagraphs).toContain("50(2)");
  });

  it("traegt einen maschinenlesbaren Zeitstempel in UTC", () => {
    const { generatedAt } = aiDisclosure("cover_letter");
    expect(generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T.*Z$/);
    expect(Number.isNaN(Date.parse(generatedAt))).toBe(false);
  });

  it("enthaelt den Offenlegungssatz zur Anzeige", () => {
    expect(aiDisclosure("cover_letter").disclosureDe).toBe(AI_DISCLOSURE_DE);
    expect(AI_DISCLOSURE_DE.length).toBeGreaterThan(0);
  });
});
