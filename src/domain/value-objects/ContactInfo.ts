export class ContactInfo {
  constructor(
    public readonly email: string,
    public readonly phone: string
  ) {
    if (!email.includes("@")) {
      throw new Error("Invalid email format");
    }
    if (phone.length < 10) {
      throw new Error("Phone number must be at least 10 digits");
    }
  }
}
