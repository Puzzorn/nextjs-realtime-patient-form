"use client";

import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/core/utils/cn";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
  onValueChange?: (value: string) => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  registration,
  onValueChange,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <input
        {...registration}
        {...props}
        onChange={(e) => {
          if (props.type === "tel" || registration.name?.toLowerCase().includes("phone") || props.name?.toLowerCase().includes("phone")) {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }
          registration.onChange(e);
          if (onValueChange) {
            onValueChange(e.target.value);
          }
        }}
        className={cn(
          "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800",
          error ? "border-red-500" : "border-gray-300 dark:border-gray-700",
          className
        )}
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
};
