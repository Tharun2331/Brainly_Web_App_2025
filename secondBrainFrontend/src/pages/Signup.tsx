import { Button } from "../components/ui/Button";
import {Input} from "../components/ui/Input";
import { useRef, useState } from "react";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";
import axios from "axios";
export function Signup()
{
const [loading, setLoading] = useState(false);
const userNameRef = useRef<HTMLInputElement>(null);
const passwordRef = useRef<HTMLInputElement>(null);
const navigate = useNavigate();
const handleSubmit = async () => {
    const userName = userNameRef.current?.value;
    const password = passwordRef.current?.value;

    if (!userName || !password) {
      alert("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username: userName, // Match the backend's expected field name
        password,          // Directly include password
      });
      navigate("/signin")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(`Signup failed: ${error.response?.data?.message || error.message}`);
      } else {
        alert("An unexpected error occurred.");
      }
    } finally {
      setLoading(false); // Reset loading regardless of success or failure
    }
  };
return <div className="h-screen w-screen bg-[var(--color-gray-200)] flex justify-center items-center">

  <div className="bg-white rounded-xl border-1 border-gray-300  min-w-48 p-10">
    <Input placeholder="Email Address" ref={userNameRef} />
    <Input placeholder="Password" ref={passwordRef} />
    <div className="flex justify-center items-center pt-4">
      <Button  variant="primary" text="Signup" fullWidth= {true} loading={loading} onClick={handleSubmit} />
    </div>

  </div>



</div>



}