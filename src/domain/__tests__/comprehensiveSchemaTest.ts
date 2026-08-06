import { patientSchema, PatientFormData } from "../patientSchema";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assertTest(name: string, condition: boolean, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] Test ${totalTests}: ${name}`);
  } else {
    failedTests++;
    console.error(`[FAIL] Test ${totalTests}: ${name}${details ? ` -> ${details}` : ""}`);
  }
}

console.log("=== EMPIRICAL STRESS TEST SUITE FOR PATIENT SCHEMA ===\n");

// -------------------------------------------------------------
// 1. Valid PatientFormData passing validation
// -------------------------------------------------------------
const validFullData: PatientFormData = {
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
  religion: "Christianity",
};

const res1 = patientSchema.safeParse(validFullData);
assertTest(
  "Valid full PatientFormData (all fields provided)",
  res1.success,
  !res1.success ? JSON.stringify(res1.error.format()) : undefined
);

const validMinimalData: PatientFormData = {
  firstName: "Jane",
  lastName: "Smith",
  dateOfBirth: "1995-05-15",
  gender: "female",
  phoneNumber: "0987654321",
  email: "jane.smith@hospital.org",
  address: "456 Wellness Ave",
  preferredLanguage: "Thai",
  nationality: "Thai",
};

const res2 = patientSchema.safeParse(validMinimalData);
assertTest(
  "Valid minimal PatientFormData (optional fields omitted)",
  res2.success,
  !res2.success ? JSON.stringify(res2.error.format()) : undefined
);

// -------------------------------------------------------------
// 2. Missing required fields failing validation
// -------------------------------------------------------------
const requiredFields: (keyof PatientFormData)[] = [
  "firstName",
  "lastName",
  "dateOfBirth",
  "gender",
  "phoneNumber",
  "email",
  "address",
  "preferredLanguage",
  "nationality",
];

requiredFields.forEach((field) => {
  // Test empty string
  const dataEmpty = { ...validMinimalData, [field]: "" };
  const resEmpty = patientSchema.safeParse(dataEmpty);
  assertTest(
    `Missing required field '${field}' (empty string) fails validation`,
    !resEmpty.success
  );

  // Test undefined
  const dataUndefined = { ...validMinimalData };
  delete dataUndefined[field];
  const resUndefined = patientSchema.safeParse(dataUndefined);
  assertTest(
    `Missing required field '${field}' (undefined) fails validation`,
    !resUndefined.success
  );
});

// -------------------------------------------------------------
// 3. Invalid email / phone format failing validation
// -------------------------------------------------------------
const invalidEmails = [
  "plainaddress",
  "#@%^%#$@#$@#.com",
  "@example.com",
  "Joe Smith <email@example.com>",
  "email.example.com",
  "email@example@example.com",
  "email@example..com",
];

invalidEmails.forEach((emailStr) => {
  const badEmailData = { ...validMinimalData, email: emailStr };
  const resBadEmail = patientSchema.safeParse(badEmailData);
  assertTest(
    `Invalid email format '${emailStr}' fails validation`,
    !resBadEmail.success
  );
});

const invalidPhones = [
  "123456789", // 9 digits (too short)
  "123",       // 3 digits
  "",          // empty string
];

invalidPhones.forEach((phoneStr) => {
  const badPhoneData = { ...validMinimalData, phoneNumber: phoneStr };
  const resBadPhone = patientSchema.safeParse(badPhoneData);
  assertTest(
    `Invalid phone number format '${phoneStr}' (<10 chars) fails validation`,
    !resBadPhone.success
  );
});

// Stress testing edge cases on phone number:
const spacePhone = { ...validMinimalData, phoneNumber: "          " }; // 10 spaces
const resSpacePhone = patientSchema.safeParse(spacePhone);
console.log(`[INFORMATIONAL] 10 spaces phone number passes Zod .min(10): ${resSpacePhone.success}`);

const alphaPhone = { ...validMinimalData, phoneNumber: "abcdefghij" }; // 10 alpha characters
const resAlphaPhone = patientSchema.safeParse(alphaPhone);
console.log(`[INFORMATIONAL] 10 alpha chars phone number passes Zod .min(10): ${resAlphaPhone.success}`);

// -------------------------------------------------------------
// 4. Optional fields (middleName, emergencyContact, religion)
// -------------------------------------------------------------

// 4.1 middleName
const withMiddleName = { ...validMinimalData, middleName: "Alexander" };
assertTest("Optional middleName provided validates cleanly", patientSchema.safeParse(withMiddleName).success);

const withEmptyMiddleName = { ...validMinimalData, middleName: "" };
assertTest("Optional middleName empty string validates cleanly", patientSchema.safeParse(withEmptyMiddleName).success);

const withoutMiddleName = { ...validMinimalData, middleName: undefined };
assertTest("Optional middleName undefined validates cleanly", patientSchema.safeParse(withoutMiddleName).success);

// 4.2 religion
const withReligion = { ...validMinimalData, religion: "Buddhism" };
assertTest("Optional religion provided validates cleanly", patientSchema.safeParse(withReligion).success);

const withEmptyReligion = { ...validMinimalData, religion: "" };
assertTest("Optional religion empty string validates cleanly", patientSchema.safeParse(withEmptyReligion).success);

const withoutReligion = { ...validMinimalData, religion: undefined };
assertTest("Optional religion undefined validates cleanly", patientSchema.safeParse(withoutReligion).success);

// 4.3 emergencyContact
const withFullEC = {
  ...validMinimalData,
  emergencyContact: {
    name: "Alice Smith",
    relationship: "Mother",
    phoneNumber: "0812345678",
  },
};
assertTest("Optional emergencyContact with all fields validates cleanly", patientSchema.safeParse(withFullEC).success);

const withMinimalEC = {
  ...validMinimalData,
  emergencyContact: {
    name: "Alice Smith",
    relationship: "Mother",
  },
};
assertTest("Optional emergencyContact without optional EC phoneNumber validates cleanly", patientSchema.safeParse(withMinimalEC).success);

const withoutEC = { ...validMinimalData, emergencyContact: undefined };
assertTest("Optional emergencyContact undefined validates cleanly", patientSchema.safeParse(withoutEC).success);

const withInvalidEC_MissingName = {
  ...validMinimalData,
  emergencyContact: {
    name: "",
    relationship: "Mother",
  },
};
assertTest("emergencyContact with empty name fails validation", !patientSchema.safeParse(withInvalidEC_MissingName).success);

const withInvalidEC_MissingRelationship = {
  ...validMinimalData,
  emergencyContact: {
    name: "Alice Smith",
    relationship: "",
  },
};
assertTest("emergencyContact with empty relationship fails validation", !patientSchema.safeParse(withInvalidEC_MissingRelationship).success);


console.log(`\n=== TEST SUMMARY ===`);
console.log(`Total: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

if (failedTests > 0) {
  process.exit(1);
}
