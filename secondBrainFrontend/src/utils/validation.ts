// src/utils/validation.ts
import { z } from "zod";

// Validation schemas (matching backend)
export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password cannot exceed 20 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/,
      "Password must contain lowercase, uppercase, and special character"
    ),
});

export const signinSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const contentSchema = z.object({
  link: z.string().url("Invalid URL format").optional().or(z.literal("")),
  type: z.enum(["note", "article", "twitter", "youtube"]),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().min(1, "Description is required").max(5000, "Description is too long"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
});

// Validation hook
import { useState, useCallback } from "react";

export interface ValidationErrors {
  [key: string]: string | undefined;
}

export function useValidation<T extends z.ZodSchema>(schema: T) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validate = useCallback(
    (data: z.infer<T>): boolean => {
      const result = schema.safeParse(data);
      
      if (!result.success) {
        const newErrors: ValidationErrors = {};
        result.error.issues.forEach((err) => {
          const path = err.path.join(".");
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
        return false;
      }
      
      setErrors({});
      return true;
    },
    [schema]
  );

  const validateField = useCallback(
    (fieldName: string, _value: any, fullData: any) => {
      setTouched((prev) => new Set(prev).add(fieldName));
      
      // Validate the entire form to get all errors
      const result = schema.safeParse(fullData);
      
      if (!result.success) {
        const fieldError = result.error.issues.find(
          (err) => err.path.join(".") === fieldName
        );
        
        setErrors((prev) => ({
          ...prev,
          [fieldName]: fieldError?.message,
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    },
    [schema]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched(new Set());
  }, []);

  const markFieldTouched = useCallback((fieldName: string) => {
    setTouched((prev) => new Set(prev).add(fieldName));
  }, []);

  return {
    errors,
    touched,
    validate,
    validateField,
    clearErrors,
    markFieldTouched,
    isFieldTouched: (fieldName: string) => touched.has(fieldName),
    getFieldError: (fieldName: string) => 
      touched.has(fieldName) ? errors[fieldName] : undefined,
  };
}

// Password strength checker
export interface PasswordStrength {
  score: number; // 0-4
  message: string;
  color: string;
}

export function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*]/.test(password)) score++;

  const strengthLevels: PasswordStrength[] = [
    { score: 0, message: "Very Weak", color: "red" },
    { score: 1, message: "Weak", color: "orange" },
    { score: 2, message: "Fair", color: "yellow" },
    { score: 3, message: "Good", color: "lightgreen" },
    { score: 4, message: "Strong", color: "green" },
    { score: 5, message: "Very Strong", color: "darkgreen" },
  ];

  return strengthLevels[score] || strengthLevels[0];
}

// Error parser for API responses
export interface ParsedError {
  message: string;
  fieldErrors?: ValidationErrors;
  code?: string;
}

export function parseApiError(error: any): ParsedError {
  // Handle Axios error response
  if (error.response?.data) {
    const data = error.response.data;
    
    if (data.success === false) {
      return {
        message: data.message || "An error occurred",
        fieldErrors: data.errors,
        code: data.code,
      };
    }
  }
  
  // Handle network errors
  if (error.code === "ERR_NETWORK") {
    return {
      message: "Network error. Please check your connection.",
      code: "NETWORK_ERROR",
    };
  }
  
  // Default error
  return {
    message: error.message || "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
  };
}