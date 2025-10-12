// src/pages/Dashboard.tsx - Add chat components
import "../App.css";
import { Card } from "../components/ui/Card";
import { CreateContentModal } from "../components/ui/CreateContentModal";
import { useState, useEffect, useRef } from "react";
import { Sidebar } from "../components/ui/Sidebar";
import { generateShareLink, clearShareLink, toggleSidebar, toggleDarkMode } from "../store/slices/uiSlice";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { deleteContent, fetchContents } from "../store/slices/contentSlice";
import { useTheme } from "../hooks/useTheme";
import SearchBar from "../components/ui/SearchBar";
import { DashboardHeader } from "../components/ui/DashboardHeader";
import { ProcessingMonitor } from "../components/ui/ProcessingMonitor";
import { ChatInterface } from "../components/ui/ChatInterface"; // NEW
import { ChatButton } from "../components/ui/ChatButton"; // NEW

export function Dashboard() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector(state => state.auth);
  const { shareLoading, shareError } = useAppSelector(state => state.ui);
  const { contents, filter } = useAppSelector(state => state.content);
  const [modalOpen, setModalOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [selectedNote, setSelectedNote] = useState<{
    _id: string;
    description?: string;
    title?: string;
    tags?: string[];
  } | null>(null);

  // Track completed items to avoid duplicate notifications
  const completedItemsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (token) {
      dispatch(fetchContents({ filter, token }));
    }
  }, [dispatch, filter, token]);

  // Auto-refresh content when there are pending/processing items
  useEffect(() => {
    if (!token) return;

    // Check if there are any pending or processing items
    const hasProcessingItems = contents.some(content => 
      content.processingStatus === 'pending' || content.processingStatus === 'processing'
    );

    if (hasProcessingItems) {
      // Refresh every 5 seconds while there are processing items
      const interval = setInterval(() => {
        dispatch(fetchContents({ filter, token }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [dispatch, filter, token, contents]);

  // Track processing completion
  useEffect(() => {
    if (!token) return;

    // Check for newly completed items
    const completedItems = contents.filter(content => 
      content.processingStatus === 'completed' && 
      content.contentMetadata?.extractedAt
    );

    // Find items that are newly completed (not in our tracking set)
    const newlyCompletedItems = completedItems.filter(item => 
      !completedItemsRef.current.has(item._id)
    );

    if (newlyCompletedItems.length > 0) {
      // Add all newly completed items to our tracking set
      newlyCompletedItems.forEach(item => {
        completedItemsRef.current.add(item._id);
      });
    }

    // Update tracking set to include all currently completed items
    // This ensures we don't miss any items if the component re-renders
    completedItems.forEach(item => {
      completedItemsRef.current.add(item._id);
    });
  }, [contents, token]);

  const handleDelete = async (contentId: string) => {
    try {
      if (!token) {
        toast.error("Please log in to delete content", { 
          position: "top-right", 
          autoClose: 3000 
        });
        return;
      }
      await dispatch(deleteContent({ id: contentId, token })).unwrap();

      toast.success("Content deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete content", { 
        position: "top-right", 
        autoClose: 3000 
      });
    }
  };

  const handleShare = async () => {
    if (!token) {
      toast.error("Please log in to share your brain", {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }

    try {
      const resultAction = await dispatch(generateShareLink(token));
      if (generateShareLink.fulfilled.match(resultAction)) {
        const newShareLink = resultAction.payload;
        toast.success(
          <div>
            <p className="font-semibold mb-2">Share Link Generated!</p>
            <input
              type="text"
              value={newShareLink}
              readOnly
              className="w-full p-2 mt-2 border border-border rounded bg-background text-foreground"
              onClick={(e) => e.currentTarget.select()}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(newShareLink);
                toast.info("Link copied to clipboard!", { autoClose: 2000 });
              }}
              className="mt-2 w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Copy Link
            </button>
          </div>,
          {
            position: "top-right",
            autoClose: 10000,
          }
        );
      }
    } catch (error) {
      toast.error("Failed to generate share link. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const handleEditNote = (note: { 
    _id: string; 
    title?: string; 
    description?: string; 
    tags?: string[] 
  }) => {
    setSelectedNote(note);
    setModalOpen(true);
  };

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const extractTagStrings = (tags: any): string[] => {
    if (!tags || !Array.isArray(tags)) return [];
    
    return tags.map((tag: any) => {
      if (typeof tag === 'string') return tag;
      if (tag && typeof tag === 'object' && 'tag' in tag) return tag.tag;
      return '';
    }).filter(Boolean);
  };

  return (
    <div>
      <Sidebar />
      
      <div className="p-4 ml-0 sm:ml-72 min-h-screen bg-background">
        <CreateContentModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedNote(null);
          }}
          selectedNote={selectedNote}
        />

        <DashboardHeader
          isDarkMode={isDarkMode}
          shareLoading={shareLoading}
          onToggleDarkMode={handleToggleDarkMode}
          onShareBrain={handleShare}
          onAddContent={() => setModalOpen(true)}
          onToggleSidebar={handleToggleSidebar}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {token && <ProcessingMonitor token={token} />}

        {/* Processing Status Indicator */}
        {(() => {
          const processingCount = contents.filter(content => 
            content.processingStatus === 'pending' || content.processingStatus === 'processing'
          ).length;
          
          if (processingCount > 0) {
            return (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-lg mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-sm">
                  {processingCount} item{processingCount > 1 ? 's' : ''} being processed...
                </p>
              </div>
            );
          }
          return null;
        })()}

        <div className="hidden md:block mb-6">
          <SearchBar isMobile={false} />
        </div>

        {isSearchOpen && (
          <SearchBar
            isMobile={true}
            onClose={() => setIsSearchOpen(false)}
          />
        )}

        {shareError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mt-4 flex items-start justify-between">
            <p className="flex-1">{shareError}</p>
            <button
              onClick={() => dispatch(clearShareLink())}
              className="text-sm underline hover:no-underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {contents.map(({ type, link, title, description, _id, tags, processingStatus, processingError, contentMetadata }, index) => (
            <Card
              key={`${_id}-${index}`}
              type={type as "twitter" | "youtube" | "article" | "note"}
              link={link}
              title={title}
              description={description}
              contentId={_id}
              tags={tags}
              onDelete={handleDelete}
              onClick={() => type === "note" && handleEditNote({ 
                _id, 
                title, 
                description, 
                tags: extractTagStrings(tags)
              })}
              processingStatus={processingStatus}
              processingError={processingError}
              contentMetadata={contentMetadata}
            />
          ))}
        </div>

        {contents.length === 0 && !shareError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No content yet</h3>
            <p className="text-muted-foreground mb-6">Start adding your favorite content to organize your brain</p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add Your First Content
            </button>
          </div>
        )}
      </div>

      {/* NEW: Chat Interface and Button */}
      <ChatInterface />
      <ChatButton />
    </div>
  );
}