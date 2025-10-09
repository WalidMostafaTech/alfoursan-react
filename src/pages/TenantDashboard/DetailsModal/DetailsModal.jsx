import { useState } from "react";
import Details from "./sections/Details";
import ServiceVersion from "./sections/ServiceVersion";
import Membership from "./sections/Membership";
import PreviousCommands from "./sections/PreviousCommands";
import Command from "./sections/Command";
import Alerts from "./sections/Alerts";
import SpecificTask from "./sections/SpecificTask";
import Reminders from "./sections/Reminders";
import { useSelector } from "react-redux";

const tabs = [
  { key: "details", label: "اعدادات عامة" },
  { key: "serviceVersion", label: "إصدار الخدمة" },
  { key: "membership", label: "عضوية" },
  { key: "command", label: "قائمه الاوامر" },
  { key: "previousCommands", label: "الاوامر السابقه" },
  { key: "alerts", label: "إعدادات التنبيهات" },
  { key: "specificTask", label: "تعيين مهمة محددة بوقت" },
  { key: "reminders", label: "تذكيرات مخصصة" },
];

const DetailsModal = ({ onClose }) => {
  const { section, id } = useSelector((state) => state.detailsModal);
  const [activeTab, setActiveTab] = useState(section || "details");

  return (
    <dialog open className="modal items-start detailsModal" dir="rtl">
      {/*  model to top */}
      <div className="modal-box  max-w-[80%] max-h-[90%] pt-10 mt-10 relative top-0">
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
          {activeTab === "details" && <Details />}
          {activeTab === "serviceVersion" && <ServiceVersion />}
          {activeTab === "membership" && <Membership />}
          {activeTab === "command" && <Command />}
          {activeTab === "previousCommands" && <PreviousCommands />}
          {activeTab === "alerts" && <Alerts />}
          {activeTab === "specificTask" && <SpecificTask />}
          {activeTab === "reminders" && <Reminders />}
        </div>
      </div>
    </dialog>
  );
};

export default DetailsModal;
