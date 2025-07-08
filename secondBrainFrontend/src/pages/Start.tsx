import React, {  type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

interface StartProps {
  icon?: ReactElement;
  text?: string;
}

export const Start = ({ icon, text }: StartProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-gray-100 to-blue-100 flex justify-center items-center p-4">
      <div className="flex flex-col justify-center items-center gap-6 w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 p-8 transform transition-all duration-500 hover:scale-105 animate-fadeIn">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="text-indigo-600 transform transition-transform duration-300 hover:scale-110">
              {React.cloneElement(icon as React.ReactElement<any>, { className: "w-12 h-12" })}
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-800 md:text-4xl">
            {text || "Welcome to Brainly"}
          </h1>
        </div>
        <p className="text-gray-600 text-center text-sm md:text-base max-w-md">
          Organize and share your favorite tweets and YouTube videos with ease. Start exploring now!
        </p>
        <Button
          variant="primary"
          text="Get Started"
          onClick={() => navigate("/signup")}
          className="mt-4 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
          aria-label="Get started with Brainly"
        
        />

      </div>
    </div>
  );
};
