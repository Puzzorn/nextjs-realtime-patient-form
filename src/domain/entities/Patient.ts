import { PatientFormData } from "../patientSchema";

export class Patient {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly phoneNumber: string,
    public readonly dateOfBirth: string,
    public readonly gender: string,
    public readonly address: string,
    public readonly preferredLanguage: string,
    public readonly nationality: string,
    public readonly middleName?: string,
    public readonly religion?: string,
    public readonly createdAt: Date = new Date()
  ) {}

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public static fromDTO(dto: PatientFormData, id: string = Date.now().toString()): Patient {
    return new Patient(
      id,
      dto.firstName,
      dto.lastName,
      dto.email,
      dto.phoneNumber,
      dto.dateOfBirth,
      dto.gender,
      dto.address,
      dto.preferredLanguage,
      dto.nationality,
      dto.middleName,
      dto.religion
    );
  }

  public toDTO(): PatientFormData {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      address: this.address,
      preferredLanguage: this.preferredLanguage,
      nationality: this.nationality,
      middleName: this.middleName,
      religion: this.religion,
    };
  }
}
