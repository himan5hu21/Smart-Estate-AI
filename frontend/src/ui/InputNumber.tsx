"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  FieldError,
  UseFormRegister,
  FieldValues,
  Path
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { UserRole } from "./Input";

interface InputNumberProps<T extends FieldValues>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'type' | 'onChange' | 'onBlur' | 'prefix' | 'maxLength' | 'defaultValue' | 'max'> {
  label?: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  defaultValue?: number;
  allowDecimals?: boolean;
  preventEnter?: boolean;
  strictMax?: boolean;
  role?: UserRole;
}

const roleStyles: Record<UserRole, { input: string; buttons: string }> = {
  admin: {
    input: "focus:ring-admin-primary/20 focus:border-admin-primary",
    buttons: "hover:bg-admin-primary/10 active:bg-admin-primary/20",
  },
  agent: {
    input: "focus:ring-agent-primary/20 focus:border-agent-primary",
    buttons: "hover:bg-agent-primary/10 active:bg-agent-primary/20",
  },
  user: {
    input: "focus:ring-user-primary/20 focus:border-user-primary",
    buttons: "hover:bg-user-primary/10 active:bg-user-primary/20",
  },
};

export const InputNumber = <T extends FieldValues>({
  label,
  name,
  register,
  error,
  className,
  min,
  max,
  step = 1,
  disabled,
  maxLength,
  defaultValue,
  allowDecimals = true,
  preventEnter = true,
  strictMax = false,
  role = "user",
  ...props
}: InputNumberProps<T>) => {
  const internalRef = useRef<HTMLInputElement | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastValidValue = useRef<string>(""); 
  
  const [displayError, setDisplayError] = useState<string>("");
   
  const [currentValue, setCurrentValue] = useState<number | null>(() => {
    if (defaultValue !== undefined) return defaultValue;
    return null;
  });

  const safeMax = (max !== undefined && min !== undefined && max < min) 
    ? min 
    : max;

  const { ref: rhfRef, onChange: rhfOnChange, onBlur: rhfOnBlur, ...restRegistration } = register(name, {
    valueAsNumber: true,
  });

  useEffect(() => {
    if (error?.message) {
      setDisplayError(error.message);
    }
  }, [error]);

  useEffect(() => {
    if (internalRef.current) {
      if (defaultValue !== undefined && internalRef.current.value === "") {
        const strVal = defaultValue.toString();
        internalRef.current.value = strVal;
        lastValidValue.current = strVal; 
        
        const event = new Event("input", { bubbles: true });
        internalRef.current.dispatchEvent(event);
        
        if (currentValue !== defaultValue) {
          setCurrentValue(defaultValue);
        }
      } else {
        const val = internalRef.current.value;
        if (val) lastValidValue.current = val;
        
        const num = parseFloat(val);
        if (!isNaN(num) && num !== currentValue) {
          setCurrentValue(num);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]); 

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const triggerChange = (newValue: string | number) => {
    const input = internalRef.current;
    if (!input) return;

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;
    nativeInputValueSetter?.call(input, newValue);

    const event = new Event("input", { bubbles: true });
    input.dispatchEvent(event);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (preventEnter && e.key === "Enter") {
      e.preventDefault();
      return;
    }
    if (!allowDecimals && (e.key === "." || e.key === "Decimal")) {
      e.preventDefault();
      return;
    }
    if (["e", "E", "+"].includes(e.key)) {
      e.preventDefault();
      return;
    }
    if (e.key === "-" && min !== undefined && min >= 0) {
      e.preventDefault();
      return;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;

    if (newVal === "") {
      lastValidValue.current = "";
      setCurrentValue(null);
      rhfOnChange(e);
      return;
    }

    if (newVal === "-") {
      if (min !== undefined && min >= 0) {
        triggerChange(lastValidValue.current);
        return;
      }
      lastValidValue.current = "-";
      setCurrentValue(null);
      rhfOnChange(e);
      return;
    }

    const parsedVal = parseFloat(newVal);
    let isStrictlyValid = true;

    if (maxLength && newVal.length > maxLength) isStrictlyValid = false;
    if (!allowDecimals && newVal.includes(".")) isStrictlyValid = false;
    
    if (strictMax && !isNaN(parsedVal) && safeMax !== undefined && parsedVal > safeMax) {
      isStrictlyValid = false;
    }

    if (!isStrictlyValid) {
      e.target.value = lastValidValue.current;
      return;
    }

    const isWithinLimits = 
      (!isNaN(parsedVal)) &&
      (safeMax === undefined || parsedVal <= safeMax) &&
      (min === undefined || parsedVal >= min);

    if (isWithinLimits) {
      lastValidValue.current = newVal;
    }

    setCurrentValue(parsedVal);
    rhfOnChange(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const val = parseFloat(rawValue);
    let finalValue: number | null = null;

    const isOverMax = safeMax !== undefined && !isNaN(val) && val > safeMax;
    const isUnderMin = min !== undefined && !isNaN(val) && val < min;

    if (isOverMax || isUnderMin) {
      const reverted = parseFloat(lastValidValue.current);
      finalValue = isNaN(reverted) ? (min ?? 0) : reverted;
    } 
    else if (isNaN(val)) {
      if (defaultValue !== undefined && rawValue === "") {
        finalValue = defaultValue;
      } else if (min !== undefined && rawValue === "") {
        finalValue = min;
      }
    } 
    else {
      finalValue = val;
    }

    if (finalValue !== null) {
      if (rawValue !== finalValue.toString()) {
        triggerChange(finalValue);
        setCurrentValue(finalValue);
        lastValidValue.current = finalValue.toString();
      }
    }

    rhfOnBlur(e);
  };

  const handleStep = (direction: "up" | "down") => {
    if (disabled || !internalRef.current) return;

    const currentVal = parseFloat(internalRef.current.value) || 0;
    const decimalFactor = (step.toString().split(".")[1] || "").length;
    
    let newValue;
    if (direction === "up") {
       if (safeMax !== undefined && currentVal >= safeMax) return;
       newValue = currentVal + step;
       if (safeMax !== undefined && newValue > safeMax) newValue = safeMax;
    } else {
       if (min !== undefined && currentVal <= min) return;
       newValue = currentVal - step;
       if (min !== undefined && newValue < min) newValue = min;
    }

    newValue = parseFloat(newValue.toFixed(decimalFactor));
    if (maxLength && newValue.toString().length > maxLength) return;

    triggerChange(newValue);
    lastValidValue.current = newValue.toString();
    setCurrentValue(newValue);
  };

  const startContinuous = (direction: "up" | "down") => {
    handleStep(direction);
    intervalRef.current = setInterval(() => {
      handleStep(direction);
    }, 150); 
  };

  const stopContinuous = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const isUpDisabled = disabled || (safeMax !== undefined && currentValue !== null && currentValue >= safeMax);
  const isDownDisabled = disabled || (min !== undefined && currentValue !== null && currentValue <= min);

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
        <input
          id={name}
          type="number"
          step={step}
          min={min} 
          disabled={disabled}
          onKeyDown={handleKeyDown}
          {...props}
          {...restRegistration}
          onChange={handleInputChange}
          onBlur={handleBlur}
          ref={(e) => {
            rhfRef(e);
            internalRef.current = e;
          }}
          className={cn(
            "w-full px-4 py-3 bg-white border rounded-xl outline-none transition-all duration-200 ease-in-out",
            "placeholder:text-gray-400 text-gray-900 border-gray-200 shadow-sm",
            "focus:ring-4",
            roleStyles[role].input,
            "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            error ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" : "hover:border-gray-300",
            "pr-4 group-hover:pr-11", 
            className
          )}
        />

        {!disabled && (
          <div className="absolute right-1 top-1 bottom-1 w-9 flex flex-col border-l border-gray-100 rounded-r-lg overflow-hidden opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity duration-200 bg-gray-50/50 backdrop-blur-sm z-10">
            <button
              type="button"
              disabled={isUpDisabled}
              onMouseDown={(e) => { e.preventDefault(); if (!isUpDisabled) startContinuous("up"); }}
              onMouseUp={stopContinuous}
              onMouseLeave={stopContinuous}
              onTouchStart={(e) => { if(e.cancelable) e.preventDefault(); if (!isUpDisabled) startContinuous("up"); }}
              onTouchEnd={stopContinuous}
              className={cn(
                "flex-1 flex items-center justify-center transition-colors border-b border-gray-100",
                isUpDisabled 
                  ? "bg-gray-100/50 cursor-not-allowed text-gray-300" 
                  : cn("text-gray-500 cursor-pointer", roleStyles[role].buttons)
              )}
              tabIndex={-1}
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={isDownDisabled}
              onMouseDown={(e) => { e.preventDefault(); if (!isDownDisabled) startContinuous("down"); }}
              onMouseUp={stopContinuous}
              onMouseLeave={stopContinuous}
              onTouchStart={(e) => { if(e.cancelable) e.preventDefault(); if (!isDownDisabled) startContinuous("down"); }}
              onTouchEnd={stopContinuous}
              className={cn(
                "flex-1 flex items-center justify-center transition-colors",
                isDownDisabled 
                  ? "bg-gray-100/50 cursor-not-allowed text-gray-300" 
                  : cn("text-gray-500 cursor-pointer", roleStyles[role].buttons)
              )}
              tabIndex={-1}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

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
            {error?.message || displayError}
          </p>
        </div>
      </div>
    </div>
  );
};
