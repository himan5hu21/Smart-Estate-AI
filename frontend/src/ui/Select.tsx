"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import { ChevronDown, Check, X, Loader2 } from "lucide-react";
import { FieldError, UseFormSetValue, UseFormWatch, Path, FieldValues } from "react-hook-form";
import useMeasure from "react-use-measure"; 
import { cn } from "@/lib/utils";
import { VirtualList } from "@/ui/VirtualList";
import { UserRole } from "./Input";

function useEffectEvent<T extends (...args: Parameters<T>) => ReturnType<T>>(handler: T) {
  const handlerRef = useRef<T>(handler);

  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  return useCallback((...args: Parameters<T>) => {
    const fn = handlerRef.current;
    return fn(...args);
  }, []);
}

export interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps<T extends FieldValues> {
  label?: string;
  name?: Path<T>;
  options: SelectOption[];
  setValue?: UseFormSetValue<T>;
  watch?: UseFormWatch<T>;
  value?: string | number | string[] | number[];
  onValueChange?: (value: any) => void;
  error?: FieldError;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  loading?: boolean;
  className?: string;
  role?: UserRole;
  clearable?: boolean;
  searchable?: boolean;
}

const roleStyles: Record<UserRole, { trigger: string; item: string; tag: string; check: string }> = {
  admin: {
    trigger: "ring-admin-primary/20 border-admin-primary",
    item: "bg-admin-primary/5 text-admin-primary font-semibold",
    tag: "bg-admin-primary/10 text-admin-primary border-admin-primary/20",
    check: "text-admin-primary",
  },
  agent: {
    trigger: "ring-agent-primary/20 border-agent-primary",
    item: "bg-agent-primary/5 text-agent-primary font-semibold",
    tag: "bg-agent-primary/10 text-agent-primary border-agent-primary/20",
    check: "text-agent-primary",
  },
  user: {
    trigger: "ring-user-primary/20 border-user-primary",
    item: "bg-user-primary/5 text-user-primary font-semibold",
    tag: "bg-user-primary/10 text-user-primary border-user-primary/20",
    check: "text-user-primary",
  },
};

