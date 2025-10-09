// src/store/mapSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  provider: localStorage.getItem("mapProvider") || "google",
};

const mapTypeSlice = createSlice({
  name: "mapType",
  initialState,
  reducers: {
    switchMap: (state, action) => {
      state.provider = action.payload;
      localStorage.setItem("mapProvider", action.payload);
    },
  },
});

export const { switchMap } = mapTypeSlice.actions;
export default mapTypeSlice.reducer;
