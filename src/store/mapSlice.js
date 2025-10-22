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

    setClusters: (state, action) => {
      state.clusters = action.payload;
    },

    toggleDeviceName: (state) => {
      state.showDeviceName = !state.showDeviceName;
    },
  },
});

export const { switchMap, setClusters, toggleDeviceName } = mapSlice.actions;

// 🔥 هنا الـ thunk اللي فيه التأخير
export const toggleClusters = () => (dispatch, getState) => {
  const { provider, clusters } = getState().map;

  // لو هي مش جوجل نحولها ونستنى شويه
  if (provider !== "google") {
    dispatch(switchMap("google"));

    setTimeout(() => {
      dispatch(setClusters(!clusters));
    }, 1000); // نص ثانية مثلاً
  } else {
    // لو هي جوجل خلاص شغّل الكلاستر عادي
    dispatch(setClusters(!clusters));
  }
};

export default mapSlice.reducer;
