import "../App.css";
import { Button } from "../components/ui/Button";
import { PlusIcon } from "../icons/PlusIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { Card } from "../components/ui/Card";
import { CreateContentModal } from "../components/ui/CreateContentModal";
import { useState, useEffect } from "react"; // Added useEffect
import { Sidebar } from "../components/ui/Sidebar";
import { useContent } from "../hooks/useContent";
import axios from "axios";
import { BACKEND_URL, FRONTEND_URL } from "../config";
import { toast } from "react-toastify"; // Import toast

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const { contents, refetch } = useContent();
  const [shareLink, setShareLink] = useState<string | null>(null);

  useEffect(() => {
    refetch(); // Refetch content when modal is closed

  }, [modalOpen]); // Dependencies: modalOpen and refetch

  const handleShare = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${BACKEND_URL}/api/v1/brain/share`,
        { share: true },
        { headers: { Authorization: token}}
      );
      const newShareLink = `${FRONTEND_URL}/share/${response.data.hash}`;
      setShareLink(newShareLink);

      // Custom toast notification
      toast.success(
        <div>
          <p>Share Link Generated!</p>
          <input
            type="text"
            value={newShareLink}
            readOnly
            className="w-full p-2 mt-2 border rounded"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(newShareLink);
              toast.info("Link copied to clipboard!", { autoClose: 2000 });
            }}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Copy Link
          </button>
        </div>,
        {
          position: "top-right",
          autoClose: 10000, // 10 seconds
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } catch (error) {
      console.error("Failed to generate share link:", error);
      toast.error(
        <div>
          <p>Failed to Generate Share Link</p>
          <p>Please try again or contact support.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        }
      );
    }
  };

  return (
    <div>
      <Sidebar />
      <div className="p-4 ml-72 min-h-screen bg-[var(--color-gray-200)]">
        <CreateContentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
        <div className="flex justify-end gap-4">
          <Button
            startIcon={<ShareIcon size="md" />}
            variant="secondary"
            text="Share Brain"
            size="md"
            onClick={handleShare}
          />
          <Button
            onClick={() => setModalOpen(true)}
            startIcon={<PlusIcon size="md" />}
            variant="primary"
            text="Add Content"
            size="md"
          />
        </div>
        <div className="flex gap-6 flex-wrap p-4">
          {contents.map(({ type, link, title }) => (
            <Card key={`${type}-${link}`} type={type} link={link} title={title} />
          ))}
        </div>
      </div>
    </div>
  );
}