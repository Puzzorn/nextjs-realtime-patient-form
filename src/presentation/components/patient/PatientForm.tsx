"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { usePatientForm } from "@/presentation/hooks/usePatientForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/presentation/components/ui/card";
import { Label } from "@/presentation/components/ui/label";
import { Input } from "@/presentation/components/ui/input";
import { Select, SelectOption } from "@/presentation/components/ui/select";
import { Textarea } from "@/presentation/components/ui/textarea";
import { Button } from "@/presentation/components/ui/button";
import { Badge } from "@/presentation/components/ui/badge";
import { DatePicker } from "@/presentation/components/ui/date-picker";
import { CheckCircle2, UserCheck, ShieldAlert, Wifi, WifiOff } from "lucide-react";

export const PatientForm: React.FC = () => {
  const {
    patientId,
    methods,
    isConnected,
    isSubmitted,
    status,
    handleFieldChange,
    resetInactivityTimer,
    onSubmit,
  } = usePatientForm();

  const {
    register,
    formState: { errors, isSubmitting },
  } = methods;

  const renderBadge = () => {
    if (isSubmitted) {
      return <Badge variant="submitted">Submitted</Badge>;
    }
    if (status === "actively_filling_in") {
      return <Badge variant="actively_filling_in">Actively filling in</Badge>;
    }
    return <Badge variant="inactive">Inactive</Badge>;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border border-slate-200 dark:border-slate-800">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Patient Registration Form
              </CardTitle>
              {renderBadge()}
            </div>
            <CardDescription className="text-slate-500 dark:text-slate-400 mt-1">
              Please fill out all required details. Real-time updates are streamed to hospital staff.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-emerald-500 animate-pulse" />
                <span className="font-medium text-emerald-600 dark:text-emerald-400">Live Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-rose-500" />
                <span className="font-medium text-rose-600 dark:text-rose-400">Disconnected</span>
              </>
            )}
            {patientId && <span className="text-slate-400">| ID: {patientId}</span>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isSubmitted && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-200">
                Patient Record Submitted Successfully!
              </h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-0.5">
                Thank you. Your information has been securely transmitted to the medical staff. All form inputs have been locked.
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={onSubmit}
          onKeyDown={resetInactivityTimer}
          onClick={resetInactivityTimer}
          className="space-y-6"
        >
          {/* Section 1: Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b pb-2">
              <UserCheck className="h-5 w-5 text-blue-600" /> Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" required>
                  First Name
                </Label>
                <Input
                  id="firstName"
                  disabled={isSubmitted}
                  placeholder="e.g. Somchai"
                  error={errors.firstName?.message}
                  {...register("firstName", {
                    onChange: (e) => handleFieldChange("firstName", e.target.value),
                  })}
                />
                {errors.firstName && (
                  <p className="text-xs text-rose-500 font-medium">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="middleName">Middle Name (Optional)</Label>
                <Input
                  id="middleName"
                  disabled={isSubmitted}
                  placeholder="e.g. Prasert"
                  error={errors.middleName?.message}
                  {...register("middleName", {
                    onChange: (e) => handleFieldChange("middleName", e.target.value),
                  })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" required>
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  disabled={isSubmitted}
                  placeholder="e.g. Jaidee"
                  error={errors.lastName?.message}
                  {...register("lastName", {
                    onChange: (e) => handleFieldChange("lastName", e.target.value),
                  })}
                />
                {errors.lastName && (
                  <p className="text-xs text-rose-500 font-medium">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dateOfBirth" required>
                  Date of Birth
                </Label>
                <Controller
                  name="dateOfBirth"
                  control={methods.control}
                  render={({ field }) => (
                    <DatePicker
                      id="dateOfBirth"
                      value={field.value || ""}
                      disabled={isSubmitted}
                      error={errors.dateOfBirth?.message}
                      onChange={(dateStr) => {
                        field.onChange(dateStr);
                        handleFieldChange("dateOfBirth", dateStr);
                      }}
                    />
                  )}
                />
                {errors.dateOfBirth && (
                  <p className="text-xs text-rose-500 font-medium">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gender" required>
                  Gender
                </Label>
                <Select
                  id="gender"
                  disabled={isSubmitted}
                  error={errors.gender?.message}
                  {...register("gender", {
                    onChange: (e) => handleFieldChange("gender", e.target.value),
                  })}
                >
                  <SelectOption value="">Select Gender...</SelectOption>
                  <SelectOption value="male">Male</SelectOption>
                  <SelectOption value="female">Female</SelectOption>
                  <SelectOption value="other">Other</SelectOption>
                  <SelectOption value="prefer_not_to_say">Prefer not to say</SelectOption>
                </Select>
                {errors.gender && (
                  <p className="text-xs text-rose-500 font-medium">{errors.gender.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Contact Details & Background */}
          <div className="space-y-4 pt-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b pb-2">
              Contact & Background Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber" required>
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  disabled={isSubmitted}
                  placeholder="e.g. 0812345678"
                  error={errors.phoneNumber?.message}
                  {...register("phoneNumber", {
                    onChange: (e) => {
                      const cleaned = e.target.value.replace(/[^0-9]/g, "");
                      e.target.value = cleaned;
                      methods.setValue("phoneNumber", cleaned, { shouldValidate: true });
                      handleFieldChange("phoneNumber", cleaned);
                    },
                  })}
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-rose-500 font-medium">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" required>
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  disabled={isSubmitted}
                  placeholder="e.g. somchai@example.com"
                  error={errors.email?.message}
                  {...register("email", {
                    onChange: (e) => handleFieldChange("email", e.target.value),
                  })}
                />
                {errors.email && (
                  <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="preferredLanguage" required>
                  Preferred Language
                </Label>
                <Select
                  id="preferredLanguage"
                  disabled={isSubmitted}
                  error={errors.preferredLanguage?.message}
                  {...register("preferredLanguage", {
                    onChange: (e) => handleFieldChange("preferredLanguage", e.target.value),
                  })}
                >
                  <SelectOption value="">Select Language...</SelectOption>
                  <SelectOption value="Thai">Thai</SelectOption>
                  <SelectOption value="English">English</SelectOption>
                  <SelectOption value="Mandarin">Mandarin</SelectOption>
                  <SelectOption value="Spanish">Spanish</SelectOption>
                  <SelectOption value="Other">Other</SelectOption>
                </Select>
                {errors.preferredLanguage && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.preferredLanguage.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nationality" required>
                  Nationality
                </Label>
                <Input
                  id="nationality"
                  disabled={isSubmitted}
                  placeholder="e.g. Thai"
                  error={errors.nationality?.message}
                  {...register("nationality", {
                    onChange: (e) => handleFieldChange("nationality", e.target.value),
                  })}
                />
                {errors.nationality && (
                  <p className="text-xs text-rose-500 font-medium">{errors.nationality.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="religion">Religion (Optional)</Label>
                <Input
                  id="religion"
                  disabled={isSubmitted}
                  placeholder="e.g. Buddhism / None"
                  error={errors.religion?.message}
                  {...register("religion", {
                    onChange: (e) => handleFieldChange("religion", e.target.value),
                  })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" required>
                Current Residential Address
              </Label>
              <Textarea
                id="address"
                disabled={isSubmitted}
                rows={3}
                placeholder="123 Sukhumvit Road, Khlong Toei, Bangkok 10110"
                error={errors.address?.message}
                {...register("address", {
                  onChange: (e) => handleFieldChange("address", e.target.value),
                })}
              />
              {errors.address && (
                <p className="text-xs text-rose-500 font-medium">{errors.address.message}</p>
              )}
            </div>
          </div>

          {/* Section 3: Emergency Contact (Optional) */}
          <div className="space-y-4 pt-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b pb-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" /> Emergency Contact (Optional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="emergencyName">Contact Name</Label>
                <Input
                  id="emergencyName"
                  disabled={isSubmitted}
                  placeholder="e.g. Somsri Jaidee"
                  error={errors.emergencyContact?.name?.message}
                  {...register("emergencyContact.name", {
                    onChange: (e) => handleFieldChange("emergencyContact.name", e.target.value),
                  })}
                />
                {errors.emergencyContact?.name && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.emergencyContact.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emergencyRelationship">Relationship</Label>
                <Input
                  id="emergencyRelationship"
                  disabled={isSubmitted}
                  placeholder="e.g. Spouse / Parent"
                  error={errors.emergencyContact?.relationship?.message}
                  {...register("emergencyContact.relationship", {
                    onChange: (e) =>
                      handleFieldChange("emergencyContact.relationship", e.target.value),
                  })}
                />
                {errors.emergencyContact?.relationship && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.emergencyContact.relationship.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emergencyPhone">Phone Number</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  disabled={isSubmitted}
                  placeholder="e.g. 0898765432"
                  error={errors.emergencyContact?.phoneNumber?.message}
                  {...register("emergencyContact.phoneNumber", {
                    onChange: (e) => {
                      const cleaned = e.target.value.replace(/[^0-9]/g, "");
                      e.target.value = cleaned;
                      methods.setValue("emergencyContact.phoneNumber", cleaned);
                      handleFieldChange("emergencyContact.phoneNumber", cleaned);
                    },
                  })}
                />
                {errors.emergencyContact?.phoneNumber && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.emergencyContact.phoneNumber.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitted}
              isLoading={isSubmitting}
              className="w-full h-12 text-base shadow-md font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800"
            >
              {isSubmitted ? "Patient Form Submitted & Locked" : "Submit Patient Registration"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientForm;
