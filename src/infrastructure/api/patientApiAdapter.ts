import { PatientDTO } from "@/domain/schemas/patientSchema";

export const patientApiAdapter = {
  async submitPatientForm(dto: PatientDTO): Promise<{ success: boolean; id: string }> {
    if (!dto) {
      throw new Error("Patient DTO is required");
    }
    return {
      success: true,
      id: Date.now().toString(),
    };
  },
};
