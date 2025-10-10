import {createSlice, createAsyncThunk, type PayloadAction} from '@reduxjs/toolkit';
import axios from 'axios';
import {type ContentState, type Content} from "../types/index";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";


// Async Thunks
export const fetchContents = createAsyncThunk(
  'content/fetchContents',
  async ({token, filter}: {filter: string; token: string}) => {
    let url = `${BACKEND_URL}/api/v1/content`;
    let responseKey = 'content';

    if (filter === "twitter") {
      url = `${BACKEND_URL}/api/v1/content/tweets`;
      responseKey = "tweets";
    } else if (filter === "youtube") {
      url = `${BACKEND_URL}/api/v1/content/youtube`;
      responseKey = "youtubeVideos";
    } else if (filter === "article") {
      url = `${BACKEND_URL}/api/v1/content/articles`;
      responseKey = "articles";
    } else if (filter === "note") {
      url = `${BACKEND_URL}/api/v1/content/notes`;
      responseKey = "notes";
    }

    const response = await axios.get(url, {
      headers: {Authorization:token},
    });
    // Handle both old and new response formats
    return response.data.data?.[responseKey] || response.data[responseKey] || [];
  }
);

export const createContent = createAsyncThunk(
  'content/createContent',
  async ({ 
    contentData, 
    token 
  }: { 
    contentData: any; 
    token: string; 
  }) => {
    // Create tags first
    const tagRes = await axios.post(
      `${BACKEND_URL}/api/v1/tags`,
      { tags: contentData.tags },
      { headers: { Authorization: token } }
    );

    const payload = {
      ...contentData,
      tags: tagRes.data.data?.tagIds || tagRes.data.tagIds,
    };

    const response = await axios.post(
      `${BACKEND_URL}/api/v1/content`,
      payload,
      { headers: { Authorization: token } }
    );

    // Return the content object from the response
    return response.data.data || response.data;
  }
);


export const updateContent = createAsyncThunk(
  'content/updateContent',
  async ({ 
    id, 
    contentData, 
    token 
  }: { 
    id: string; 
    contentData: any; 
    token: string; 
  }) => {
    const tagRes = await axios.post(
      `${BACKEND_URL}/api/v1/tags`,
      { tags: contentData.tags },
      { headers: { Authorization: token } }
    );

    const payload = {
      ...contentData,
      tags: tagRes.data.data?.tagIds || tagRes.data.tagIds,
    };

    const response = await axios.put(
      `${BACKEND_URL}/api/v1/content/${id}`,
      payload,
      { headers: { Authorization: token } }
    );

    return response.data.data || response.data.content;
  }
);

export const deleteContent = createAsyncThunk(
  'content/deleteContent',
  async ({ id, token }: { id: string; token: string }) => {
    await axios.delete(`${BACKEND_URL}/api/v1/content/${id}`, {
      headers: { Authorization: token },
    });
    return id;
  }
);

export const fetchSharedContents = createAsyncThunk(
  'content/fetchSharedContent',
  async (shareId: string) => {
    const response = await  axios.get(`${BACKEND_URL}/api/v1/brain/${shareId}`);
    return response.data.data;
  }
)


const initialState: ContentState = {
  contents: [],
  selectedContent: null,
  loading: false,
  error: null,
  filter: "all",
  sharedContents: [],
  sharedUsername: "",
  sharedLoading: false,
  sharedError: null,
};


const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<"all" | "twitter" | "youtube" | "article" | "note">) => {
      state.filter = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSelectedContent: (state, action: PayloadAction<Content | null>) => {
      state.selectedContent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContents.fulfilled, (state, action) => {
        state.loading = false;
        state.contents = action.payload;
      })
      .addCase(fetchContents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch contents';
      })
      .addCase(createContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContent.fulfilled, (state, action) => {
        state.loading = false;
        state.contents.unshift(action.payload); // Add to beginning for newest first
      })
      .addCase(createContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create content';
      })
      .addCase(updateContent.fulfilled, (state, action) => {
        const index = state.contents.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.contents[index] = action.payload;
        }
      })
      .addCase(deleteContent.fulfilled, (state, action) => {
        state.contents = state.contents.filter(c => c._id !== action.payload);
      })
      .addCase(fetchSharedContents.pending, (state) => {
        state.sharedLoading=true;
        state.sharedError = null;
      })
      .addCase(fetchSharedContents.fulfilled, (state, action) => {
        state.sharedLoading = false;
        state.sharedContents = action.payload.content || [];
        state.sharedUsername = action.payload.username || "Unknown User";
      })
      .addCase(fetchSharedContents.rejected, (state,action) => {
        state.sharedLoading = false;
        state.sharedError = action.error.message || "Failed to fetch shared content";
      })
  },
});

export const { setFilter, clearError, setSelectedContent } = contentSlice.actions;
export default contentSlice.reducer;