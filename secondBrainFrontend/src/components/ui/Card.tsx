// src/components/ui/Card.tsx - Add processing status indicators
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { 
  Trash2, 
  ExternalLink, 
  Youtube, 
  Twitter, 
  FileText, 
  StickyNote,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface Tag {
  _id: string;
  tag: string;
}

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
  // NEW: Processing status fields
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
  contentMetadata?: {
    wordCount?: number;
    extractionMethod?: string;
    author?: string;
  };
}

export const Card = ({ 
  title, 
  link, 
  type, 
  contentId, 
  onDelete, 
  tags, 
  description, 
  onClick,
  processingStatus = 'completed',
  processingError,
  contentMetadata
}: Cardprops) => {
  const tweetRef = useRef<HTMLQuoteElement>(null);
  const [, setTweetLoaded] = useState(false);
  const [embedError, setEmbedError] = useState(false);
  const tweetRenderedRef = useRef(false);
  const [reprocessing, setReprocessing] = useState(false);

  // Get token from localStorage for reprocess request
  const token = localStorage.getItem('token');

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

  // NEW: Handle reprocess
  const handleReprocess = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!token) {
      toast.error("Authentication required", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setReprocessing(true);

    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/content/${contentId}/reprocess`,
        {},
        { headers: { Authorization: token } }
      );

      toast.success("Content queued for reprocessing!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Refresh page after a delay to show updated status
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('Reprocess failed:', error);
      toast.error(error.response?.data?.message || "Failed to reprocess content", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setReprocessing(false);
    }
  };

  useEffect(() => {
    if (type !== "twitter" || !link) return;
    
    setTweetLoaded(false);
    setEmbedError(false);
    tweetRenderedRef.current = false;
    
    const loadTweet = async () => {
      if (!tweetRef.current || tweetRenderedRef.current) return;
      
      try {
        // @ts-ignore
        if (!window.twttr) {
          if (document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) {
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
    
    return () => {
      if (tweetRef.current) {
        tweetRef.current.innerHTML = '';
      }
      tweetRenderedRef.current = false;
    };
  }, [link, type]);

  const safeTags = Array.isArray(tags) ? tags : [];

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

  // NEW: Get status badge
  const getStatusBadge = () => {
    if (processingStatus === 'completed') return null;

    const badges = {
      pending: {
        icon: <Clock className="w-3 h-3" />,
        text: 'Pending',
        className: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
      },
      processing: {
        icon: <Loader2 className="w-3 h-3 animate-spin" />,
        text: 'Processing',
        className: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      },
      failed: {
        icon: <AlertCircle className="w-3 h-3" />,
        text: 'Failed',
        className: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
      }
    };

    const badge = badges[processingStatus];
    if (!badge) return null;

    return (
      <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.className}`}>
        {badge.icon}
        <span>{badge.text}</span>
      </div>
    );
  };

  return (
    <div>
      <div 
        className={`p-4 bg-card rounded-md shadow-md border border-border w-72 text-sm font-normal min-h-80 overflow-hidden flex flex-col relative ${
          type === "note" ? "cursor-pointer hover:shadow-lg transition-shadow duration-200" : ""
        } ${processingStatus === 'failed' ? 'border-red-200 dark:border-red-800' : ''}`}
        onClick={type === "note" ? handleNoteClick : undefined}
      >
        {/* Processing Status Badge */}
        {getStatusBadge()}

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
            {/* NEW: Reprocess button for failed items */}
            {processingStatus === 'failed' && (
              <button
                onClick={handleReprocess}
                disabled={reprocessing}
                className="text-muted-foreground hover:text-primary transition-colors p-1 disabled:opacity-50"
                title="Retry extraction"
              >
                {reprocessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </button>
            )}
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

        {/* NEW: Processing Error Message */}
        {processingStatus === 'failed' && processingError && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-400">
            <strong>Error:</strong> {processingError}
          </div>
        )}

        {/* NEW: Metadata Display */}
        {contentMetadata && processingStatus === 'completed' && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {contentMetadata.wordCount && (
              <span className="flex items-center gap-1">
                📝 {contentMetadata.wordCount.toLocaleString()} words
              </span>
            )}
            {contentMetadata.author && (
              <span className="flex items-center gap-1 truncate">
                👤 {contentMetadata.author}
              </span>
            )}
          </div>
        )}

        {/* Content */}
        <div className="pt-4 overflow-hidden flex-1 flex flex-col">
          {type === "youtube" && link && processingStatus === 'completed' && (
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
              {processingStatus === 'completed' ? (
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
              ) : (
                <div className="text-muted-foreground italic w-full break-words p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Twitter className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Twitter Post</span>
                  </div>
                  <p className="text-xs">
                    {processingStatus === 'pending' && "Tweet processing pending..."}
                    {processingStatus === 'processing' && "Extracting tweet content..."}
                    {processingStatus === 'failed' && "Tweet extraction failed"}
                    {!processingStatus && "Tweet content not available"}
                  </p>
                  {link && (
                    <a 
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs underline hover:no-underline mt-2 inline-block"
                    >
                      View on Twitter/X
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {type === "article" && link && (
            <div className="flex items-start gap-3 text-muted-foreground p-4 bg-muted rounded-lg h-40">
              <FileText className="w-8 h-8 flex-shrink-0" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-foreground mb-2">Article</p>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{truncatedDescription}</p>
                {processingStatus === 'completed' && (
                  <a 
                    href={link}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs hover:underline inline-flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Read full article <ExternalLink className="w-3 h-3" />
                  </a>
                )}
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

          {/* Processing Placeholder for YouTube and Article */}
          {(processingStatus === 'pending' || processingStatus === 'processing') && type !== 'note' && type !== 'twitter' && (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              <div className="text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p className="text-sm">
                  {processingStatus === 'pending' ? 'Waiting to process...' : 'Extracting content...'}
                </p>
              </div>
            </div>
          )}

          {/* Failed Processing Indicator for YouTube and Article */}
          {processingStatus === 'failed' && type !== 'note' && type !== 'twitter' && (
            <div className="flex items-center justify-center h-40 text-red-500">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Processing failed</p>
                {processingError && (
                  <p className="text-xs text-muted-foreground mt-1 max-w-48 truncate">
                    {processingError}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {safeTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border flex-shrink-0">
            {safeTags.map((tagObj, index) => {
              let tagText: string = '';
              let tagId: string = `tag-${index}`;
              
              if (typeof tagObj === 'string') {
                tagText = tagObj;
                tagId = tagObj;
              } else if (tagObj && typeof tagObj === 'object') {
                tagText = tagObj.tag || '';
                tagId = tagObj._id || `tag-${index}`;
              }
              
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