"use client";

import React, { useState } from "react";
import { 
  FieldError, 
  UseFormRegister, 
  FieldValues, 
  Path 
} from "react-hook-form";
import { cn } from "@/lib/utils";

export type UserRole = "admin" | "agent" | "user";

interface InputProps<T extends FieldValues> 
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'prefix'> {
  label?: string;
  name?: Path<T>;
  register?: UseFormRegister<T>;
  error?: FieldError;
  prefix?: React.ReactNode; 
  suffix?: React.ReactNode; 
  role?: UserRole;
}

const roleStyles: Record<UserRole, string> = {
  admin: "focus:ring-admin-primary/20 focus:border-admin-primary",
  agent: "focus:ring-agent-primary/20 focus:border-agent-primary",
  user: "focus:ring-user-primary/20 focus:border-user-primary",
};

export const Input = <T extends FieldValues>({
  label,
  name,
  register,
  error,
  className,
  type = "text",
  prefix,
  suffix,
  role = "user",
  ...props
}: InputProps<T>) => {

  const [cachedError, setCachedError] = useState<string>("");

  if (error?.message && error.message !== cachedError) {
    setCachedError(error.message);
  }

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-semibold text-gray-700/90"
        >
          {label}
        </label>
      )}

      <div className="relative group">
        {/* PREFIX COMPONENT */}
        {prefix && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors pointer-events-none z-10 flex items-center justify-center">
            {prefix}
          </div>
        )}

        <input
          id={name}
          type={type}
          {...props}
          {...(register && name ? register(name, {
            valueAsNumber: type === "number",
          }) : {})}
          className={cn(
            "w-full py-3 bg-white border rounded-xl outline-none transition-all duration-200",
            "placeholder:text-gray-400 text-gray-900 border-gray-200 shadow-sm",
            "focus:ring-4",
            roleStyles[role],
            "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
            error ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" : "hover:border-gray-300",
            // Dynamic Padding
            prefix ? "pl-11" : "pl-4", 
            suffix ? "pr-11" : "pr-4", 
            className
          )}
        />

        {/* SUFFIX COMPONENT */}
        {suffix && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors flex items-center justify-center">
            {suffix}
          </div>
        )}
      </div>

      {/* ERROR MESSAGE with Smooth Height Transition */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out overflow-hidden",
          error
            ? "grid-rows-[1fr] opacity-100 translate-y-0"
            : "grid-rows-[0fr] opacity-0 -translate-y-1"
        )}
      >
        <div className="min-h-0">
          <p className="text-xs font-medium text-red-500">
            {error?.message || cachedError}
          </p>
        </div>
      </div>
    </div>
  );
};
