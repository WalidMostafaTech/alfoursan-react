import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { clearCommandResponse } from "../../../../store/modalsSlice";

import FormBtn from "../../../../components/form/FormBtn";
import MainInput from "../../../../components/form/MainInput";
import Loader from "../../../../components/Loading/Loader";
import { sendCommand } from "../../../../services/monitorServices";

const Command = ({ deviceID, deviceSettings, refetch }) => {
  const dispatch = useDispatch();
  const { commandResponse } = useSelector((state) => state.modals);
  const [activeCommand, setActiveCommand] = useState(0);
  const [selectedCommand, setSelectedCommand] = useState("");
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  
  // التحقق من أن الاستجابة تخص هذا الجهاز
  const deviceImei = deviceSettings?.device?.serial_number;
  const isResponseForThisDevice = 
    commandResponse?.response && 
    commandResponse?.imei === deviceImei;

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

  // ✅ عند استلام الاستجابة، إلغاء حالة الانتظار
  useEffect(() => {
    if (isResponseForThisDevice) {
      setWaitingForResponse(false);
      const timer = setTimeout(() => {
        dispatch(clearCommandResponse());
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isResponseForThisDevice, dispatch]);

  // ✅ mutation لإرسال الأمر
  const { mutate, isPending } = useMutation({
    mutationFn: sendCommand,
    onSuccess: () => {
      toast.success("✅ Command sent successfully!");
      setSelectedCommand("");
      // مسح أي استجابة سابقة وبدء انتظار الاستجابة
      dispatch(clearCommandResponse());
      setWaitingForResponse(true);
      refetch();
    },
    onError: (error) => {
      console.error(error);
      toast.error(error?.response?.data?.message);
      setWaitingForResponse(false);
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

          {/* ✅ عرض Loader أثناء انتظار الاستجابة */}
          {waitingForResponse && !isResponseForThisDevice && (
            <div
              className="mb-4 p-4 bg-linear-to-r from-blue-50 to-indigo-50 border-r-4 border-blue-500 rounded-lg shadow-md animate-fade-in-up"
              dir="rtl"
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-blue-700 text-sm mb-1">
                    في انتظار الاستجابة...
                  </h4>
                  <p className="text-gray-600 text-xs">
                    جاري انتظار استجابة الجهاز للأمر المرسل
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ عرض استجابة الأمر */}
          {isResponseForThisDevice && (
            <div
              className="mb-4 p-4 bg-linear-to-r from-green-50 to-emerald-50 border-r-4 border-green-500 rounded-lg shadow-md animate-fade-in-up"
              dir="rtl"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-5 h-5 text-green-600 animate-pulse"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h4 className="font-bold text-green-700 text-sm">
                      استجابة الأمر
                    </h4>
                  </div>
                  <p className="text-gray-800 text-sm break-all font-mono bg-white/50 p-2 rounded border border-green-200">
                    {commandResponse.response}
                  </p>
                </div>
                <button
                  onClick={() => {
                    dispatch(clearCommandResponse());
                    setWaitingForResponse(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                  aria-label="إغلاق"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
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
