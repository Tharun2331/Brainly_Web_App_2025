// src/components/ui/Card.tsx
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { 
  Trash2, 
  ExternalLink, 
  Youtube, 
  Twitter, 
  FileText, 
  StickyNote 
} from "lucide-react";

interface Tag {
  _id: string;
  tag: string;
}

// Allow both Tag objects and plain strings
type TagInput = Tag | string;

interface Cardprops {
  title?: string;
  link?: string;
  type: "twitter" | "youtube" | "article" | "note";
  tags?: TagInput[] | null;
  contentId: string;
  onDelete?: (contentId: string) => void;
  description?: string;
  onClick?: () => void;
}

export const Card = ({ 
  title, 
  link, 
  type, 
  contentId, 
  onDelete, 
  tags, 
  description, 
  onClick 
}: Cardprops) => {
  const tweetRef = useRef<HTMLQuoteElement>(null);
  const [, setTweetLoaded] = useState(false);
  const [embedError, setEmbedError] = useState(false);
  const tweetRenderedRef = useRef(false);
  

  
  // Truncate description to ~100 characters (~3 lines)
  const safeDescription = description || "";
  const truncatedDescription =
    safeDescription.length > 100 
      ? safeDescription.substring(0, 100) + "..." 
      : safeDescription;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (contentId) {
      onDelete && onDelete(contentId);
    } else {
      console.error("No contentId provided for deletion");
      toast.error("No content ID provided for deletion", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleNoteClick = () => {
    if (type === "note" && onClick) {
      onClick();
    }
  };

  useEffect(() => {
    // Only run for Twitter content
    if (type !== "twitter" || !link) return;
    
    // Reset states
    setTweetLoaded(false);
    setEmbedError(false);
    tweetRenderedRef.current = false;
    
    const loadTweet = async () => {
      if (!tweetRef.current || tweetRenderedRef.current) return;
      
      try {
        // @ts-ignore
        if (!window.twttr) {
          // Check if script is already being loaded
          if (document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) {
            // Script is already being loaded, wait for it
            const checkScript = setInterval(() => {
              // @ts-ignore
              if (window.twttr) {
                clearInterval(checkScript);
                setTweetLoaded(true);
                renderTweet();
              }
            }, 100);
            return;
          }
          
          const script = document.createElement("script");
          script.src = "https://platform.twitter.com/widgets.js";
          script.async = true;
          script.onload = () => {
            setTweetLoaded(true);
            renderTweet();
          };
          script.onerror = () => setEmbedError(true);
          document.body.appendChild(script);
        } else {
          // Script already loaded, render tweet directly
          setTweetLoaded(true);
          renderTweet();
        }
      } catch (error) {
        console.error("Error loading tweet:", error);
        setEmbedError(true);
      }
    };

    const renderTweet = () => {
      setTimeout(() => {
        // @ts-ignore
        if (window.twttr && tweetRef.current && !tweetRenderedRef.current) {
          tweetRenderedRef.current = true;
          // @ts-ignore
          window.twttr.widgets
            .createTweet(link?.split("/status/")[1], tweetRef.current, { align: "center" })
            .then(() => console.log("Tweet rendered"))
            .catch((error: any) => {
              console.error("Tweet creation failed:", error);
              setEmbedError(true);
            });
        }
      }, 100);
    };

    loadTweet();
    
    // Cleanup function
    return () => {
      if (tweetRef.current) {
        tweetRef.current.innerHTML = '';
      }
      tweetRenderedRef.current = false;
    };
  }, [link, type]);

  // Ensure tags is an array and handle different data formats
  const safeTags = Array.isArray(tags) ? tags : [];

  // Get icon based on type
  const getIcon = () => {
    const iconProps = { className: "w-5 h-5" };
    switch (type) {
      case "youtube":
        return <Youtube {...iconProps} className="w-5 h-5 text-red-600" />;
      case "twitter":
        return <Twitter {...iconProps} className="w-5 h-5 text-blue-600" />;
      case "article":
        return <FileText {...iconProps} className="w-5 h-5 text-yellow-600" />;
      case "note":
        return <StickyNote {...iconProps} className="w-5 h-5 text-green-600" />;
      default:
        return <FileText {...iconProps} />;
    }
  };

  return (
    <div>
      <div 
        className={`p-4 bg-card rounded-md shadow-md border border-border w-72 text-sm font-normal min-h-80 overflow-hidden flex flex-col ${
          type === "note" ? "cursor-pointer hover:shadow-lg transition-shadow duration-200" : ""
        }`}
        onClick={type === "note" ? handleNoteClick : undefined}
      >
        {/* Header */}
        <div className="flex justify-between flex-shrink-0">
          <div className="flex items-center min-w-0 flex-1">
            <div className="text-muted-foreground pr-2 flex-shrink-0">
              {getIcon()}
            </div>
            <span className="truncate">
              {type === "note" && !title ? "Untitled Note" : title}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {link && (
              <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={handleDelete}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="pt-4 overflow-hidden flex-1 flex flex-col">
          {type === "youtube" && link && (
            <div className="w-full aspect-video bg-black/5 rounded overflow-hidden">
              <iframe
                className="w-full h-full"
                src={link.replace("watch", "embed").replace("?v=", "/").replace("&", "/")}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {type === "twitter" && (
            <div className="overflow-hidden">
              <blockquote ref={tweetRef} className="twitter-tweet max-w-full">
                {embedError && (
                  <div className="text-muted-foreground italic w-full break-words">
                    Tweet not available for embedding. View on{" "}
                    <a href={link} target="_blank" rel="noopener noreferrer" className="underline">
                      Twitter/X
                    </a>
                    .
                  </div>
                )}
              </blockquote>
            </div>
          )}

          {type === "article" && link && (
            <div className="flex items-start gap-3 text-muted-foreground p-4 bg-muted rounded-lg h-40">
              <FileText className="w-8 h-8 flex-shrink-0" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-foreground mb-2">Article</p>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{truncatedDescription}</p>
                <a 
                  href={link}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs hover:underline inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  Read full article <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
          
          {type === "note" && (
            <div className="text-foreground hover:text-foreground/80 transition-colors duration-200 overflow-hidden h-40">
              <p className="break-words line-clamp-6">{safeDescription}</p>
              <div className="mt-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Click to edit
              </div>
            </div>
          )}
        </div>

        {/* Tags - Fixed at bottom */}
        {safeTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border flex-shrink-0">
            {safeTags.map((tagObj, index) => {
              // Handle both object format {_id, tag} and string format
              let tagText: string = '';
              let tagId: string = `tag-${index}`;
              
              if (typeof tagObj === 'string') {
                // If it's already a string
                tagText = tagObj;
                tagId = tagObj;
              } else if (tagObj && typeof tagObj === 'object') {
                // If it's an object with _id and tag properties
                tagText = tagObj.tag || '';
                tagId = tagObj._id || `tag-${index}`;
              }
              
              // Only render if we have valid tag text
              if (!tagText || typeof tagText !== 'string') {
                return null;
              }
              
              return (
                <span
                  key={tagId}
                  className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-2 py-1 rounded-full text-xs"
                >
                  #{tagText}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};