import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  provider: localStorage.getItem("mapProvider") || "google",
  clusters: false,
  showDeviceName: false,
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

      if (state.clusters) {
        state.provider = "google";
        localStorage.setItem("mapProvider", "google");
      }
    },

    toggleDeviceName: (state) => {
      state.showDeviceName = !state.showDeviceName;
    },
  },
});

export const { switchMap, toggleClusters, toggleDeviceName } = mapSlice.actions;
export default mapSlice.reducer;
