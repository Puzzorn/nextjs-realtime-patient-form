import { PatientDTO } from "@/domain/schemas/patientSchema";

const DRAFT_KEY = "patient_form_draft";

export const draftRepository = {
  saveLocalDraft(data: Partial<PatientDTO>): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    }
  },

  getLocalDraft(): Partial<PatientDTO> | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  clearLocalDraft(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DRAFT_KEY);
    }
  },
};
