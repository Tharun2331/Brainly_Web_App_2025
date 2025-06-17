import { ShareIcon } from "../../icons/ShareIcon";
import { type ReactElement  } from "react";
export const SidebarItem =({text,icon}:{
  text:string;
  icon: ReactElement;
}) => {
  return <div className="flex text-gray-700 cursor-pointer hover:bg-[var(--color-gray-300)] rounded max-w-48 transition-all duration-150">
  <div className="p-2">
      {icon} 
    </div>
  <div className="p-2">
    {text}
  </div>
  </div>
}