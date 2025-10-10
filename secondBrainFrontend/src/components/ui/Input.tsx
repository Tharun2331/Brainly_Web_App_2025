// src/components/ui/Input.tsx
import { forwardRef, useState } from "react";

interface InputProps {
  placeholder: string;
  required?: boolean;
  defaultValue?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  label?: string;
  helperText?: string;
  showPasswordToggle?: boolean;
  autoComplete?: string;
  name?: string;
}

interface MultiInputProps {
  placeholder: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  error?: string;
  touched?: boolean;
  label?: string;
  helperText?: string;
  maxLength?: number;
  rows?: number;
  name?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { 
      placeholder, 
      required, 
      defaultValue = "", 
      type = "text", 
      value, 
      onChange,
      onBlur,
      error,
      touched,
      label,
      helperText,
      showPasswordToggle = false,
      autoComplete,
      name
    }, 
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const hasError = touched && error;
    
    const inputType = showPasswordToggle && showPassword ? "text" : type;

    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            name={name}
            placeholder={placeholder}
            type={inputType}
            required={required}
            autoComplete={autoComplete}
            className={`
              w-full px-4 py-3 bg-muted border rounded-lg transition-all duration-200 text-foreground placeholder:text-muted-foreground
              ${hasError 
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50 dark:bg-red-950/20" 
                : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-muted-foreground"
              }
              ${touched && !error ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}
              focus:outline-none focus:bg-background
            `}
            {...(value !== undefined ? { value, onChange } : { defaultValue })}
            onBlur={onBlur}
            aria-invalid={hasError ? "true" : "false"}
            aria-describedby={hasError ? `${name}-error` : undefined}
          />
          
          {/* Success checkmark - positioned to the left of password toggle if present */}
          {touched && !error && !showPasswordToggle && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {/* Success checkmark for password fields - positioned to the left of toggle */}
          {touched && !error && showPasswordToggle && type === "password" && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {/* Password visibility toggle */}
          {showPasswordToggle && type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" 
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                  />
                </svg>
              )}
            </button>
          )}
        </div>
        
        {/* Helper text or error message */}
        {hasError && (
          <p id={`${name}-error`} className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
        {!hasError && helperText && (
          <p className="mt-2 text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

export const MultiInput = forwardRef<HTMLTextAreaElement, MultiInputProps>(
  (
    { 
      placeholder, 
      required, 
      defaultValue = "", 
      value, 
      onChange,
      onBlur,
      error,
      touched,
      label,
      helperText,
      maxLength,
      rows = 4,
      name
    }, 
    ref
  ) => {
    const hasError = touched && error;
    const [charCount, setCharCount] = useState(value?.length || defaultValue.length);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            name={name}
            placeholder={placeholder}
            required={required}
            rows={rows}
            maxLength={maxLength}
            className={`
              w-full px-4 py-3 bg-muted border rounded-lg transition-all duration-200 resize-vertical text-foreground placeholder:text-muted-foreground
              ${hasError 
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50 dark:bg-red-950/20" 
                : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-muted-foreground"
              }
              ${touched && !error ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}
              focus:outline-none focus:bg-background min-h-[120px]
            `}
            {...(value !== undefined 
              ? { value, onChange: handleChange } 
              : { defaultValue, onChange: handleChange }
            )}
            onBlur={onBlur}
            aria-invalid={hasError ? "true" : "false"}
            aria-describedby={hasError ? `${name}-error` : undefined}
          />
          
          {/* Character count */}
          {maxLength && (
            <div className={`absolute bottom-3 right-3 text-xs px-2 py-1 rounded bg-background border ${
              charCount > maxLength * 0.9 ? "text-orange-500 border-orange-200" : "text-muted-foreground border-border"
            }`}>
              {charCount}/{maxLength}
            </div>
          )}
        </div>
        
        {/* Helper text or error message */}
        {hasError && (
          <p id={`${name}-error`} className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
        {!hasError && helperText && (
          <p className="mt-2 text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

// Password strength indicator component
interface PasswordStrengthIndicatorProps {
  password: string;
  show: boolean;
}

export const PasswordStrengthIndicator = ({ password, show }: PasswordStrengthIndicatorProps) => {
  if (!show || !password) return null;

  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;
    
    return {
      score,
      percentage: (score / 5) * 100,
      label: 
        score === 0 ? "Very Weak" :
        score === 1 ? "Weak" :
        score === 2 ? "Fair" :
        score === 3 ? "Good" :
        score === 4 ? "Strong" : "Very Strong",
      color:
        score === 0 ? "bg-red-500" :
        score === 1 ? "bg-orange-500" :
        score === 2 ? "bg-yellow-500" :
        score === 3 ? "bg-lime-500" :
        score === 4 ? "bg-green-500" : "bg-green-600"
    };
  };

  const strength = getStrength();

  return (
    <div className="mt-3 p-3 bg-muted border border-border rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-foreground">Password strength</span>
        <span className={`text-xs font-semibold ${
          strength.score <= 2 ? "text-red-600" : 
          strength.score <= 3 ? "text-yellow-600" : "text-green-600"
        }`}>
          {strength.label}
        </span>
      </div>
      <div className="w-full bg-background rounded-full h-2 mb-3">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${strength.color}`}
          style={{ width: `${strength.percentage}%` }}
        />
      </div>
      <ul className="text-xs space-y-1">
        <li className={`flex items-center gap-2 ${
          password.length >= 8 ? "text-green-600" : "text-muted-foreground"
        }`}>
          <span className={`w-3 h-3 rounded-full border ${
            password.length >= 8 ? "bg-green-500 border-green-500" : "border-muted-foreground"
          }`}>
            {password.length >= 8 && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </span>
          At least 8 characters
        </li>
        <li className={`flex items-center gap-2 ${
          /[a-z]/.test(password) && /[A-Z]/.test(password) ? "text-green-600" : "text-muted-foreground"
        }`}>
          <span className={`w-3 h-3 rounded-full border ${
            /[a-z]/.test(password) && /[A-Z]/.test(password) ? "bg-green-500 border-green-500" : "border-muted-foreground"
          }`}>
            {/[a-z]/.test(password) && /[A-Z]/.test(password) && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </span>
          Upper and lowercase letters
        </li>
        <li className={`flex items-center gap-2 ${
          /[!@#$%^&*]/.test(password) ? "text-green-600" : "text-muted-foreground"
        }`}>
          <span className={`w-3 h-3 rounded-full border ${
            /[!@#$%^&*]/.test(password) ? "bg-green-500 border-green-500" : "border-muted-foreground"
          }`}>
            {/[!@#$%^&*]/.test(password) && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </span>
          At least one special character (!@#$%^&*)
        </li>
      </ul>
    </div>
  );
};

Input.displayName = "Input";
MultiInput.displayName = "MultiInput";