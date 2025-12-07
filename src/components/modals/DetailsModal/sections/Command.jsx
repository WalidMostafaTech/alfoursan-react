import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import FormBtn from "../../../../components/form/FormBtn";
import MainInput from "../../../../components/form/MainInput";
import { sendCommand } from "../../../../services/monitorServices";

const Command = ({ deviceID, refetch }) => {
  const [activeCommand, setActiveCommand] = useState(0);
  const [selectedCommand, setSelectedCommand] = useState("");

  const commandTabs = [
    "Remote opening door",
    "Engine Control",
    "Query parameter configuration",
    "Query latitude and longitude",
    "Query software version",
    "Check Status",
    "Customized Command",
  ];

  const commands = [
    {
      type: "select",
      selectOptions: [
        { value: "CTRDOOR,1#", label: "فتح الباب" },
        { value: "CTRDOOR,0#", label: "اغلاق الباب" },
      ],
      content: null,
      value: null,
    },
    {
      type: "select",
      selectOptions: [
        { value: "RELAY,1#", label: "قطع الزيت والكهرباء" },
        { value: "RELAY,0#", label: "إعادة الزيت والكهرباء" },
      ],
      content: null,
      value: null,
    },
    {
      type: "static",
      selectOptions: null,
      content:
        "The parameters set of device include device IMEI, upload interval, SOS number, center number, time zone, GPRS switch, IP domain name and port number, etc.",
      value: "PARAM#",
    },
    {
      type: "static",
      selectOptions: null,
      content: "The device re-reports a new location information",
      value: "WHERE#",
    },
    {
      type: "static",
      selectOptions: null,
      content: "Current device program version",
      value: "VERSION#",
    },
    {
      type: "static",
      selectOptions: null,
      content:
        "The current status of device, including GPRS connection status, whether external power is connected, voltage value, GSM signal strength, GPS status, etc.",
      value: "STATUS#",
    },
    {
      type: "customized",
      selectOptions: null,
      content: null,
      value: null,
    },
  ];

  // ✅ mutation لإرسال الأمر
  const { mutate, isPending } = useMutation({
    mutationFn: sendCommand,
    onSuccess: () => {
      toast.success("✅ Command sent successfully!");
      setSelectedCommand("");
      refetch();
    },
    onError: (error) => {
      console.error(error);
      toast.error(error?.response?.data?.message);
    },
  });

  // ✅ إرسال البيانات
  const handleSubmit = (e) => {
    e.preventDefault();

    let commandValue = selectedCommand;

    // في حالة static أوامر
    if (commands[activeCommand].type === "static") {
      commandValue = commands[activeCommand].value;
    }

    // تحقق من الإدخال
    if (!commandValue) {
      toast.warn("⚠️ Please select or enter a command first");
      return;
    }

    const payload = {
      device_id: deviceID,
      command: commandValue,
    };

    mutate(payload);
  };

  return (
    <section className="flex" dir="rtl">
      {/* ✅ القائمة اليمنى */}
      <aside className="flex flex-col p-4 gap-2">
        {commandTabs.map((cmd, index) => (
          <button
            key={index}
            onClick={() => setActiveCommand(index)}
            className={`px-3 py-2 text-sm text-start rounded transition-all whitespace-nowrap cursor-pointer ${
              activeCommand === index
                ? "text-mainColor border-e-4 border-mainColor bg-mainColor/10"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            {cmd}
          </button>
        ))}
      </aside>

      {/* ✅ منطقة المحتوى */}
      <div className="flex-1">
        <form className="space-y-4 max-w-xl" onSubmit={handleSubmit}>
          {commands[activeCommand].type === "select" && (
            <MainInput
              type="select"
              id="command"
              label="الأوامر"
              options={[
                { value: "", label: "Select Command" },
                ...commands[activeCommand].selectOptions,
              ]}
              value={selectedCommand}
              onChange={(e) => setSelectedCommand(e.target.value)}
            />
          )}

          {commands[activeCommand].type === "static" && (
            <>
              <p className="text-gray-600 bg-mainColor/10 p-2 rounded-lg text-sm">
                {commands[activeCommand].content}
              </p>
            </>
          )}

          {commands[activeCommand].type === "customized" && (
            <MainInput
              id="command"
              label="الأوامر"
              placeholder="اكتب الأمر المخصص هنا..."
              value={selectedCommand}
              onChange={(e) => setSelectedCommand(e.target.value)}
            />
          )}

          <FormBtn
            title={"Send Command"}
            variant="success"
            loading={isPending}
          />
        </form>
      </div>
    </section>
  );
};

export default Command;
