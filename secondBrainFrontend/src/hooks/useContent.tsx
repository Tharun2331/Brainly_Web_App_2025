import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";

interface Tag {
  _id: string;
  tag: string;
}

interface Content {
  _id: string;
  type: "twitter" | "youtube" | string;
  link: string;
  title: string;
  tags: Tag[];
}

interface UseContentProps {
  content: string;
}

export function useContent({ content }: UseContentProps) {
  const [contents,setContents] = useState<Content[]>([]);
  async function refetch() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      let url = `${BACKEND_URL}/api/v1/content`;
      let responseKey = "content";

      if (content === "twitter") {
        url = `${BACKEND_URL}/api/v1/content/tweets`;
        responseKey = "twitter";
      } else if (content === "youtube") {
        url = `${BACKEND_URL}/api/v1/content/youtube`;
        responseKey = "youtubeVideos";
      } else if (content === "all") {
        url = `${BACKEND_URL}/api/v1/content`;
        responseKey = "content";
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: token,
        },
      });

      setContents(response.data[responseKey] || []);
    } catch (error) {
      console.error("Failed to fetch content:", error);
      setContents([]);
    }
     
  }
  useEffect(()=> {
   refetch()
    let interval = setInterval(()=> {
     refetch() 
    },10 * 1000)
    return () => {
      clearInterval(interval)
    }
  },[content])
  return {contents,setContents, refetch}
}