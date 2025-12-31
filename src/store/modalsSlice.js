import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  detailsModal: { show: false, section: "", id: null },
  shareModal: { show: false, imei: null },
  polygonMenu: { show: false },
  geoFenceModal: { show: false, fenceData: {}, mission: "" },
  associateDeviceModal: { show: false, id: null },
  supportModal: { show: false },
  commandResponse: { response: null, imei: null, timestamp: null },
};

const modalsSlice = createSlice({
  name: "modals",
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
    openPolygonMenu: (state) => {
      state.polygonMenu = { show: true };
    },
    closePolygonMenu: (state) => {
      state.polygonMenu = { show: false };
    },

    // ✅ GeoFence modal
    openGeoFenceModal: (state, action) => {
      const { fenceData = {}, mission = "" } = action.payload || {};
      state.geoFenceModal = { show: true, fenceData, mission };
    },
    closeGeoFenceModal: (state) => {
      state.geoFenceModal = { show: false, fenceData: {}, mission: "" };
    },

    // ✅ Associate Device modal
    openAssociateDeviceModal: (state, action) => {
      const { id = null } = action.payload || {};
      state.associateDeviceModal = { show: true, id };
    },
    closeAssociateDeviceModal: (state) => {
      state.associateDeviceModal = { show: false, id: null };
    },

    // ✅ Support modal
    toggleSupportModal: (state) => {
      state.supportModal = { show: !state.supportModal.show };
    },

    // ✅ Command response
    setCommandResponse: (state, action) => {
      const { response, imei } = action.payload || {};
      state.commandResponse = { response, imei, timestamp: Date.now() };
    },
    clearCommandResponse: (state) => {
      state.commandResponse = { response: null, imei: null, timestamp: null };
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
  toggleSupportModal,
  setCommandResponse,
  clearCommandResponse,
} = modalsSlice.actions;

export default modalsSlice.reducer;
