// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import contentReducer from './slices/contentSlice';
import uiReducer from './slices/uiSlice';
import searchReducer from "./slices/searchSlice";
import chatReducer from "./slices/chatSlice"; // NEW

export const store = configureStore({
  reducer: {
    auth: authReducer,
    content: contentReducer,
    ui: uiReducer,
    search: searchReducer,
    chat: chatReducer // NEW
  },

});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;