import {createSlice, createAsyncThunk, type PayloadAction} from "@reduxjs/toolkit";
import axios from "axios";
import {type AuthState,type User} from "../types/index";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const signupUser = createAsyncThunk('auth/signup',
async ({username, password} :  {username: string; password: string}) => {
  const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
    username,
    password,
  });
  return response.data;
}
);

export const signinUser = createAsyncThunk('auth/signin',
async ({username,password}: {username: string, password: string}) => {
  const response = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
    username,
    password,
  });
  return response.data;
});

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name:'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
    .addCase(signupUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(signupUser.fulfilled, (state) => {
      state.loading=false;
    })
    .addCase(signupUser.rejected, (state,action)=> {
      state.loading=false;
      state.error=action.error.message || "Signup Failed";
    })
    .addCase(signinUser.pending, (state)=> {
      state.loading=false;
      state.error=null;
    })
    .addCase(signinUser.fulfilled, (state,action) => {
      state.loading=false;
      state.token= action.payload.token;
      state.isAuthenticated=true;
      localStorage.setItem('token', action.payload.token);
    })

    .addCase(signinUser.rejected, (state,action)=>{
      state.loading=false;
      state.error = action.error.message || "Signin Failed";
    });

  },

});

export const {logout, clearError,setToken} = authSlice.actions;
export default authSlice.reducer;