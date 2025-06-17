import { BrainIcon } from "../../icons/Brainly"
import { HashTagsIcon } from "../../icons/HashTagsIcon"
import { LinkIcon } from "../../icons/LinkIcon"
import { TwitterIcon } from "../../icons/TwitterIcon"
import { YoutubeIcon } from "../../icons/YoutubeIcon"
import { SidebarItem } from "./SidebarItem"

export function Sidebar() {
  return <div className="h-screen bg-white border-r border-r-gray-300 w-72 fixed left-0 top-0 pl-6 ">
    <div className="flex text-2xl items-center gap-4 pt-4 ">
      <div className="ml-2 ">
      <BrainIcon />
      </div>
        Brainly

  
    </div>
    <div className="pt-8 pl-4">
      <SidebarItem text={"Tweets"}  icon={<TwitterIcon />} />
      <SidebarItem text={"Youtube"} icon={<YoutubeIcon />} />
      <SidebarItem text={"Links"} icon={<LinkIcon />} />
      <SidebarItem text={"Tags"} icon={<HashTagsIcon />}/>
    </div>

  </div>
}