import { PatientDTO } from "../schemas/patientSchema";

export class Patient {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly dateOfBirth: string,
    public readonly medicalHistory?: string,
    public readonly createdAt: Date = new Date()
  ) {}

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public static fromDTO(dto: PatientDTO, id: string = Date.now().toString()): Patient {
    return new Patient(
      id,
      dto.firstName,
      dto.lastName,
      dto.email,
      dto.phone,
      dto.dateOfBirth,
      dto.medicalHistory
    );
  }

  public toDTO(): PatientDTO {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      dateOfBirth: this.dateOfBirth,
      medicalHistory: this.medicalHistory,
    };
  }
}