export const Select = <T extends FieldValues>({
  label,
  name,
  options = [], // Add default empty array
  setValue,
  watch,
  value: propValue,
  onValueChange,
  error,
  placeholder = "Select...",
  disabled = false,
  multiple = false,
  loading = false,
  className,
  role = "user",
  clearable = true,
  searchable = true,
}: SelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState<"top" | "bottom">("bottom");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [ref, bounds] = useMeasure();
  
  // Support both hook-form and standard controlled usage
  const internalValue = watch && name ? watch(name) : propValue;

  const filteredOptions = useMemo(() => {
    if (!options || !Array.isArray(options)) return [];
    if (!searchable || !inputValue) return options;
    const lowerQuery = inputValue.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(lowerQuery)
    );
  }, [options, inputValue, searchable]);

  const dropdownHeight = Math.min(filteredOptions.length * 35, 250) + 2;

  const handleContainerClick = () => {
    if (disabled) return;
    if (!isOpen) setIsOpen(true);
    // Focus input even if not searchable to capture keyboard events or just focus outline
    inputRef.current?.focus();
  };

  const handleSelect = useCallback((optionValue: string | number) => {
    if (multiple) {
      const currentValues = Array.isArray(internalValue) ? internalValue : [];
      const exists = currentValues.includes(optionValue as never);
      
      let newValues;
      if (exists) {
        newValues = currentValues.filter((v: string | number) => v !== optionValue);
      } else {
        newValues = [...currentValues, optionValue];
      }
      
      if (setValue && name) {
        setValue(name, newValues as any, { shouldValidate: true, shouldDirty: true });
      }
      if (onValueChange) {
        onValueChange(newValues);
      }
      
      setInputValue(""); 
      inputRef.current?.focus(); 
    } else {
      if (setValue && name) {
        setValue(name, optionValue as any, { shouldValidate: true, shouldDirty: true });
      }
      if (onValueChange) {
        onValueChange(optionValue);
      }
      
      setIsOpen(false);
      setInputValue("");
      inputRef.current?.blur();
    }
  }, [multiple, internalValue, setValue, name, onValueChange]);

  const handleRemoveTag = (e: React.MouseEvent, valToRemove: string | number) => {
    e.stopPropagation();
    const currentValues = Array.isArray(internalValue) ? internalValue : [];
    const newValues = currentValues.filter((v: string | number) => v !== valToRemove);
    
    if (setValue && name) {
      setValue(name, newValues as any, { shouldValidate: true, shouldDirty: true });
    }
    if (onValueChange) {
      onValueChange(newValues);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!clearable) return; // Guard clause
    const newValue = (multiple ? [] : "") as any;
    
    if (setValue && name) {
      setValue(name, newValue, { shouldValidate: true, shouldDirty: true });
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
    
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !inputValue && multiple && Array.isArray(internalValue) && internalValue.length > 0) {
      const newValues = [...internalValue];
      newValues.pop();
      if (setValue && name) {
        setValue(name, newValues as any, { shouldValidate: true, shouldDirty: true });
      }
      if (onValueChange) {
        onValueChange(newValues);
      }
    }
    if (e.key === "Enter" && isOpen && filteredOptions.length > 0) {
        e.preventDefault();
        handleSelect(filteredOptions[0].value);
    }
    // Prevent typing if not searchable
    if (!searchable && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setInputValue("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updatePosition = useEffectEvent(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const buffer = 10;
    const requiredSpace = dropdownHeight + buffer;

    const shouldFlipToTop = spaceBelow < requiredSpace && spaceAbove >= requiredSpace;
    const newPosition = shouldFlipToTop ? "top" : "bottom";

    setDropdownPosition((prev) => (prev !== newPosition ? newPosition : prev));
  });

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isOpen]); 

  useLayoutEffect(() => {
    if(isOpen) {
        updatePosition();
    }
  }, [dropdownHeight, isOpen]);


  const isSelected = (val: string | number) => {
    if (multiple && Array.isArray(internalValue)) return internalValue.includes(val as never);
    return internalValue === val;
  };

  const singleSelectedLabel = useMemo(() => {
    if (multiple || !options || !Array.isArray(options)) return null;
    return options.find(o => o.value === internalValue)?.label;
  }, [multiple, options, internalValue]);

  const showClear = clearable && !disabled && (multiple ? (Array.isArray(internalValue) && internalValue.length > 0) : !!internalValue);

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700/90">
          {label}
        </label>
      )}

      <div className="relative" ref={containerRef}>
        {/* --- TRIGGER AREA --- */}
        <div
          ref={ref} 
          onClick={handleContainerClick}
          className={cn(
            "min-h-[46px] w-full px-3.5 py-2 border rounded-xl flex items-center bg-white transition-all duration-200 cursor-text shadow-sm",
            "hover:border-gray-300",
            isOpen ? cn("ring-4", roleStyles[role].trigger) : "border-gray-200",
            disabled ? "bg-gray-50 cursor-not-allowed opacity-70" : "",
            error ? "border-red-500 ring-red-500/10" : "",
            !searchable && "cursor-pointer"
          )}
        >
          <div className="flex flex-wrap gap-1.5 flex-1 items-center overflow-hidden">
            {multiple && Array.isArray(internalValue) && internalValue.map((val: string | number) => {
              const opt = options?.find((o) => o.value === val);
              return (
                <span 
                  key={val} 
                  className={cn(
                    "text-xs px-2 py-1 rounded-md flex items-center gap-1.5 max-w-full border transition-colors",
                    roleStyles[role].tag
                  )}
                >
                  <span className="truncate max-w-[150px] font-medium">{opt?.label || val}</span>
                  {!disabled && (
                      <X 
                      size={12} 
                      className="opacity-60 hover:opacity-100 cursor-pointer shrink-0"
                      onMouseDown={(e: React.MouseEvent) => e.preventDefault()} 
                      onClick={(e: React.MouseEvent) => handleRemoveTag(e, val)}
                      />
                  )}
                </span>
              );
            })}

            {!multiple && internalValue && !inputValue && (
              <span className="absolute left-3.5 text-gray-900 text-sm font-medium pointer-events-none truncate max-w-[calc(100%-48px)]">
                {singleSelectedLabel}
              </span>
            )}

            <div className="flex-1 min-w-[4px] inline-grid">
               <input
                ref={inputRef}
                type="text"
                value={inputValue}
                readOnly={!searchable}
                onChange={(e) => {
                  if (searchable) {
                    setInputValue(e.target.value);
                  }
                  if (!isOpen) setIsOpen(true);
                }}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className={cn(
                  "w-full bg-transparent border-none outline-none text-sm p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0",
                  !searchable && "caret-transparent cursor-pointer"
                )}
                style={{ minWidth: '50px' }}
                placeholder={
                  (multiple && Array.isArray(internalValue) && internalValue.length > 0) || (!multiple && internalValue) 
                  ? "" 
                  : placeholder
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-2 shrink-0 text-gray-400">
             {loading ? (
               <Loader2 className="w-4 h-4 animate-spin" />
             ) : (
               <>
                 {showClear && (
                   <div 
                     onClick={handleClear}
                     className="p-1 rounded-full hover:bg-gray-100 hover:text-red-500 transition-colors cursor-pointer"
                   >
                      <X className="w-3.5 h-3.5" />
                   </div>
                 )}
                 <ChevronDown 
                   className={cn(
                     "w-4 h-4 transition-transform duration-300", 
                     isOpen && "rotate-180"
                   )} 
                 />
               </>
             )}
          </div>
        </div>

        {/* --- DROPDOWN --- */}
        {isOpen && !disabled && (
          <div 
            className={cn(
              "absolute z-50 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200",
              dropdownPosition === "top" 
                ? "bottom-full mb-2 origin-bottom" 
                : "top-full mt-2 origin-top"
            )}
            style={{ width: bounds.width || "100%" }} 
          >
            {filteredOptions.length > 0 ? (
              <VirtualList
                items={filteredOptions}
                height={Math.min(filteredOptions.length * 36, 250)}
                itemHeight={36}
                renderItem={(option: SelectOption) => {
                  const selected = isSelected(option.value);
                  return (
                    <div
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        "px-3.5 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors truncate",
                        selected ? roleStyles[role].item : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      {selected && <Check className={cn("w-4 h-4 shrink-0 ml-2", roleStyles[role].check)} />}
                    </div>
                  );
                }}
              />
            ) : (
              <div className="px-3.5 py-10 text-center text-sm text-gray-400 font-medium italic">
                No matching options
              </div>
            )}
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
            {error?.message}
          </p>
        </div>
      </div>
    </div>
  );
};
