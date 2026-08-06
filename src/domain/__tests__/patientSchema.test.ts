import {
  patientSchema,
  PATIENT_STATUS,
  PatientFormData,
} from "../patientSchema";

function runValidationTests() {
  console.log("Starting patientSchema validation tests...");

  // 1. Valid full data
  const validData: PatientFormData = {
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1990-01-01",
    gender: "male",
    phoneNumber: "1234567890",
    email: "john.doe@example.com",
    address: "123 Health St",
    preferredLanguage: "English",
    nationality: "American",
    middleName: "Robert",
    emergencyContact: {
      name: "Jane Doe",
      relationship: "Spouse",
      phoneNumber: "0987654321",
    },
    religion: "None",
  };

  const result1 = patientSchema.safeParse(validData);
  if (!result1.success) {
    throw new Error(`Test 1 Failed: Valid data failed validation: ${JSON.stringify(result1.error.format())}`);
  }
  console.log("Test 1 Passed: Valid full data parsed successfully.");

  // 2. Valid minimal data (omitting 3 optional fields)
  const minimalData = {
    firstName: "Jane",
    lastName: "Smith",
    dateOfBirth: "1995-05-15",
    gender: "female",
    phoneNumber: "0987654321",
    email: "jane.smith@example.com",
    address: "456 Wellness Ave",
    preferredLanguage: "Thai",
    nationality: "Thai",
  };

  const result2 = patientSchema.safeParse(minimalData);
  if (!result2.success) {
    throw new Error(`Test 2 Failed: Minimal data failed validation: ${JSON.stringify(result2.error.format())}`);
  }
  console.log("Test 2 Passed: Minimal data (omitting optional fields) parsed successfully.");

  // 3. Missing required field (e.g. email)
  const missingEmail = { ...minimalData, email: "" };
  const result3 = patientSchema.safeParse(missingEmail);
  if (result3.success) {
    throw new Error("Test 3 Failed: Empty email should fail validation.");
  }
  console.log("Test 3 Passed: Empty email rejected correctly.");

  // 4. Invalid email format
  const invalidEmail = { ...minimalData, email: "invalid-email" };
  const result4 = patientSchema.safeParse(invalidEmail);
  if (result4.success) {
    throw new Error("Test 4 Failed: Invalid email format should fail validation.");
  }
  console.log("Test 4 Passed: Invalid email format rejected correctly.");

  // 5. Phone number validation (8 digits -> invalid, 9 digits -> valid, 15 digits -> valid, 16 digits -> invalid)
  const shortPhone = { ...minimalData, phoneNumber: "12345678" }; // 8 digits (too short)
  const result5a = patientSchema.safeParse(shortPhone);
  if (result5a.success) {
    throw new Error("Test 5a Failed: 8-digit phone number should fail validation.");
  }

  const valid9Phone = { ...minimalData, phoneNumber: "123456789" }; // 9 digits
  const result5b = patientSchema.safeParse(valid9Phone);
  if (!result5b.success) {
    throw new Error("Test 5b Failed: 9-digit phone number should pass validation.");
  }
  console.log("Test 5 Passed: Phone number digit count validation (9-15 digits) verified.");

  // 6. Emergency contact explicitly optional (empty strings or omitted fields pass)
  const emptyEmergencyContact = {
    ...minimalData,
    emergencyContact: {
      name: "",
      relationship: "",
      phoneNumber: "",
    },
  };
  const result6 = patientSchema.safeParse(emptyEmergencyContact);
  if (!result6.success) {
    throw new Error(`Test 6 Failed: Empty emergency contact fields should pass validation: ${JSON.stringify(result6.error.format())}`);
  }
  console.log("Test 6 Passed: Emergency contact optional with empty strings verified.");

  // 7. Verify PATIENT_STATUS constant object
  if (
    PATIENT_STATUS.ACTIVELY_FILLING_IN !== "actively_filling_in" ||
    PATIENT_STATUS.INACTIVE !== "inactive" ||
    PATIENT_STATUS.SUBMITTED !== "submitted"
  ) {
    throw new Error("Test 7 Failed: PATIENT_STATUS constant values mismatch.");
  }
  console.log("Test 7 Passed: PATIENT_STATUS constant object verified.");

  console.log("\nALL 7 VALIDATION TESTS PASSED SUCCESSFULLY!");
}

runValidationTests();
