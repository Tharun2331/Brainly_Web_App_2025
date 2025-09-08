// src/hooks/useContent.tsx
import { useEffect, useState } from "react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface Tag {
  _id: string;
  tag: string;
}

interface Content {
  _id: string;
  type: "twitter" | "youtube" | "article" | "note";
  link?: string;
  description: string;
  title?: string;
  tags: Tag[];
}

interface UseContentProps {
  content: "twitter" | "youtube" | "article" | "note" | "all" | string;
}

export function useContent({ content }: UseContentProps) {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refetch() {
    setLoading(true);
    setError(null);
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
        responseKey = "youtube";
      } else if (content === "article") {
        url = `${BACKEND_URL}/api/v1/content/articles`;
        responseKey = "article";
      } else if (content === "note") {
        url = `${BACKEND_URL}/api/v1/content/notes`;
        responseKey = "note";
      } else {
        url = `${BACKEND_URL}/api/v1/content`;
        responseKey = "content";
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: token,
        },
      });

      // Normalize tags to ensure it's always an array
      const normalizedContent = (response.data[responseKey] || []).map((item: Content) => ({
        ...item,
        tags: Array.isArray(item.tags) ? item.tags : [],
      }));

      setContents(normalizedContent);
    } catch (error: any) {
      console.error("Failed to fetch content:", error);
      setError(error.message || "Failed to fetch content");
      setContents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refetch();
    const interval = setInterval(() => {
      refetch();
    }, 10 * 1000);
    return () => {
      clearInterval(interval);
    };
  }, [content]);

  return { contents, setContents, refetch, loading, error };
}