"use client";

import React from "react";
import { usePatientForm } from "../hooks/usePatientForm";
import { InputField } from "./InputField";

export const PatientForm: React.FC = () => {
  const { methods, isConnected, emitFieldChange, onSubmit } = usePatientForm();
  const {
    register,
    formState: { errors, isSubmitting },
  } = methods;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Patient Registration Form
        </h2>
        <div className="flex items-center gap-2">
          <span
            className={`h-3 w-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {isConnected ? "Live Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="First Name"
            registration={register("firstName")}
            error={errors.firstName?.message}
            onValueChange={(val) => emitFieldChange("firstName", val)}
            placeholder="John"
          />

          <InputField
            label="Last Name"
            registration={register("lastName")}
            error={errors.lastName?.message}
            onValueChange={(val) => emitFieldChange("lastName", val)}
            placeholder="Doe"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Email Address"
            type="email"
            registration={register("email")}
            error={errors.email?.message}
            onValueChange={(val) => emitFieldChange("email", val)}
            placeholder="john.doe@example.com"
          />

          <InputField
            label="Phone Number"
            type="tel"
            registration={register("phone")}
            error={errors.phone?.message}
            onValueChange={(val) => emitFieldChange("phone", val)}
            placeholder="1234567890"
          />
        </div>

        <InputField
          label="Date of Birth"
          type="date"
          registration={register("dateOfBirth")}
          error={errors.dateOfBirth?.message}
          onValueChange={(val) => emitFieldChange("dateOfBirth", val)}
        />

        <div className="flex flex-col gap-1 mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Medical History / Notes
          </label>
          <textarea
            {...register("medicalHistory")}
            onChange={(e) => {
              register("medicalHistory").onChange(e);
              emitFieldChange("medicalHistory", e.target.value);
            }}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            placeholder="Enter any pre-existing conditions..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow transition-colors duration-200 disabled:opacity-50"
        >
          Submit Patient Record
        </button>
      </form>
    </div>
  );
};

export default PatientForm;
