import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShareCard } from "../components/ui/ShareCard";
import { fetchSharedContents } from "../store/slices/contentSlice";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { Loader2, AlertCircle, Users, Moon, Sun } from "lucide-react";


export const Share = () => {

  const { shareId } = useParams<{ shareId: string }>(); // Get hash from URL
  const dispatch = useAppDispatch();

  const {
    sharedContents,
    sharedUsername,
    sharedLoading,
    sharedError
  } = useAppSelector(state => state.content);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme !== null) {
        return JSON.parse(savedTheme);
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Dark mode toggle handler
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      // Apply dark class to document
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  useEffect(() => {
    if (shareId) {
      dispatch(fetchSharedContents(shareId));
    }
  }, [dispatch,shareId]);

  // Initialize dark mode on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);


  if (sharedLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <div className="text-lg font-medium text-foreground">Loading shared content...</div>
          <div className="text-sm text-muted-foreground mt-2">Please wait while we fetch the content</div>
        </div>
      </div>
    );
  }

  if(sharedError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <div className="text-lg font-medium text-foreground mb-2">
            Unable to load shared content
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            {sharedError}
          </div>
          <div className="text-xs text-muted-foreground">
            Please check the share link or try again later.
          </div>
        </div>
      </div>
    );
  }

 // Empty state
 if (!sharedContents.length) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <div className="text-lg font-medium text-foreground mb-2">
          No content available
        </div>
        <div className="text-sm text-muted-foreground">
          This share link doesn't contain any content yet, or the content may have been removed.
        </div>
      </div>
    </div>
  );
}


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Shared Content
                </h1>
                <p className="text-sm text-muted-foreground">
                  Curated by {sharedUsername}
                </p>
              </div>
            </div>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-foreground" />
              ) : (
                <Moon className="w-4 h-4 text-foreground" />
              )}
              <span className="text-sm font-medium text-foreground">
                {isDarkMode ? "Light" : "Dark"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {(() => {
          const filteredContents = sharedContents.filter(({ type }) => type !== "note");
          return (
            <>
              <div className="mb-6">
                <div className="text-sm text-muted-foreground">
                  {filteredContents.length} item{filteredContents.length !== 1 ? 's' : ''} shared
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredContents.map(({ type, link, description, title, _id, tags }) => (
                  <ShareCard
                    key={_id}
                    type={type as "twitter" | "youtube" | "article"}
                    link={link}
                    title={title}
                    description={description}
                    contentId={_id}
                    tags={tags}
                  />
                ))}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};