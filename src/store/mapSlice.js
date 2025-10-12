import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  provider: localStorage.getItem("mapProvider") || "google",
  clusters: false,
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    switchMap: (state, action) => {
      state.provider = action.payload;
      localStorage.setItem("mapProvider", action.payload);
    },

    toggleClusters: (state) => {
      state.clusters = !state.clusters;
    },
  },
});

export const { switchMap, toggleClusters } = mapSlice.actions;
export default mapSlice.reducer;
