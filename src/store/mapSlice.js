import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  provider: localStorage.getItem("mapProvider") || "google",
  clusters: false,
  showDeviceName: false,
  mapType: localStorage.getItem("mapType") || "roadmap",
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    // تغيير الـ provider
    switchMap: (state, action) => {
      state.provider = action.payload;
      localStorage.setItem("mapProvider", action.payload);

      // لو اخترت mapbox نخلي النوع roadmap
      if (action.payload === "mapbox") {
        state.mapType = "roadmap";
        localStorage.setItem("mapType", "roadmap");
      }
    },

    // تغيير نوع الخريطة
    setMapType: (state, action) => {
      state.mapType = action.payload;
      localStorage.setItem("mapType", action.payload);

      // أي نوع غير roadmap يخلي الخريطة جوجل
      if (action.payload !== "roadmap") {
        state.provider = "google";
        localStorage.setItem("mapProvider", "google");
      }
    },

    setClusters: (state, action) => {
      state.clusters = action.payload;
    },

    toggleDeviceName: (state) => {
      state.showDeviceName = !state.showDeviceName;
    },
  },
});

// toggleClusters بسيط ومتزامن
export const toggleClusters = () => (dispatch, getState) => {
  const { provider, clusters } = getState().map;

  if (provider !== "google") {
    dispatch(switchMap("google"));
    setTimeout(() => dispatch(setClusters(!clusters)), 300); // أقل زمن كافي لتحديث الخريطة
  } else {
    dispatch(setClusters(!clusters));
  }
};

export const { switchMap, setClusters, toggleDeviceName, setMapType } =
  mapSlice.actions;

export default mapSlice.reducer;
