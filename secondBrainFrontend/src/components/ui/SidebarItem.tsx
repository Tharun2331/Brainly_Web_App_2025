import { type ReactElement  } from "react";
export const SidebarItem =({text,icon,isActive,onClick}:{
  text:string;
  icon: ReactElement;
  onClick?: () => void;
  isActive?: boolean;
}) => {
  return <div className={`flex text-foreground cursor-pointer rounded-lg max-w-58 transition-all duration-150 ${isActive ? "bg-primary text-primary-foreground font-bold" : "hover:bg-muted"}`}  onClick={onClick}>
  <div className="p-2">
      {icon} 
    </div>
  <div className="p-2">
    {text}
  </div>
  </div>
}
