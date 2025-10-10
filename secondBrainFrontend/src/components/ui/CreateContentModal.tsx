// src/components/ui/CreateContentModal.tsx
import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { Input, MultiInput } from "./Input";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { Note } from "../../components/ui/Note";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { createContent, updateContent, fetchContents } from "../../store/slices/contentSlice";
import { toast } from "react-toastify";
import { Twitter, Youtube, FileText, StickyNote, X } from "lucide-react";

// @ts-ignore
enum ContentType {
  Youtube = "youtube",
  Twitter = "twitter",
  Article = "article",
  Note = "note",
}

export function CreateContentModal({
   open,
  onClose,
  selectedNote,
   
}: { 
    open: boolean;
    onClose: () => void;
    selectedNote?: { _id: string; title?: string; description?: string; tags?: string[] } | null;

}) {
  const dispatch = useAppDispatch();
  const {token} = useAppSelector(state => state.auth);
  const {filter} = useAppSelector(state => state.content);

  const modref = useOutsideClick(onClose);
  const titleRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const tagRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const noteRef = useRef<HTMLTextAreaElement | null>(null);
  const noteTagRef = useRef<HTMLInputElement | null>(null);
  const noteTitleRef = useRef<HTMLInputElement | null>(null);
  
  const [type, setType] = useState(ContentType.Youtube);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Add state for form values to ensure proper initialization
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    tags: "",
    link: ""
  });

  // Reset form when modal opens/closes or selectedNote changes
  useEffect(() => {
    if (open) {
      if (selectedNote) {
        // Editing existing note
        setType(ContentType.Note);
        const newFormValues = {
          title: selectedNote.title || "",
          description: selectedNote.description || "",
          tags: selectedNote.tags?.join(", ") || "",
          link: ""
        };
        setFormValues(newFormValues);
        
        // Use setTimeout to ensure refs are available after render
        setTimeout(() => {
          if (noteTitleRef.current) noteTitleRef.current.value = newFormValues.title;
          if (noteRef.current) noteRef.current.value = newFormValues.description;
          if (noteTagRef.current) noteTagRef.current.value = newFormValues.tags;
        }, 0);
      } else {
        // Creating new content - reset everything
        setType(ContentType.Youtube);
        const resetValues = { title: "", description: "", tags: "", link: "" };
        setFormValues(resetValues);
        
        setTimeout(() => {
          // Clear all form fields
          if (titleRef.current) titleRef.current.value = "";
          if (linkRef.current) linkRef.current.value = "";
          if (tagRef.current) tagRef.current.value = "";
          if (descriptionRef.current) descriptionRef.current.value = "";
          if (noteRef.current) noteRef.current.value = "";
          if (noteTagRef.current) noteTagRef.current.value = "";
          if (noteTitleRef.current) noteTitleRef.current.value = "";
        }, 0);
      }
      setError(null);
      setLoading(false);
    }
  }, [open, selectedNote]);

  const addContent = async () => {
    if (!token) {
      setError("No authorization token found. Please log in.");
      return;
    }

    const title = titleRef.current?.value;
    const link = linkRef.current?.value;
    const description = type === ContentType.Note ? noteRef.current?.value : descriptionRef.current?.value;
    const noteTitle = noteTitleRef.current?.value;
    const tags = (type === ContentType.Note
      ? noteTagRef.current?.value?.split(",").map((tag) => tag.trim()).filter((tag) => tag)
      : tagRef.current?.value?.split(",").map((tag) => tag.trim()).filter((tag) => tag)) || [];

    // Validate inputs
    if (!tags.length) {
      setError("At least one tag is required");
      return;
    }
    if (type !== ContentType.Note && (!title || !link)) {
      setError("Title and link are required for non-Note content");
      return;
    }
    if (!description) {
      setError("Description is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare content data
      const contentData: any = {
        description,
        type,
        tags, // Pass tag names, Redux will handle converting to IDs
      };

      if (type !== ContentType.Note) {
        contentData.title = title;
        contentData.link = link;
      } else if (noteTitle) {
        contentData.title = noteTitle;
      }

      if (selectedNote) {
        // Update existing content
        await dispatch(updateContent({ 
          id: selectedNote._id, 
          contentData, 
          token 
        })).unwrap();
        
        toast.success("Content updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        // Create new content
        await dispatch(createContent({ 
          contentData, 
          token 
        })).unwrap();
        
        toast.success("Content created successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      }

      // Refetch contents to ensure UI is up to date
      dispatch(fetchContents({ filter, token }));
      
      // Close modal
      onClose();
    } catch (error: any) {
      console.error("Error with content operation:", error);
      setError(error.message || "An unexpected error occurred");
      toast.error(error.message || "Failed to save content", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop - Modern overlay with blur effect */}
          <div 
            className="w-screen h-screen bg-black/50 backdrop-blur-sm fixed top-0 left-0 transition-opacity duration-200"
            onClick={onClose}
          ></div>
          
          {/* Modal Content */}
          <div className="w-screen h-screen fixed top-0 left-0 flex justify-center items-center p-4 pointer-events-none">
            <div 
              ref={modref} 
              className="bg-card border border-border rounded-xl shadow-2xl p-6 pointer-events-auto relative z-10 w-full max-w-sm max-h-[90vh] overflow-y-auto transform transition-all duration-200 scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with close button */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {selectedNote ? "Edit Content" : "Add New Content"}
                </h2>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }} 
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
                  aria-label="Close modal"
                >
                  <X />
                </button>
              </div>

              {/* Content Type Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Content Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    text="Youtube"
                    onClick={() => setType(ContentType.Youtube)}
                    loading={loading}
                    startIcon={<Youtube size={20} />}
                    className={`w-full ${type === ContentType.Youtube ? 
                      "bg-chart-4/90 hover:bg-chart-4 text-primary-foreground" : 
                      "bg-background border border-border text-foreground hover:bg-muted"
                    }`}
                  />
                  <Button
                    text="Twitter"
                    onClick={() => setType(ContentType.Twitter)}
                    startIcon={<Twitter size={20} />}
                    loading={loading}
                    className={`w-full ${type === ContentType.Twitter ? 
                      "bg-chart-1/90 hover:bg-chart-1  text-primary-foreground" : 
                      "bg-background border border-border text-foreground hover:bg-muted"
                    }`}
                  />
                  <Button
                    text="Article"
                    onClick={() => setType(ContentType.Article)}
                    startIcon={<FileText size={20} />}
                    loading={loading}
                    className={`w-full ${type === ContentType.Article ? 
                      "bg-chart-2/90 hover:bg-chart-2  text-primary-foreground" : 
                      "bg-background border border-border text-foreground hover:bg-muted"
                    }`}
                  />
                  <Button
                    text="Note"
                    onClick={() => setType(ContentType.Note)}
                    startIcon={<StickyNote size={20} />}
                    loading={loading}
                    className={`w-full ${type === ContentType.Note ? 
                      "bg-chart-3/90 hover:bg-chart-3 text-primary-foreground" : 
                      "bg-background border border-border text-foreground hover:bg-muted"
                    }`}
                  />
                </div>
              </div>

              {/* Form Content */}
              <div className="space-y-4 mb-6">
                {type === ContentType.Note ? (
                  <Note 
                    ref={noteRef} 
                    tagRef={noteTagRef} 
                    titleRef={noteTitleRef}
                    defaultTitle={formValues.title}
                    defaultTags={formValues.tags}
                    defaultValue={formValues.description}
                    key={`note-${selectedNote?._id || 'new'}`} // Force re-render when selectedNote changes
                  />
                ) : (
                  <div key={`content-${type}`} className="space-y-4">
                    <Input ref={titleRef} placeholder={"Title"} required={true} />
                    <Input ref={linkRef} placeholder={"Link"} required={true} />
                    <Input ref={tagRef} placeholder={"Tags (comma separated)"} required={true} />
                    <MultiInput ref={descriptionRef} placeholder={"Description"} required={true} />
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button 
                  text={selectedNote ? "Update Content" : "Add Content"}
                  fullWidth={true} 
                  size="md" 
                  onClick={addContent}  
                  loading={loading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>  
  );
}