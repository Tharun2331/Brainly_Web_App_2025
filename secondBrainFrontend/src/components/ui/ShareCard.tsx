// src/components/ui/ShareCard.tsx - Share page specific card without icons
import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";

interface Tag {
  _id: string;
  tag: string;
}

type TagInput = Tag | string;

interface ShareCardProps {
  title?: string;
  link?: string;
  type: "twitter" | "youtube" | "article";
  tags?: TagInput[] | null;
  contentId: string;
  description?: string;
}

export const ShareCard = ({ 
  title, 
  link, 
  type, 
  tags, 
  description
}: ShareCardProps) => {
  const tweetRef = useRef<HTMLQuoteElement>(null);
  const [, setTweetLoaded] = useState(false);
  const [embedError, setEmbedError] = useState(false);
  const tweetRenderedRef = useRef(false);

  const safeDescription = description || "";
  const truncatedDescription =
    safeDescription.length > 200 
      ? safeDescription.substring(0, 200) + "..." 
      : safeDescription;

  // Twitter embed logic (same as original Card)
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

  // Get content type label
  const getContentTypeLabel = () => {
    switch (type) {
      case "youtube":
        return "Video";
      case "twitter":
        return "Tweet";
      case "article":
        return "Article";
      default:
        return "Content";
    }
  };

  return (
    <div className={`bg-card rounded-lg shadow-sm border border-border w-full max-w-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200 ${
      type === "twitter" ? "" : "h-80"
    }`}>
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
              {getContentTypeLabel()}
            </div>
            <h3 className="font-semibold text-foreground truncate">
              {title}
            </h3>
          </div>
          {link && (
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-1 flex-shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 flex-1">
        {type === "youtube" && link && (
          <div className="w-full aspect-video bg-black/5 rounded overflow-hidden mb-3">
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
          <div className="overflow-hidden mb-3">
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
          <div className="mb-3">
            <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
              {truncatedDescription}
            </p>
            <a 
              href={link}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              Read full article <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Tags */}
      {safeTags.length > 0 && (
        <div className="px-4 pb-4 pt-2 border-t border-border">
          <div className="flex flex-wrap gap-1">
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
                  className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs"
                >
                  #{tagText}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
