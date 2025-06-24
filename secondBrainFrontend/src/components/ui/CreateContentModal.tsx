import { useRef, useState } from "react";
import { CrossIcon } from "../../icons/CrossIcon"
import { Button } from "./Button"
import { Input } from "./Input"
import {useOutsideClick} from "../../hooks/useOutsideClick";
import { YoutubeIcon } from "../../icons/YoutubeIcon";
import { BACKEND_URL } from "../../config";
import axios from "axios";
// @ts-ignore
enum ContentType {
  Youtube = "youtube",
  Twitter = "twitter"
}

export function CreateContentModal({open, onClose})
{
  const modref = useOutsideClick(onClose)
  const titleRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const tagRef = useRef<HTMLInputElement>(null);
  const [type,setType] = useState(ContentType.Youtube);
  
  const addContent = async () => {
    const title=titleRef.current?.value;
    const link= linkRef.current?.value;
    const tags = tagRef.current?.value.split(",").map(tag => tag.trim()) || [];
    
    const tagRes = await axios.post(`${BACKEND_URL}/api/v1/tags`, {
      tags
    },

    {
      headers: {
        "Authorization": localStorage.getItem("token")
      }
    })
    const tagIds = tagRes.data.tagIds;

    await axios.post(`${BACKEND_URL}/api/v1/content`, {
      title,
      link,
      type,
      tags: tagIds
    }, 
    {
      headers: {
      "Authorization": localStorage.getItem("token")
      }
      
    })
    onClose();
  }
  return <div>
    {open && <div>
      
     <div className="w-screen h-screen bg-slate-500 fixed top-0 left-0 opacity-60 flex justify-center">
     
      </div>
      <div className="w-screen h-screen  fixed top-0 left-0 flex justify-center">
       <div ref={modref} className="flex flex-col justify-center">
      <span className="bg-white opacity-100 rounded p-4">
        <div className="flex justify-end">
            <div onClick={onClose} className="cursor-pointer">
              <CrossIcon />
            </div>
        
        </div>
        <div>
            <Input ref={titleRef} placeholder={"Title"}/>
            <Input ref={linkRef} placeholder={"Link"}/>
            <Input ref={tagRef} placeholder={"Tags"} />
        </div>
        <div className="flex justify-center gap-2 p-4">
          <Button text="Youtube" variant={type === ContentType.Youtube? "primary": "secondary" } onClick={() => setType(ContentType.Youtube)} size="md"></Button>
          <Button text="Twitter" variant={type === ContentType.Twitter? "primary": "secondary" } onClick={() => setType(ContentType.Twitter)} size="md"></Button>
        </div>
        <div className="flex justify-center">
        <Button variant="primary" text="submit" size="sm" onClick={addContent} /> 
        </div>
        
      </span>
      </div>
      </div>

    </div>
}
  </div>


}
