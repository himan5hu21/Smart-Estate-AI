"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "outline";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = ({
  className,
  variant = "default",
  padding = "md",
  children,
  ...props
}: CardProps) => {
  const variants = {
    default: "bg-white border border-gray-100 shadow-sm",
    glass: "glassmorphism",
    outline: "bg-transparent border-2 border-gray-100 shadow-none",
  };

  const paddings = {
    none: "p-0",
    sm: "p-3",
    md: "p-6",
    lg: "p-10",
  };

  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-300",
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 mb-4", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-xl font-bold leading-none tracking-tight text-gray-900/90", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-gray-500 font-medium", className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center pt-4 mt-4 border-t border-gray-50", className)} {...props}>
    {children}
  </div>
);
