import { useState } from "react";
import { FaDoorOpen } from "react-icons/fa";
import FormBtn from "../../../../components/form/FormBtn";
import MainInput from "../../../../components/form/MainInput";

const commandTabs = [
  { key: "openDoor", label: "Remote opening door", content: "فتح الباب 🏠" },
  { key: "engine", label: "Engine Control", content: "تشغيل / إيقاف المحرك" },
  {
    key: "params",
    label: "Query parameter configuration",
    content: "إعدادات المتغيرات",
  },
  {
    key: "location",
    label: "Query latitude and longitude",
    content: "إحداثيات الموقع",
  },
  {
    key: "version",
    label: "Query software version",
    content: "إصدار البرنامج",
  },
  { key: "status", label: "Check Status", content: "التحقق من الحالة" },
  { key: "custom", label: "Customized Command", content: "أمر مخصص" },
];

const Command = () => {
  const [activeCommand, setActiveCommand] = useState("openDoor");

  return (
    <section className="flex" dir="rtl">
      {/* ✅ القائمة اليمنى */}
      <aside className="flex flex-col p-4 gap-2">
        {commandTabs.map((cmd) => (
          <button
            key={cmd.key}
            onClick={() => setActiveCommand(cmd.key)}
            className={`px-3 py-2 text-start rounded transition-all whitespace-nowrap cursor-pointer ${
              activeCommand === cmd.key
                ? "text-mainColor border-e-4 border-mainColor bg-mainColor/10"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            {cmd.label}
          </button>
        ))}
      </aside>

      {/* ✅ منطقة المحتوى */}
      <div className="flex-1 ">
        <div className="space-y-4 max-w-xl">
          <MainInput id="command" label="الأوامر" />

          <FormBtn title="Send Command" variant="success" />
        </div>
      </div>
    </section>
  );
};

export default Command;
