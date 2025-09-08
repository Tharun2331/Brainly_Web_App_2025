import { Button } from "../components/ui/Button";
import {Input} from "../components/ui/Input";
import { useState,useRef } from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
export function Signin()
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
      const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        username: userName, // Match the backend's expected field name
        password,          // Directly include password
      });
      const jwt = response.data.token;
      localStorage.setItem("token",jwt)
      // Redirect to Dashboard
      navigate("/dashboard")

    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(`Signin failed: ${error.response?.data?.message || error.message}`);
      } else {
        alert("An unexpected error occurred.");
      }
    } finally {
      setLoading(false); // Reset loading regardless of success or failure
    }
  };
return <div className="h-screen w-screen bg-[var(--color-gray-200)] flex justify-center items-center">

  <div className="bg-white rounded-xl border-1 border-gray-300  min-w-48 p-10">
    <Input placeholder="Email Address" ref={userNameRef} required={true} />
    <Input placeholder="Password" ref={passwordRef} required={true} />
    <div className="flex justify-center items-center pt-4">
      <Button  variant="primary" text="Signin" fullWidth= {true} loading={loading} onClick={handleSubmit} />
    </div>
    <div>
      <p className="text-center text-sm text-gray-500 mt-4">
        Don't have an account? <span className="text-blue-500 cursor-pointer" onClick={() => navigate("/signup")}>Sign Up</span>
      </p>
    </div>
  </div>



</div>



}