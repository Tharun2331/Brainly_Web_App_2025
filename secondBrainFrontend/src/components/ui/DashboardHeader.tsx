// src/components/ui/DashboardHeader.tsx
import { Moon, Sun, Menu as MenuIcon, Search, Plus as PlusIcon, Share2 as ShareIcon } from "lucide-react";
import { Tooltip } from "./Tooltip";

interface DashboardHeaderProps {
  isDarkMode: boolean;
  shareLoading: boolean;
  onToggleDarkMode: () => void;
  onShareBrain: () => void;
  onAddContent: () => void;
  onToggleSidebar: () => void;
  onOpenSearch?: () => void;
}

export function DashboardHeader({
  isDarkMode,
  shareLoading,
  onToggleDarkMode,
  onShareBrain,
  onAddContent,
  onToggleSidebar,
  onOpenSearch,
}: DashboardHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border pb-4 mb-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Tooltip content="Menu">
            <button
              onClick={onToggleSidebar}
              className="sm:hidden p-2.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors active:scale-95"
              aria-label="Open menu"
            >
              <MenuIcon className="w-5 h-5 text-foreground" />
            </button>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Tooltip content="Search">
            <button
              onClick={onOpenSearch}
              className="md:hidden p-2.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors active:scale-95"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-foreground" />
            </button>
          </Tooltip>

          <Tooltip content={isDarkMode ? "Light mode" : "Dark mode"}>
            <button
              onClick={onToggleDarkMode}
              className="p-2.5 md:px-4 md:py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors active:scale-95 flex items-center gap-2 cursor-pointer"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-foreground" />
              )}
              <span className="hidden md:inline text-sm font-medium text-foreground">
                {isDarkMode ? "Light" : "Dark"}
              </span>
            </button>
          </Tooltip>
          <Tooltip content={shareLoading ? "Generating link..." : "Share Brain"}>
            <button
              onClick={onShareBrain}
              disabled={shareLoading}
              className={`p-2.5 md:px-4 md:py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors active:scale-95 flex items-center gap-2 cursor-pointer ${
                shareLoading ? "opacity-50 cursor-not-allowed " : ""
              }`}
              aria-label="Share brain"
            >
              {shareLoading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShareIcon className="w-5 h-5 text-foreground" />
              )}
              <span className="hidden md:inline text-sm font-medium text-foreground">
                {shareLoading ? "Sharing..." : "Share"}
              </span>
            </button>
          </Tooltip>

          <Tooltip content="Add Content">
            <button
              onClick={onAddContent}
              className="p-2.5 md:px-4 md:py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors active:scale-95 shadow-sm flex items-center gap-2 cursor-pointer"
              aria-label="Add content"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="hidden md:inline text-sm font-medium">
                Add Content
              </span>
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}