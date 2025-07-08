import {useState} from "react";
import { BrainIcon } from "../../icons/Brainly"
import { HashTagsIcon } from "../../icons/HashTagsIcon"
import { LinkIcon } from "../../icons/LinkIcon"
import { TwitterIcon } from "../../icons/TwitterIcon"
import { YoutubeIcon } from "../../icons/YoutubeIcon"
import { Button } from "./Button"
import { SidebarItem } from "./SidebarItem"
import { useNavigate } from "react-router-dom"

interface SidebarProps {
  content: string;
  setContent: (type: string) => void;
}

export function Sidebar({content, setContent}: SidebarProps) {


  const navigate= useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  }



  return (
    <div className="h-screen bg-white border-r border-r-gray-300 w-72 fixed left-0 top-0 pl-6 flex flex-col justify-between">
      <div>
        <div className="flex text-2xl items-center gap-4 pt-4 cursor-pointer hover:scale-110 transition-transform duration-200">
          <div className="ml-2 ">
            <BrainIcon />
          </div>
          Brainly
        </div>
        <div className="pt-8 pl-4">
          <SidebarItem 
          text={"Tweets"}
          icon={<TwitterIcon />} 
          onClick={()=> setContent("twitter")}
          isActive = {content === "twitter"}/>
          <SidebarItem
          text={"Youtube"} 
          icon={<YoutubeIcon />}  
          onClick={()=> setContent("youtube")}
          isActive = {content === "youtube"} />
         <SidebarItem
          text={"All"} 
          icon={<BrainIcon />}  
          onClick={()=> setContent("All")}
          isActive = {content === "All"}
          />

        </div>
      </div>
      <div className="flex items-end justify-center mb-8 mr-4">
        <Button variant="primary" text={"Logout"} onClick={handleLogout} fullWidth={true}  />
      </div>
    </div>
  );
}