import { DeleteIcon } from "../../icons/DeleteIcon";
import { ShareIcon } from "../../icons/ShareIcon";
import { useEffect, useRef, useState } from "react";
import { YoutubeIcon } from "../../icons/YoutubeIcon";
import { TwitterIcon } from "../../icons/TwitterIcon";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { toast } from "react-toastify";

interface Tag {
  _id:string;
  tag:string;
}

interface Cardprops {
  title: string;
  link: string;
  type: "twitter" | "youtube";
  tags?: Tag[]; // Optional, can be used to display tags
  contentId: string; // Optional, used for deletion
  onDelete?: (contentId: string) => void; // Callback for deletion
}

export const Card = ({ title, link, type, contentId, onDelete, tags }: Cardprops) => {
  const tweetRef = useRef<HTMLQuoteElement>(null);
  const [tweetLoaded, setTweetLoaded] = useState(false);
  const [embedError, setEmbedError] = useState(false);
  
  const handleDelete = () => {
    if (contentId) {
      onDelete && onDelete(contentId);
    } else {
      console.error("No contentId provided for deletion");
      toast.error("No content ID provided for deletion", {
        position: "top-right",
        autoClose: 3000,
    } );
    }
  };

  useEffect(() => {
    const loadTweet = async () => {
      if (tweetRef.current && type === "twitter") {
        try {
          // Ensure the script is loaded or load it
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

          // Wait for the script to load
          // @ts-ignore
          if (window.twttr && tweetLoaded) {
            await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay for script initialization
            //@ts-ignore
            window.twttr.widgets.createTweet(
              link.split("/status/")[1], // Tweet ID
              tweetRef.current,
              {
                align: "center",
              }
            ).then(() => console.log("Tweet rendered")).catch((error) => {
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
  }, [link, type, tweetLoaded]); // Re-run if link, type, or tweetLoaded changes

  return (
    <div>
      <div className="p-4 bg-white rounded-md shadow-md border-gray-200 border max-w-72 text-sm font-normal min-h-48 min-w-72">
        <div className="flex justify-between ">
          <div className="flex items-center ">
            <div className="text-gray-500 pr-2">
              { type === "youtube" ? <YoutubeIcon /> : <TwitterIcon /> } 
            </div>
            {title}
          </div>
          <div className="flex items-center">
            <div className="pr-2 text-gray-400">
              <a href={link} target="_blank" rel="noopener noreferrer">
                <ShareIcon size="md" />
              </a>
            </div>
            <div className="pr-2 text-gray-400 cursor-pointer" onClick={handleDelete}>
              <DeleteIcon size="md" />
            </div>
          </div>
        </div>
        <div className="pt-4">
          {type === "youtube" && (
            <iframe
              className="w-full"
              src={link.replace("watch", "embed").replace("?v=", "/")}
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
                <div className="text-gray-500 italic">
                  Tweet not available for embedding. View on{" "}
                  <a href={link} target="_blank" rel="noopener noreferrer" className="underline">
                    Twitter/X
                  </a>
                  .
                </div>
              )}
            </blockquote>
          )}
        </div>
        {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map(tagObj =>
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
        <div>
        </div>
      </div>
    </div>
  );
};