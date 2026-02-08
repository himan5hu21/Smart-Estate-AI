"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { UserRole } from "./Input";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "solid" | "subtle" | "outline";
  role?: UserRole | "neutral" | "danger" | "warning" | "success";
}

export const Badge = ({
  className,
  variant = "subtle",
  role = "neutral",
  children,
  ...props
}: BadgeProps) => {

  const roleConfigs: Record<string, string> = {
    admin: "admin-primary",
    agent: "agent-primary",
    user: "user-primary",
    success: "emerald",
    danger: "red",
    warning: "amber",
    neutral: "gray"
  };

  const color = roleConfigs[role] || "gray";

  const variants = {
    solid: `bg-${color === 'admin-primary' ? 'admin-primary' : color + '-600'} text-white`,
    subtle: `bg-${color === 'admin-primary' ? 'admin-primary/10' : color + '-100'} text-${color === 'admin-primary' ? 'admin-primary' : color + '-700'}`,
    outline: `border border-${color === 'admin-primary' ? 'admin-primary' : color + '-200'} text-${color === 'admin-primary' ? 'admin-primary' : color + '-700'}`,
  };

  // Special handling for design system tokens since tailwind doesn't like dynamic string templates for custom colors easily unless mapped
  const dynamicStyles = () => {
    if (role === 'admin') {
      if (variant === 'solid') return "bg-admin-primary text-white";
      if (variant === 'subtle') return "bg-admin-primary/10 text-admin-primary";
      return "border border-admin-primary/30 text-admin-primary";
    }
    if (role === 'agent') {
      if (variant === 'solid') return "bg-agent-primary text-white";
      if (variant === 'subtle') return "bg-agent-primary/10 text-agent-primary";
      return "border border-agent-primary/30 text-agent-primary";
    }
    if (role === 'user') {
      if (variant === 'solid') return "bg-user-primary text-white";
      if (variant === 'subtle') return "bg-user-primary/10 text-user-primary";
      return "border border-user-primary/30 text-user-primary";
    }
    
    // Fallback to standard tailwind colors for status
    const statusColors: Record<string, string> = {
        success: variant === 'solid' ? "bg-emerald-600 text-white" : variant === 'subtle' ? "bg-emerald-50 text-emerald-700" : "border-emerald-200 text-emerald-700 border",
        danger: variant === 'solid' ? "bg-red-600 text-white" : variant === 'subtle' ? "bg-red-50 text-red-700" : "border-red-200 text-red-700 border",
        warning: variant === 'solid' ? "bg-amber-500 text-white" : variant === 'subtle' ? "bg-amber-50 text-amber-700" : "border-amber-200 text-amber-700 border",
        neutral: variant === 'solid' ? "bg-gray-600 text-white" : variant === 'subtle' ? "bg-gray-100 text-gray-700" : "border-gray-200 text-gray-700 border",
    };
    return statusColors[role] || statusColors.neutral;
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold transition-all",
        dynamicStyles(),
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
