import type { ReactElement } from "react";

export interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  text?: string;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  onClick?:() => void;
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
}

const variantStyles = {
  "primary": "bg-[var(--color-purple-600)] text-white",
  'secondary': "bg-[var(--color-purple-200)] text-[var(--color-purple-600)]"
}

const defaultStyles = "rounded-md font-medium cursor-pointer"

const sizeStyles = {
  "sm": "py-2 px-6 text-sm rounded-md",
  "md": "py-3 px-8 text-base rounded-md", 
  "lg": "py-4 px-10 text-lg rounded-lg"
}

export const Button = (props: ButtonProps) => {
    const isDisabled = props.loading || false;
  return (
    <button
      onClick={props.onClick}
      className={`${variantStyles[props.variant?? ""]} ${sizeStyles[props.size ?? "md"]} ${defaultStyles} ${
        props.fullWidth ? "w-full flex justify-center items-center" : ""
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${props.className || ""}`}
      disabled={isDisabled}
    >
      <div className="flex items-center">
        {props.startIcon ? <div className="pr-2">{props.startIcon}</div> : null}
        {props.text}
        {props.endIcon}
      </div>
    </button>
  );
}