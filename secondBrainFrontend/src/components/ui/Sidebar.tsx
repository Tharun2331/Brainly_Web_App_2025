import { Button } from "./Button"
import { SidebarItem } from "./SidebarItem"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../hooks/redux"
import { logout } from "../../store/slices/authSlice"
import { setFilter } from "../../store/slices/contentSlice"
import {
  Brain,
  Twitter,
  Youtube,
  FileText,
  StickyNote,
  Grid3X3,
  LogOut,
  X
} from "lucide-react"
import { closeSidebar } from "../../store/slices/uiSlice"


export function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const currentFilter = useAppSelector(state => state.content.filter);
  const isSidebarOpen = useAppSelector(state => state.ui.isSidebarOpen);
  
  const handleLogout = () => {
    dispatch(logout());
    dispatch(closeSidebar());
    navigate("/signin");
  }

  const handleSetContent = (filterType: "all" | "twitter" | "youtube" | "article" | "note") => {
    dispatch(setFilter(filterType));
    dispatch(closeSidebar());
  }

  const handleCloseSidebar = () => {
    dispatch(closeSidebar());
  }

    return ( 
    <>
   {/* Backdrop for mobile - blurred background */}
    {isSidebarOpen && (
      <div 
      className="sm:hidden fixed insert-0 bg-black/60 backdrop-blur-md z-40 transition-opacity duration-300"
      onClick={handleCloseSidebar}
      aria-hidden="true"
      />
    )}

  {/* Desktop Sidebar - Always visible on desktop (sm and above) */}
    <div className="hidden sm:flex h-screen bg-card border-r border-border w-72 fixed left-0 top-0 pl-6 flex-col justify-between z-30">
      <div>
        {/* Desktop Header */}
               {/* Desktop Header */}
               <div className="flex text-2xl items-center gap-4 pt-4">
            <div className="ml-2">
              <Brain />
            </div>
            Brainly
          </div>
{/* Desktop Navigation */}
<div className="pt-8 pl-4">
            <SidebarItem 
              text={"Tweets"}
              icon={<Twitter />} 
              onClick={() => handleSetContent("twitter")}
              isActive={currentFilter === "twitter"}
            />
            <SidebarItem
              text={"Youtube"} 
              icon={<Youtube />}  
              onClick={() => handleSetContent("youtube")}
              isActive={currentFilter === "youtube"} 
            />
            <SidebarItem 
              text={"Articles"}
              icon={<FileText />}
              onClick={() => handleSetContent("article")}
              isActive={currentFilter === "article"}
            />
            <SidebarItem 
              text={"Notes"}
              icon={<StickyNote />}
              onClick={() => handleSetContent("note")}
              isActive={currentFilter === "note"}
            />
            <SidebarItem
              text={"All"} 
              icon={<Grid3X3 />}  
              onClick={() => handleSetContent("all")}
              isActive={currentFilter === "all"}
            />
          </div>
      </div>
        {/* Desktop Logout Button */}
        <div className="flex items-end justify-center mb-8 mr-4">
          <Button 
            text={"Logout"} 
            onClick={handleLogout} 
            fullWidth={true} 
            className="hover:bg-chart-4 flex justify-start" 
            startIcon={<LogOut />}
          />
        </div>
        </div>
      {/* Mobile Sidebar - Slides in from left, takes 70% width */}
      <div 
        className={`
          sm:hidden 
          fixed 
          top-0 
          left-0 
          h-screen 
          bg-card 
          border-r 
          border-border 
          w-[70%] 
          z-50 
          transform 
          transition-transform 
          duration-300 
          ease-in-out 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          flex 
          flex-col 
          justify-between 
          pl-6
          shadow-2xl
        `}
      >
<div className="flex-1 overflow-y-auto">
          {/* Mobile Header with Close Button */}
          <div className="flex items-center justify-between pt-4 pr-4 pb-2 sticky top-0 bg-card z-10">
            <div className="flex text-xl items-center gap-3">
              <div className="ml-2">
                <Brain className="w-6 h-6" />
              </div>
              <span className="font-semibold">Brainly</span>
            </div>
            <button
              onClick={handleCloseSidebar}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Navigation Items */}
          <div className="pt-6 pl-4 pr-4">
            <SidebarItem 
              text={"Tweets"}
              icon={<Twitter />} 
              onClick={() => handleSetContent("twitter")}
              isActive={currentFilter === "twitter"}
            />
            <SidebarItem
              text={"Youtube"} 
              icon={<Youtube />}  
              onClick={() => handleSetContent("youtube")}
              isActive={currentFilter === "youtube"} 
            />
            <SidebarItem 
              text={"Articles"}
              icon={<FileText />}
              onClick={() => handleSetContent("article")}
              isActive={currentFilter === "article"}
            />
            <SidebarItem 
              text={"Notes"}
              icon={<StickyNote />}
              onClick={() => handleSetContent("note")}
              isActive={currentFilter === "note"}
            />
            <SidebarItem
              text={"All"} 
              icon={<Grid3X3 />}  
              onClick={() => handleSetContent("all")}
              isActive={currentFilter === "all"}
            />
          </div>
        </div>

        {/* Mobile Logout Button - Inside Sidebar */}
        <div className="flex items-end justify-center mb-6 mr-4 mt-4">
          <Button 
            text={"Logout"} 
            onClick={handleLogout} 
            fullWidth={true} 
            className="hover:bg-chart-4 flex justify-start" 
            startIcon={<LogOut />}
          />
        </div>
        </div>

      </>
    )
}