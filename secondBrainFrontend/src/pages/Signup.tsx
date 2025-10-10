// src/pages/Signup.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "../components/ui/Button";
import { Input, PasswordStrengthIndicator } from "../components/ui/Input";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { signupUser, clearError } from "../store/slices/authSlice";
import { useValidation, signupSchema, parseApiError } from "../utils/validation";
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { toggleDarkMode } from "../store/slices/uiSlice";
import { useTheme } from "../hooks/useTheme";

export function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(state => state.auth);
  
  // Use the theme hook - this handles all dark mode initialization and syncing
  const { isDarkMode } = useTheme();
  
  const {
    touched,
    validate,
    validateField,
    clearErrors,
    markFieldTouched,
    getFieldError,
  } = useValidation(signupSchema);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    const newFormData = { ...formData, [field]: newValue };
    setFormData(newFormData);
    
    // Validate field in real-time after first blur
    if (touched.has(field)) {
      validateField(field, newValue, newFormData);
    }
  };

  const handleBlur = (field: keyof typeof formData) => () => {
    markFieldTouched(field);
    validateField(field, formData[field], formData);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Clear previous errors
    dispatch(clearError());
    
    // Validate all fields
    if (!validate(formData)) {
      // Mark all fields as touched to show errors
      Object.keys(formData).forEach(field => markFieldTouched(field));
      
      // Show toast for validation errors
      toast.error("Please correct the errors in the form", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      await dispatch(signupUser(formData)).unwrap();
      
      // Show success message
      toast.success("Account created successfully! Redirecting to sign in...", {
        position: "top-right",
        autoClose: 2000,
      });
      
      // Clear form
      clearErrors();
      setFormData({ username: "", password: "" });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
      
    } catch (error: any) {
      const parsedError = parseApiError(error);
      
      // Show field-specific errors
      if (parsedError.fieldErrors) {
        Object.entries(parsedError.fieldErrors).forEach(([field]) => {
          markFieldTouched(field);
        });
      }
      
      // Show general error toast
      toast.error(parsedError.message || "Signup failed. Please try again.", {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  const handleToggle = () => {
    dispatch(toggleDarkMode())
  }

  return (
    <div className="min-h-screen bg-background flex justify-center items-center p-4">
      <div>
        <div className="flex justify-between items-center mb-5">
          <Button 
            size="sm" 
            fullWidth={false} 
            startIcon={<ArrowLeft/>} 
            text="Back to Home" 
            onClick={() => navigate("/")} 
            className="text-muted-foreground hover:text-foreground transition-colors hover:bg-muted"
          />

          <button 
            onClick={handleToggle}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button> 
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-8">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join Brainly to start organizing your content</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              name="username"
              type="text"
              label="Username"
              placeholder="Choose a username"
              value={formData.username}
              required
              onChange={handleInputChange("username")}
              onBlur={handleBlur("username")}
              error={getFieldError("username")}
              touched={touched.has("username")}
              helperText="3-20 characters, letters, numbers, and underscores only"
              autoComplete="username"
            />

            <div>
              <Input
                name="password"
                type="password"
                label="Password"
                placeholder="Create a strong password"
                value={formData.password}
                required
                onChange={handleInputChange("password")}
                onBlur={handleBlur("password")}
                error={getFieldError("password")}
                touched={touched.has("password")}
                showPasswordToggle
                autoComplete="new-password"
              />
              <PasswordStrengthIndicator 
                password={formData.password} 
                show={formData.password.length > 0}
              />
            </div>

            {/* Spacer div to match signin's checkbox/forgot password section */}
            <div className="h-6"></div>

            <div className="pt-4">
              <Button
                variant="primary"
                text={loading ? "Creating Account..." : "Sign Up"}
                fullWidth
                loading={loading}
                onClick={handleSubmit}
                className="bg-primary dark:text-black text-primary-foreground hover:bg-primary/90 "
              />
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signin")}
                className="text-foreground hover:text-primary font-medium transition-colors cursor-pointer "
              >
                Sign In
              </button>
            </p>
          </div>

          {/* Demo notice to match signin height - replace terms with demo info */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-center text-muted-foreground">
              <strong className="text-foreground">Create Account:</strong> Choose a unique username and secure password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}