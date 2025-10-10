// src/components/ui/Note.tsx
import { forwardRef, useState } from "react";
import { Input } from "./Input";

interface NoteProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  tagRef?: React.RefObject<HTMLInputElement | null>;
  titleRef?: React.RefObject<HTMLInputElement | null>;
  defaultTitle?: string;
  defaultTags?: string;
  maxLength?: number;
  error?: string;
  touched?: boolean;
  helperText?: string;
}

export const Note = forwardRef<HTMLTextAreaElement, NoteProps>(
  ({ 
    tagRef, 
    titleRef, 
    defaultTitle = "", 
    defaultTags = "",
    maxLength,
    error,
    touched,
    helperText,
    name,
    ...props 
  }, ref) => {
    const hasError = touched && error;
    const [charCount, setCharCount] = useState(props.defaultValue?.toString().length || 0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    return (
      <div className="space-y-4">
        {/* Title Input */}
        <Input 
          ref={titleRef} 
          placeholder="Title" 
          required={true} 
          defaultValue={defaultTitle}
        />
        
        {/* Description Textarea - Using MultiInput styling */}
        <div className="mb-4">
          <div className="relative">
            <textarea
              {...props}
              ref={ref}
              name={name}
              placeholder="Start writing your note..."
              required
              rows={8}
              maxLength={maxLength}
              className={`
                w-full px-4 py-3 bg-muted border rounded-lg transition-all duration-200 resize-vertical text-foreground placeholder:text-muted-foreground
                ${hasError 
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50 dark:bg-red-950/20" 
                  : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-muted-foreground"
                }
                ${touched && !error ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}
                focus:outline-none focus:bg-background min-h-[200px]
              `}
              onChange={handleChange}
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

        {/* Tags Input */}
        <Input 
          ref={tagRef} 
          placeholder="Tags (comma separated)" 
          required={true} 
          defaultValue={defaultTags}
        />
      </div>
    );
  }
);