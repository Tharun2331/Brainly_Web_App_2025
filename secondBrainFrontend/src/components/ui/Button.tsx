import type { ReactElement } from "react";

export interface ButtonProps {
  variant: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  text: string;
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

const defaultStyles = "px-4 py-2 rounded-md font-light cursor-pointer"


const sizeStyles = {
  "sm": "py-2 px-2  rounded-sm ",
  "md": "py-4 px-4  rounded-md",
  "lg": "py-6 px-6  rounded-xl"
}

export const Button = (props: ButtonProps) => {
    const isDisabled = props.loading || false;
    return <button onClick={props.onClick} className={`${variantStyles[props.variant]}  ${sizeStyles[props.size ?? "md"]} ${defaultStyles} ${
        props.fullWidth ? "w-full flex justify-center items-center" : ""
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      disabled={isDisabled}>
      <div className="flex items-center justify-center">
           {props.startIcon ? <div className="pr-2"> {props.startIcon}</div> : null } {props.text} {props.endIcon}
      </div> 

    </button>
}

 
