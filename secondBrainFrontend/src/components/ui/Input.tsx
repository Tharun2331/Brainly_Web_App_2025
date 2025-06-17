interface InputProps {
  placeholder: string;
  ref?:any;
}

export function Input({ref, placeholder}: InputProps) {
  return <div>
      <input placeholder={placeholder} type="text" className="px-4 py-2 border-1 border-gray-300 m-2" ref= {ref}/>
  </div>
}