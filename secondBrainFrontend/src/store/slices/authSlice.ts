// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { type AuthState } from "../types/index";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface AuthError {
  message: string;
  fieldErrors?: Record<string, string>;
  code?: string;
}

// Signup thunk with better error handling
export const signupUser = createAsyncThunk<
  { message: string; userId?: string; username?: string },
  { username: string; password: string },
  { rejectValue: AuthError }
>(
  'auth/signup',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username,
        password,
      });
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue({
          message: error.response.data.message || "Signup failed",
          fieldErrors: error.response.data.errors,
          code: error.response.data.code,
        });
      }
      return rejectWithValue({
        message: error.message || "Network error occurred",
        code: "NETWORK_ERROR",
      });
    }
  }
);

// Signin thunk with better error handling
export const signinUser = createAsyncThunk<
  { token: string; username: string },
  { username: string; password: string },
  { rejectValue: AuthError }
>(
  'auth/signin',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        username,
        password,
      });
      
      // Extract data from response
      const { token, data } = response.data;
      const finalToken = token || data?.token;
      const finalUsername = data?.username || username;
      
      if (!finalToken) {
        throw new Error("No token received from server");
      }
      
      return { token: finalToken, username: finalUsername };
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue({
          message: error.response.data.message || "Sign in failed",
          fieldErrors: error.response.data.errors,
          code: error.response.data.code,
        });
      }
      return rejectWithValue({
        message: error.message || "Network error occurred",
        code: "NETWORK_ERROR",
      });
    }
  }
);

// Verify token on app load
export const verifyToken = createAsyncThunk<
  { valid: boolean; username?: string },
  string,
  { rejectValue: AuthError }
>(
  'auth/verifyToken',
  async (token, { rejectWithValue }) => {
    try {
      // You'd need to implement a /api/v1/verify endpoint
      const response = await axios.get(`${BACKEND_URL}/api/v1/verify`, {
        headers: { Authorization: token }
      });
      return { valid: true, username: response.data.username };
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue({
        message: "Session expired",
        code: "TOKEN_EXPIRED",
      });
    }
  }
);

interface ExtendedAuthState extends AuthState {
  fieldErrors?: Record<string, string>;
  errorCode?: string;
}

const initialState: ExtendedAuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  fieldErrors: undefined,
  errorCode: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.fieldErrors = undefined;
      state.errorCode = undefined;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
      state.fieldErrors = undefined;
      state.errorCode = undefined;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload);
    },
    clearFieldError: (state, action: PayloadAction<string>) => {
      if (state.fieldErrors) {
        delete state.fieldErrors[action.payload];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup handlers
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = undefined;
        state.errorCode = undefined;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.fieldErrors = undefined;
        state.errorCode = undefined;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Signup failed";
        state.fieldErrors = action.payload?.fieldErrors;
        state.errorCode = action.payload?.code;
      })
      
      // Signin handlers
      .addCase(signinUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = undefined;
        state.errorCode = undefined;
      })
      .addCase(signinUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = { 
          id: "", // You might want to decode this from JWT
          username: action.payload.username 
        };
        state.isAuthenticated = true;
        state.error = null;
        state.fieldErrors = undefined;
        state.errorCode = undefined;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(signinUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Sign in failed";
        state.fieldErrors = action.payload?.fieldErrors;
        state.errorCode = action.payload?.code;
      })
      
      // Token verification handlers
      .addCase(verifyToken.fulfilled, (state, action) => {
        if (action.payload.valid) {
          state.isAuthenticated = true;
          if (action.payload.username) {
            state.user = { id: "", username: action.payload.username };
          }
        }
      })
      .addCase(verifyToken.rejected, (state) => {
        state.token = null;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { logout, clearError, setToken, clearFieldError } = authSlice.actions;
export default authSlice.reducer;