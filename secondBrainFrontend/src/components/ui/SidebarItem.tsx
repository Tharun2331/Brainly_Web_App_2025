import { type ReactElement  } from "react";
export const SidebarItem =({text,icon,isActive,onClick}:{
  text:string;
  icon: ReactElement;
  onClick?: () => void;
  isActive?: boolean;
}) => {
  return <div className={`flex text-gray-700 cursor-pointer rounded max-w-48 transition-all duration-150 ${isActive ? "bg-gray-300 font-bold" : "hover:bg-gray-200"} `} onClick={onClick}>
  <div className="p-2">
      {icon} 
    </div>
  <div className="p-2">
    {text}
  </div>
  </div>
}
