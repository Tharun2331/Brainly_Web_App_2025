// src/components/ui/Card.tsx
import { DeleteIcon } from "../../icons/DeleteIcon";
import { ShareIcon } from "../../icons/ShareIcon";
import { useEffect, useRef, useState } from "react";
import { YoutubeIcon } from "../../icons/YoutubeIcon";
import { TwitterIcon } from "../../icons/TwitterIcon";
import { ArticleIcon } from "../../icons/Article";
import { LinesIcon } from "../../icons/Lines";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { NoteIcon } from "../../icons/NotesIcon";

interface Tag {
  _id: string;
  tag: string;
}

interface Cardprops {
  title?: string;
  link?: string;
  type: "twitter" | "youtube" | "article" | "note";
  tags?: Tag[] | null; // Allow null
  contentId: string;
  onDelete?: (contentId: string) => void;
  description?: string;
  onClick?: () => void;
}

export const Card = ({ title, link, type, contentId, onDelete, tags, description, onClick }: Cardprops) => {
  const tweetRef = useRef<HTMLQuoteElement>(null);
  const [tweetLoaded, setTweetLoaded] = useState(false);
  const [embedError, setEmbedError] = useState(false);

  // Truncate description to ~100 characters (~3 lines)
  const safeDescription = description || "";
  const truncatedDescription =
    safeDescription.length > 100 ? safeDescription.substring(0, 100) + "..." : safeDescription;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onClick when deleting
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
    const loadTweet = async () => {
      if (tweetRef.current && type === "twitter") {
        try {
          // @ts-ignore
          if (!window.twttr) {
            const script = document.createElement("script");
            script.src = "https://platform.twitter.com/widgets.js";
            script.async = true;
            script.onload = () => setTweetLoaded(true);
            script.onerror = () => setEmbedError(true);
            document.body.appendChild(script);
          } else {
            setTweetLoaded(true);
          }

          // @ts-ignore
          if (window.twttr && tweetLoaded) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            // @ts-ignore
            window.twttr.widgets
              .createTweet(link?.split("/status/")[1], tweetRef.current, { align: "center" })
              .then(() => console.log("Tweet rendered"))
              .catch((error: any) => {
                console.error("Tweet creation failed:", error);
                setEmbedError(true);
              });
          }
        } catch (error) {
          console.error("Error loading tweet:", error);
          setEmbedError(true);
        }
      }
    };

    loadTweet();
  }, [link, type, tweetLoaded]);

  // Ensure tags is an array
  const safeTags = Array.isArray(tags) ? tags : [];

  return (
    <div>
      <div 
        className={`p-4 bg-white rounded-md shadow-md border-gray-200 border max-w-72 text-sm font-normal min-h-48 min-w-72 ${
          type === "note" ? "cursor-pointer hover:shadow-lg transition-shadow duration-200" : ""
        }`}
        onClick={type === "note" ? handleNoteClick : undefined}
      >
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="text-gray-500 pr-2">
              {type === "youtube" && <YoutubeIcon />}
              {type === "twitter" && <TwitterIcon />}
              {type === "article" && <ArticleIcon />}
              {type === "note" && <NoteIcon />}
            </div>
            {type === "note" && !title ? "Untitled Note" : title}
          </div>
          <div className="flex items-center">
            {link && (
              <div className="pr-2 text-gray-400">
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()} // Prevent triggering note edit
                >
                  <ShareIcon size="md" />
                </a>
              </div>
            )}
            <div 
              className="pr-2 text-gray-400 cursor-pointer hover:text-red-500 transition-colors duration-200" 
              onClick={handleDelete}
            >
              <DeleteIcon size="md" />
            </div>
          </div>
        </div>
        <div className="pt-4">
          {type === "youtube" && link && (
            <iframe
              className="w-full"
              src={link.replace("watch", "embed").replace("?v=", "/").replace("&", "/")}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          )}
          {type === "twitter" && (
            <blockquote ref={tweetRef} className="twitter-tweet">
              {embedError && (
                <div className="text-gray-500 italic w-full">
                  Tweet not available for embedding. View on{" "}
                  <a href={link} target="_blank" rel="noopener noreferrer" className="underline">
                    Twitter/X
                  </a>
                  .
                </div>
              )}
            </blockquote>
          )}
          {type === "article" && link && (
            <div className="text-gray-500 italic">
              <Link to={link} target="_blank" rel="noopener noreferrer">
                <LinesIcon />
              </Link>
            </div>
          )}
          
          {type === "note" && (
            <div className="text-gray-700 hover:text-gray-900 transition-colors duration-200">
              <p>{truncatedDescription}</p>
              {type === "note" && (
                <div className="mt-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Click to edit
                </div>
              )}
            </div>
          )}
        </div>
        {safeTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {safeTags.map((tagObj) =>
              tagObj && tagObj.tag ? (
                <span
                  key={tagObj._id}
                  className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs"
                >
                  #{tagObj.tag}
                </span>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
};