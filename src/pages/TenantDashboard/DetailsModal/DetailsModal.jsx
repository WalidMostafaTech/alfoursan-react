import { useState } from "react";
import Details from "./sections/Details";
import ServiceVersion from "./sections/ServiceVersion";
import Membership from "./sections/Membership";
import PreviousCommands from "./sections/PreviousCommands";

const tabs = [
  { key: "Details", label: "اعدادات عامة" },
  { key: "ServiceVersion", label: "إصدار الخدمة" },
  { key: "Membership", label: "عضوية" },
  { key: "Command", label: "قائمه الاوامر" },
  { key: "PreviousCommands", label: "الاوامر السابقه" },
  { key: "Alerts", label: "إعدادات التنبيهات" },
  { key: "SpecificTask", label: "تعيين مهمة محددة بوقت" },
  { key: "Reminders", label: "تذكيرات مخصصة" },
];

const DetailsModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("Details");

  return (
    <dialog open className="modal" dir="rtl">
      <div className="modal-box max-w-[80%] max-h-[90%] pt-10 relative">
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="btn btn-md btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>

        {/* 🔹 شريط التبويبات */}
        <div className="border-b border-gray-200 mb-4 flex items-center space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative p-3 text-xl whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "text-mainColor font-semibold"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-mainColor/40 to-mainColor rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* 🔹 محتوى التبويب الحالي */}
        <div className="mt-4">
          {activeTab === "Details" && <Details />}
          {activeTab === "ServiceVersion" && <ServiceVersion />}
          {activeTab === "Membership" && <Membership />}
          {activeTab === "Command" && <p>🔹 محتوى التبويب Command</p>}
          {activeTab === "PreviousCommands" && (
            <PreviousCommands />
          )}
          {activeTab === "Alerts" && <p>🔹 محتوى التبويب Alerts</p>}
          {activeTab === "SpecificTask" && <p>🔹 محتوى التبويب SpecificTask</p>}
          {activeTab === "Reminders" && <p>🔹 محتوى التبويب Reminders</p>}
        </div>
      </div>
    </dialog>
  );
};

export default DetailsModal;
