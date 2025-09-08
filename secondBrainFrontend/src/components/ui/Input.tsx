// src/components/ui/Input.tsx
import { forwardRef } from "react";

interface InputProps {
  placeholder: string;
  required: boolean;
  defaultValue?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, required, defaultValue = "" }, ref) => {
    return (
      <div>
        <input
          placeholder={placeholder}
          type="text"
          className="px-4 py-2 border-1 border-gray-300 m-2"
          ref={ref}
          required={required}
          defaultValue={defaultValue}
        />
      </div>
    );
  }
);

export const MultiInput = forwardRef<HTMLTextAreaElement, InputProps>(
  ({ placeholder, required, defaultValue = "" }, ref) => {
    return (
      <div>
        <textarea
          placeholder={placeholder}
          ref={ref}
          required={required}
          className="px-4 py-2 border-1 border-gray-300 m-2"
          defaultValue={defaultValue}
        />
      </div>
    );
  }
);