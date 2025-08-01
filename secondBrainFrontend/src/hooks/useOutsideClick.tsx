import { useEffect, useRef } from "react";

export const useOutsideClick = (handler: () => void) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(()=> {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };
    document.addEventListener("mousedown",handleClickOutside);

    return () => {
      document.removeEventListener("mousedown",handleClickOutside);
    }

  },[handler])

  return ref;

}