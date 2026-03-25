import { useState } from "react";
import Details from "./sections/Details";
import ServiceVersion from "./sections/ServiceVersion";
import Membership from "./sections/Membership";
import PreviousCommands from "./sections/PreviousCommands";
import Command from "./sections/Command";
import Alerts from "./sections/Alerts";
import SpecificTask from "./sections/SpecificTask";
import Reminders from "./sections/Reminders";
import CarDriver from "./sections/CarDriver";
import { useDispatch, useSelector } from "react-redux";
import { closeDetailsModal } from "../../../store/modalsSlice";
import { useQuery } from "@tanstack/react-query";
import { getDeviceSettings } from "../../../services/monitorServices";
import Loader from "../../Loading/Loader";
import Maintenance from "./sections/Maintenance";
import { useTranslation } from "react-i18next";


const DetailsModal = () => {
  const { t } = useTranslation();
  const { detailsModal } = useSelector((state) => state.modals);
  const { section, id } = detailsModal;

  const tabs = [
    { key: "details", label: t("detailsModal.tabs.details") },
    { key: "carDriver", label: t("detailsModal.tabs.carDriver") },
    { key: "serviceVersion", label: t("detailsModal.tabs.serviceVersion") },
    { key: "membership", label: t("detailsModal.tabs.membership") },
    { key: "command", label: t("detailsModal.tabs.command") },
    { key: "previousCommands", label: t("detailsModal.tabs.previousCommands") },
    { key: "alerts", label: t("detailsModal.tabs.alerts") },
    { key: "maintenance", label: t("detailsModal.tabs.maintenance") },
    { key: "specificTask", label: t("detailsModal.tabs.specificTask") },
  ];

  const [activeTab, setActiveTab] = useState(section || "details");

  const dispatch = useDispatch();

  // ✅ جلب بيانات الجهاز
  const {
    data: deviceSettings,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["deviceSettings", id],
    queryFn: () => getDeviceSettings(id),
  });

  const onClose = () => {
    dispatch(closeDetailsModal());
  };

  return (
    <dialog open className="modal items-start detailsModal" dir="rtl">
      {/*  model to top */}
      <div className="modal-box w-[96vw] max-w-6xl max-h-[92vh] pt-9 p-3 md:p-4 mt-3 relative top-0 overflow-y-auto">
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="btn btn-md btn-circle btn-ghost absolute left-2 top-2 z-10 bg-red-900 text-white"
        >
          ✕
        </button>

        {/* 🔹 شريط التبويبات */}
        <div className="border-b border-gray-200 mb-3 flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-2 py-1.5 text-sm whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "text-mainColor font-semibold"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-mainColor/40 to-mainColor rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* 🔹 محتوى التبويب الحالي */}
        <div className="mt-3">
          {isLoading ? (
            <Loader />
          ) : (
            <>
              {activeTab === "details" && (
                <Details deviceSettings={deviceSettings} refetch={refetch} />
              )}
              {activeTab === "carDriver" && (
                <CarDriver
                  deviceSettings={deviceSettings}
                  refetch={refetch}
                  deviceID={id}
                />
              )}
              {activeTab === "serviceVersion" && (
                <ServiceVersion deviceSettings={deviceSettings} />
              )}
              {activeTab === "membership" && (
                <Membership deviceSettings={deviceSettings} />
              )}
              {activeTab === "command" && (
                <Command
                  deviceSettings={deviceSettings}
                  deviceID={id}
                  refetch={refetch}
                />
              )}
              {activeTab === "previousCommands" && (
                <PreviousCommands
                  deviceSettings={deviceSettings}
                  refetch={refetch}
                />
              )}
              {activeTab === "alerts" && (
                <Alerts deviceSettings={deviceSettings} refetch={refetch} />
              )}

              {activeTab === "maintenance" && <Maintenance deviceID={id} deviceSettings={deviceSettings} />}
              {activeTab === "specificTask" && (
                <SpecificTask
                  deviceSettings={deviceSettings}
                  refetch={refetch}
                  deviceID={id}
                />
              )}

              {activeTab === "reminders" && <Reminders />}
            </>
          )}
        </div>
      </div>

      <label className="modal-backdrop" onClick={onClose}></label>
    </dialog>
  );
};

export default DetailsModal;
