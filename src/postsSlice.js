import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (page, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://jsonplaceholder.typicode.com/posts?_limit=10&_page=${page}`
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch posts";
      return rejectWithValue(message);
    }
  }
);

export const fetchUsersByIds = createAsyncThunk(
  "posts/fetchUsersByIds",
  async (userIds, { rejectWithValue }) => {
    try {
      const responses = await Promise.all(
        userIds.map((userId) =>
          axios.get(`https://jsonplaceholder.typicode.com/users/${userId}`)
        )
      );
      return responses.map((response) => response.data);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch users";
      return rejectWithValue(message);
    }
  }
);

export const fetchPostsAndUsers = createAsyncThunk(
  "posts/fetchPostsAndUsers",
  async (page, { dispatch, getState, rejectWithValue }) => {
    try {
      const posts = await dispatch(fetchPosts(page)).unwrap();
      const state = getState();
      const missingUserIds = [...new Set(posts.map((post) => post.userId))].filter(
        (userId) => !state.posts.usersById[userId]
      );

      if (missingUserIds.length > 0) {
        await dispatch(fetchUsersByIds(missingUserIds)).unwrap();
      }

      return posts;
    } catch (error) {
      const message =
        typeof error === "string" ? error : error.message || "Failed to chain data fetch";
      return rejectWithValue(message);
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState: {
    posts: [],
    status: "idle",
    usersStatus: "idle",
    error: null,
    usersError: null,
    page: 1,
    usersById: {},
  },
  reducers: {
    incrementPage(state) {
      state.page += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.posts = [...state.posts, ...action.payload];
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchUsersByIds.pending, (state) => {
        state.usersStatus = "loading";
        state.usersError = null;
      })
      .addCase(fetchUsersByIds.fulfilled, (state, action) => {
        state.usersStatus = "succeeded";
        action.payload.forEach((user) => {
          state.usersById[user.id] = user;
        });
      })
      .addCase(fetchUsersByIds.rejected, (state, action) => {
        state.usersStatus = "failed";
        state.usersError = action.payload || action.error.message;
      });
  },
});

export const { incrementPage } = postsSlice.actions;
export default postsSlice.reducer;
