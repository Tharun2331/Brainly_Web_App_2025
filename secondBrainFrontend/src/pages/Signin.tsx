// src/pages/Signin.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { signinUser, clearError } from "../store/slices/authSlice";
import { useValidation, signinSchema, parseApiError } from "../utils/validation";
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from "../hooks/useTheme";
import { toggleDarkMode } from "../store/slices/uiSlice";

export function Signin() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  
  const dispatch = useAppDispatch();
  const { loading, isAuthenticated } = useAppSelector(state => state.auth);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const {
    errors,
    touched,
    validate,
    validateField,
    markFieldTouched,
    getFieldError,
  } = useValidation(signinSchema);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    const newFormData = { ...formData, [field]: newValue };
    setFormData(newFormData);
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      validateField(field, newValue, newFormData);
    }
  };

  const handleBlur = (field: keyof typeof formData) => () => {
    markFieldTouched(field);
    validateField(field, formData[field], formData);
  };

  const handleToggle = () => {
    dispatch(toggleDarkMode())
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Clear previous errors
    dispatch(clearError());
    
    // Validate all fields
    if (!validate(formData)) {
      // Mark all fields as touched to show errors
      Object.keys(formData).forEach(field => markFieldTouched(field));
      
      toast.error("Please fill in all required fields", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      await dispatch(signinUser(formData)).unwrap();
      
      // Show success message
      toast.success("Welcome back! Redirecting to dashboard...", {
        position: "top-right",
        autoClose: 2000,
      });
      
      // Navigation will happen automatically due to isAuthenticated useEffect
      
    } catch (error: any) {
      const parsedError = parseApiError(error);
      
      // Handle specific error codes
      if (parsedError.code === "AUTH_FAILED") {
        // Don't reveal which field is incorrect for security
        toast.error("Invalid username or password", {
          position: "top-right",
          autoClose: 4000,
        });
      } else if (parsedError.code === "NETWORK_ERROR") {
        toast.error("Network error. Please check your connection and try again.", {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        // Show general error
        toast.error(parsedError.message || "Sign in failed. Please try again.", {
          position: "top-right",
          autoClose: 4000,
        });
      }
      
      // Clear password field for security
      setFormData(prev => ({ ...prev, password: "" }));
    }
  };

  const handleForgotPassword = () => {
    toast.info("Password reset feature coming soon!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-background flex justify-center items-center p-4">
      <div>
        <div className="mb-5 flex justify-between items-center">
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to continue to Brainly</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              name="username"
              type="text"
              label="Username"
              placeholder="Enter your username"
              value={formData.username}
              required
              onChange={handleInputChange("username")}
              onBlur={handleBlur("username")}
              error={getFieldError("username")}
              touched={touched.has("username")}
              autoComplete="username"
            />

            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              required
              onChange={handleInputChange("password")}
              onBlur={handleBlur("password")}
              error={getFieldError("password")}
              touched={touched.has("password")}
              showPasswordToggle
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border-border rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-muted-foreground hover:text-foreground">Remember me</span>
              </label>
              
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-muted-foreground hover:text-foreground font-medium"
              >
                Forgot password?
              </button>
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                text={loading ? "Signing In..." : "Sign In"}
                fullWidth
                loading={loading}
                onClick={handleSubmit}
                className="bg-primary text-primary-foreground hover:bg-primary/90 dark:text-primary-foreground "
              />
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-foreground hover:text-primary font-medium transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          </div>

          {/* Demo credentials notice */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-center text-muted-foreground">
              <strong className="text-foreground">Demo Account:</strong> You can create a new account or use your existing credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}