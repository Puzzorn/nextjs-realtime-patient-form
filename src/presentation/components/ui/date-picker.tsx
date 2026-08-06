"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/core/utils/cn";

export interface DatePickerProps {
  id?: string;
  value?: string; // Expecting YYYY-MM-DD
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: boolean | string;
  className?: string;
  placeholder?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const DatePicker: React.FC<DatePickerProps> = ({
  id,
  value = "",
  onChange,
  disabled = false,
  error,
  className,
  placeholder = "YYYY-MM-DD",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date or default to null
  const parseDate = (dateStr?: string) => {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };

  const selectedDate = parseDate(value);

  const [viewYear, setViewYear] = useState<number>(() => {
    return selectedDate ? selectedDate.getFullYear() : 2000;
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    return selectedDate ? selectedDate.getMonth() : 0;
  });

  // Keep view synchronized if value changes externally (e.g. via draft sync)
  useEffect(() => {
    const dateParsed = parseDate(value);
    if (dateParsed) {
      setViewYear(dateParsed.getFullYear());
      setViewMonth(dateParsed.getMonth());
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formattedYear = String(viewYear).padStart(4, "0");
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${formattedYear}-${formattedMonth}-${formattedDay}`;

    if (onChange) {
      onChange(dateStr);
    }
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange && !disabled) {
      onChange("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onChange) {
      onChange(val);
    }
    const dateParsed = parseDate(val);
    if (dateParsed) {
      setViewYear(dateParsed.getFullYear());
      setViewMonth(dateParsed.getMonth());
    }
  };

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Generate year options (1920 to current year)
  const currentYearNow = new Date().getFullYear();
  const yearOptions: number[] = [];
  for (let y = currentYearNow; y >= 1920; y--) {
    yearOptions.push(y);
  }

  const hasError = Boolean(error);
  const today = new Date();

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(true)}
          className={cn(
            "flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 pr-20 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:opacity-60 transition-colors",
            hasError && "border-red-500 text-red-900 dark:text-red-100 focus:ring-red-500",
            className
          )}
        />
        <div className="absolute right-2 flex items-center gap-1 text-slate-400">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-slate-600 dark:hover:text-slate-200 rounded"
              title="Clear date"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setIsOpen((prev) => !prev)}
            className="p-1 hover:text-slate-600 dark:hover:text-slate-200 rounded disabled:opacity-50"
            title="Open calendar"
          >
            <CalendarIcon className="h-4 w-4 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-72 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl text-slate-900 dark:text-slate-100 animate-in fade-in-50 zoom-in-95">
          {/* Header Controls: Navigation + Selectors */}
          <div className="flex items-center justify-between gap-1 mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS_OF_WEEK.map((day) => (
              <span key={day} className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty offset cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-7 w-7" />
            ))}

            {/* Day numbers */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const isSelected =
                selectedDate &&
                selectedDate.getFullYear() === viewYear &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getDate() === dayNum;

              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === dayNum;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={cn(
                    "h-7 w-7 mx-auto rounded-md text-xs font-medium flex items-center justify-center transition-colors",
                    isSelected
                      ? "bg-blue-600 text-white font-bold shadow"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200",
                    isToday && !isSelected && "border border-blue-500 text-blue-600 dark:text-blue-400 font-semibold"
                  )}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
