import { z } from "zod";

/**
 * Emergency Contact Schema
 * All fields are optional (name, relationship, phoneNumber)
 */
export const emergencyContactSchema = z.object({
  name: z.string().optional(),
  relationship: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export type EmergencyContact = z.infer<typeof emergencyContactSchema>;

/**
 * Main Patient Form Validation Schema
 * 9 Required Fields: firstName, lastName, dateOfBirth, gender, phoneNumber, email, address, preferredLanguage, nationality
 * 3 Optional Fields: middleName, emergencyContact, religion
 */
export const patientSchema = z.object({
  // Required Fields (9)
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender selection is required"),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{9,15}$/, "Phone number must contain 9 to 15 digits"),
  email: z.string().min(1, "Email is required").email("Invalid email address format"),
  address: z.string().min(1, "Address is required"),
  preferredLanguage: z.string().min(1, "Preferred language is required"),
  nationality: z.string().min(1, "Nationality is required"),

  // Optional Fields (3)
  middleName: z.string().optional(),
  emergencyContact: emergencyContactSchema.optional().nullable(),
  religion: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;

/**
 * 3-State Patient Lifecycle Status
 */
export type PatientStatus = "actively_filling_in" | "inactive" | "submitted";

export const PATIENT_STATUS = {
  ACTIVELY_FILLING_IN: "actively_filling_in",
  INACTIVE: "inactive",
  SUBMITTED: "submitted",
} as const;

/**
 * Socket DTO Interfaces for Real-Time Event Communication
 */
export interface PatientJoinPayload {
  patientId: string;
}

export interface PatientFieldUpdatePayload {
  patientId: string;
  field: keyof PatientFormData | string;
  value: unknown;
}

export interface PatientStatusChangePayload {
  patientId: string;
  status: PatientStatus;
  timestamp?: string;
}

export interface PatientSubmitPayload {
  patientId: string;
  data: PatientFormData;
  submittedAt: string;
}

export interface StaffReceiveUpdatePayload {
  patientId: string;
  field: string;
  value: unknown;
  updatedAt: string;
}

export interface StaffStatusChangePayload {
  patientId: string;
  status: PatientStatus;
  timestamp: string;
}

export interface StaffPatientSubmittedPayload {
  patientId: string;
  patient: PatientFormData;
  submittedAt: string;
  status: "submitted";
}

export interface PatientDraftSyncPayload {
  patientId: string;
  data: Partial<PatientFormData>;
  status: PatientStatus;
}
