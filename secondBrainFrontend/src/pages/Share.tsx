import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card } from "../components/ui/Card"; // Reuse the Card component
import { Button } from "../components/ui/Button";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const Share = () => {
  const { shareId } = useParams<{ shareId: string }>(); // Get hash from URL
  const [contents, setContents] = useState<any[]>([]);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSharedContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/brain/${shareId}`);
      const { content, username: userName } = response.data;
      console.log("Fetched shared content:", content); // Debug: log the content array
      setContents(content || []);
      setUsername(userName || "Unknown User");
    } catch (err) {
      setError("Failed to load shared content. Check the link or try again.");
      console.error("Error fetching shared content:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (shareId) {
      fetchSharedContent();
    }
  }, [shareId]);

  function handleRefresh() {
    fetchSharedContent();
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!contents.length) return <div>No content available for this share link.</div>;

  return (
    <div className="p-4">
      <div className="flex justify-end ">
        <Button variant="primary" text="Refresh" onClick={handleRefresh} />
      </div>
      <h1>Shared Content by {username}</h1>
      <div className="flex gap-6 flex-wrap">
        {contents.map(({ type, link, description, title, _id, tags }) => (
          <Card
            key={`${type}-${link}`}
            type={type}
            link={link}
            title={title}
            description={description}
            contentId={_id}
            tags={tags}
          />
        ))}
      </div>
    </div>
  );
};