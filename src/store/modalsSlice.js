import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  detailsModal: { show: false, section: "", id: null },
  shareModal: { show: false, imei: null },
  polygonMenu: { show: false, section: "", id: null },
  geoFenceModal: { show: false, section: "", id: null },
  associateDeviceModal: { show: false, section: "", id: null },
};

const modalsSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    // ✅ Details modal
    openDetailsModal: (state, action) => {
      const { section = "", id = null } = action.payload || {};
      state.detailsModal = { show: true, section, id };
    },
    closeDetailsModal: (state) => {
      state.detailsModal = { show: false, section: "", id: null };
    },

    // ✅ Share modal
    openShareModal: (state, action) => {
      const imei = action.payload || null;
      state.shareModal = { show: true, imei };
    },
    closeShareModal: (state) => {
      state.shareModal = { show: false, imei: null };
    },

    // ✅ Polygon menu
    openPolygonMenu: (state, action) => {
      const { section = "", id = null } = action.payload || {};
      state.polygonMenu = { show: true, section, id };
    },
    closePolygonMenu: (state) => {
      state.polygonMenu = { show: false, section: "", id: null };
    },

    // ✅ GeoFence modal
    openGeoFenceModal: (state, action) => {
      const { section = "", id = null } = action.payload || {};
      state.geoFenceModal = { show: true, section, id };
    },
    closeGeoFenceModal: (state) => {
      state.geoFenceModal = { show: false, section: "", id: null };
    },

    // ✅ Associate Device modal
    openAssociateDeviceModal: (state, action) => {
      const { section = "", id = null } = action.payload || {};
      state.associateDeviceModal = { show: true, section, id };
    },
    closeAssociateDeviceModal: (state) => {
      state.associateDeviceModal = { show: false, section: "", id: null };
    },
  },
});

export const {
  openDetailsModal,
  closeDetailsModal,
  openShareModal,
  closeShareModal,
  openPolygonMenu,
  closePolygonMenu,
  openGeoFenceModal,
  closeGeoFenceModal,
  openAssociateDeviceModal,
  closeAssociateDeviceModal,
} = modalsSlice.actions;

export default modalsSlice.reducer;
