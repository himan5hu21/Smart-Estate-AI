"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { UserRole } from "./Input";
import { Slot } from "@radix-ui/react-slot";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  role?: UserRole;
  loading?: boolean;
  IconLeft?: React.ReactNode;
  IconRight?: React.ReactNode;
  asChild?: boolean;
}

const roleStyles: Record<UserRole, Record<string, string>> = {
  admin: {
    primary: "bg-admin-primary text-white hover:bg-admin-accent shadow-indigo-200",
    secondary: "bg-admin-secondary text-white hover:opacity-90",
    outline: "border-2 border-admin-primary text-admin-primary hover:bg-admin-primary/5",
  },
  agent: {
    primary: "bg-agent-primary text-white hover:bg-agent-accent shadow-emerald-200",
    secondary: "bg-agent-secondary text-white hover:opacity-90",
    outline: "border-2 border-agent-primary text-agent-primary hover:bg-agent-primary/5",
  },
  user: {
    primary: "bg-user-primary text-white hover:bg-user-secondary shadow-blue-200",
    secondary: "bg-user-accent text-white hover:opacity-90",
    outline: "border-2 border-user-primary text-user-primary hover:bg-user-primary/5",
  },
};

export const Button = ({
  className,
  variant = "primary",
  size = "md",
  role = "user",
  loading = false,
  disabled,
  IconLeft,
  IconRight,
  asChild = false,
  children,
  ...props
}: ButtonProps) => {
  const isSpecialVariant = variant === "primary" || variant === "secondary" || variant === "outline";
  
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";
  
  const variants = {
    primary: isSpecialVariant ? roleStyles[role].primary : "",
    secondary: isSpecialVariant ? roleStyles[role].secondary : "",
    outline: isSpecialVariant ? roleStyles[role].outline : "",
    ghost: "hover:bg-gray-100 text-gray-600 hover:text-gray-900",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-red-100",
    link: "text-blue-600 underline-offset-4 hover:underline hover:bg-transparent",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
    icon: "p-2.5",
  };

  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        variant === "primary" && "shadow-lg",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : IconLeft ? (
            <span className="mr-2">{IconLeft}</span>
          ) : null}
          {children}
          {!loading && IconRight && <span className="ml-2">{IconRight}</span>}
        </>
      )}
    </Comp>
  );
};
