import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../components/ui/Card"; // Reuse the Card component
import { fetchSharedContents } from "../store/slices/contentSlice";
import { useAppDispatch, useAppSelector } from "../hooks/redux";


export const Share = () => {

  const { shareId } = useParams<{ shareId: string }>(); // Get hash from URL
  const dispatch = useAppDispatch();

  const {
    sharedContents,
    sharedUsername,
    sharedLoading,
    sharedError
  } = useAppSelector(state => state.content);

  useEffect(() => {
    if (shareId) {
      dispatch(fetchSharedContents(shareId));
    }
  }, [dispatch,shareId]);


  if (sharedLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading shared content...</div>
      </div>
    );
  }

  if(sharedError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            {sharedError}
          </div>
          <div className="text-gray-500 text-sm">
            Please check the share link or try again later.
          </div>
        </div>
      </div>
    );
  }

 // Empty state
 if (!sharedContents.length) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-gray-600 mb-4">
          No content available for this share link.
        </div>
        <div className="text-gray-500 text-sm">
          The content may have been removed or the link is invalid.
        </div>
      </div>
    </div>
  );
}


  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Shared Content by {sharedUsername}
        </h1>
      </div>

      <div className="flex gap-6 flex-wrap">
        {sharedContents.map(({ type, link, description, title, _id, tags }) => (
          <Card
            key={_id}
            type={type  as "twitter" | "youtube" | "article" | "note" }
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