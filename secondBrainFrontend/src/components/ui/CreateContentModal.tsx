// src/components/ui/CreateContentModal.tsx
import { useEffect, useRef, useState } from "react";
import { CrossIcon } from "../../icons/CrossIcon";
import { Button } from "./Button";
import { Input, MultiInput } from "./Input";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { Note } from "../../components/ui/Note";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
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
  setContents 
}: { 
    open: boolean;
    onClose: () => void;
    selectedNote?: { _id: string; title?: string; description?: string; tags?: string[] } | null;
    setContents: (newContents: any[]) => void;
}) {
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
    }
  }, [open, selectedNote]);

  const addContent = async () => {
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

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authorization token found");
      return;
    }

    try {
      setError(null);
      const tagRes = await axios.post(
        `${BACKEND_URL}/api/v1/tags`,
        { tags },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      const tagIds = tagRes.data.tagIds;

      const contentPayload: any = {
        description,
        type,
        tags: tagIds,
      };
      if (type !== ContentType.Note) {
        contentPayload.title = title;
        contentPayload.link = link;
      } else if (noteTitle) {
        contentPayload.title = noteTitle;
      }

      if (selectedNote) {
        // Update the existing note
        await axios.put(`${BACKEND_URL}/api/v1/content/${selectedNote._id}`, contentPayload, {
          headers: {
            Authorization: token 
          },
        });
        // @ts-ignore
        setContents((prev) => 
          prev.map((item) => 
            item._id === selectedNote._id ? {...item, ...contentPayload, tags: tagIds} : item) 
        );
      } else {
        // Create new content
        const response = await axios.post(`${BACKEND_URL}/api/v1/content`, contentPayload, {
          headers: { Authorization: token },
        });
        // @ts-ignore
        setContents((prev) => [...prev, response.data]);
      }

      onClose();
    } catch (error: any) {
      console.error("Error creating content:", error);
      if (error.response) {
        setError(error.response.data.message || "Failed to create content");
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <div>
      {open && (
        <div>
          <div className="w-screen h-screen bg-slate-500 fixed top-0 left-0 opacity-60 flex justify-center"></div>
          <div className="w-screen h-screen fixed top-0 left-0 flex justify-center">
            <div ref={modref} className="flex flex-col justify-center">
              <span className="bg-white opacity-100 rounded p-4">
                <div className="flex justify-end">
                  <div onClick={onClose} className="cursor-pointer">
                    <CrossIcon />
                  </div>
                </div>
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
                  <div key={`content-${type}`}>
                    <Input ref={titleRef} placeholder={"Title"} required={true} />
                    <Input ref={linkRef} placeholder={"Link"} required={true} />
                    <Input ref={tagRef} placeholder={"Tags"} required={true} />
                    <MultiInput ref={descriptionRef} placeholder={"Description"} required={true} />
                  </div>
                )}
                {error && <div className="text-red-500 text-center">{error}</div>}
                <div className="flex flex-wrap justify-center gap-2 p-4 w-68">
                  <Button
                    text="Youtube"
                    variant={type === ContentType.Youtube ? "primary" : "secondary"}
                    onClick={() => setType(ContentType.Youtube)}
                    size="md"
                  />
                  <Button
                    text="Twitter"
                    variant={type === ContentType.Twitter ? "primary" : "secondary"}
                    onClick={() => setType(ContentType.Twitter)}
                    size="md"
                  />
                  <Button
                    text="Article"
                    variant={type === ContentType.Article ? "primary" : "secondary"}
                    onClick={() => setType(ContentType.Article)}
                    size="md"
                  />
                  <Button
                    text="Note"
                    variant={type === ContentType.Note ? "primary" : "secondary"}
                    onClick={() => setType(ContentType.Note)}
                    size="md"
                  />
                </div>
                <div className="flex justify-center">
                  <Button variant="primary" text="submit" size="sm" onClick={addContent} />
                </div>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}