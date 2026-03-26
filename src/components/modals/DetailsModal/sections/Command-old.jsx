import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { clearCommandResponse } from "../../../../store/modalsSlice";

import FormBtn from "../../../../components/form/FormBtn";
import MainInput from "../../../../components/form/MainInput";
import { sendCommand } from "../../../../services/monitorServices";

const CommandOLD = ({ deviceID, deviceSettings, refetch }) => {
  const dispatch = useDispatch();
  const { commandResponse } = useSelector((state) => state.modals);
  const [activeCommand, setActiveCommand] = useState(0);
  const [selectedCommand, setSelectedCommand] = useState("");
  const [waitingForResponse, setWaitingForResponse] = useState(false);

  // SOS commands
  const [sosAction, setSosAction] = useState("add"); // add | delete
  const [sosAddPhones, setSosAddPhones] = useState({
    phone1: "",
    phone2: "",
    phone3: "",
  });
  const [sosDeleteBy, setSosDeleteBy] = useState("sequence"); // sequence | phone
  const [sosDeleteValues, setSosDeleteValues] = useState({
    v1: "",
    v2: "",
    v3: "",
  });
  
  // التحقق من أن الاستجابة تخص هذا الجهاز
  const deviceImei = deviceSettings?.device?.serial_number;
  const isResponseForThisDevice = 
    commandResponse?.response && 
    commandResponse?.imei === deviceImei;

  const commandTabs = [
    { label: "Remote opening door", isNew: false },
    { label: "Engine Control", isNew: false },
    { label: "Query parameter configuration", isNew: false },
    { label: "Query latitude and longitude", isNew: false },
    { label: "Query software version", isNew: false },
    { label: "Check Status", isNew: false },
    { label: "Vibration Alarm", isNew: true },
    { label: "Power Alarm", isNew: true },
    { label: "ACC Alarm", isNew: true },
    { label: "Driving Behavior", isNew: true },
    { label: "Door & AC Control", isNew: true },
    { label: "SOS Numbers", isNew: true },
    // { label: "GSM Jamming", isNew: true },
    { label: "Customized Command", isNew: false },
  ];

  const commands = [
    // 0: Remote opening door
    {
      type: "select",
      selectOptions: [
        { value: "CTRDOOR,1#", label: "فتح الباب" },
        { value: "CTRDOOR,0#", label: "اغلاق الباب" },
      ],
      content: null,
      value: null,
    },
    // 1: Engine Control
    {
      type: "select",
      selectOptions: [
        { value: "RELAY,1#", label: "قطع الزيت والكهرباء" },
        { value: "RELAY,0#", label: "إعادة الزيت والكهرباء" },
      ],
      content: null,
      value: null,
    },
    // 2: Query parameter configuration
    {
      type: "static",
      selectOptions: null,
      content:
        "The parameters set of device include device IMEI, upload interval, SOS number, center number, time zone, GPRS switch, IP domain name and port number, etc.",
      value: "PARAM#",
    },
    // 3: Query latitude and longitude
    {
      type: "static",
      selectOptions: null,
      content: "The device re-reports a new location information",
      value: "WHERE#",
    },
    // 4: Query software version
    {
      type: "static",
      selectOptions: null,
      content: "Current device program version",
      value: "VERSION#",
    },
    // 5: Check Status
    {
      type: "static",
      selectOptions: null,
      content:
        "The current status of device, including GPRS connection status, whether external power is connected, voltage value, GSM signal strength, GPS status, etc.",
      value: "STATUS#",
    },
    // 6: Vibration Alarm (NEW)
    {
      type: "select",
      selectOptions: [
        { value: "SENALM,ON,0#", label: "تفعيل تنبيه الاهتزاز (GPRS فقط)" },
        { value: "SENALM,ON,1#", label: "تفعيل تنبيه الاهتزاز (SMS+GPRS)" },
        { value: "SENALM,ON,2#", label: "تفعيل تنبيه الاهتزاز (GPRS+SMS+PHONE)" },
        { value: "SENALM,ON,3#", label: "تفعيل تنبيه الاهتزاز (GPRS+PHONE)" },
        { value: "SENALM,FULL,1#", label: "تفعيل كامل (يعمل حتى مع ACC ON)" },
        { value: "SENALM,OFF#", label: "إيقاف تنبيه الاهتزاز" },
        { value: "SENALM#", label: "استعلام إعدادات تنبيه الاهتزاز" },
        { value: "SENLEVEL,1#", label: "حساسية الاهتزاز: 1 (أعلى حساسية)" },
        { value: "SENLEVEL,3#", label: "حساسية الاهتزاز: 3" },
        { value: "SENLEVEL,5#", label: "حساسية الاهتزاز: 5 (افتراضي)" },
        { value: "SENLEVEL,7#", label: "حساسية الاهتزاز: 7" },
        { value: "SENLEVEL,10#", label: "حساسية الاهتزاز: 10 (أقل حساسية)" },
        { value: "SENLEVEL#", label: "استعلام مستوى حساسية الاهتزاز" },
      ],
      content: "تنبيه الاهتزاز: يرسل تنبيه عند اكتشاف اهتزاز. OFF=إيقاف، ON=تفعيل (لا يعمل مع ACC ON)، FULL=تفعيل كامل. الحساسية من 1-10 (الأقل = أكثر حساسية).",
      value: null,
    },
    // 7: Power Alarm (NEW)
    {
      type: "select",
      selectOptions: [
        { value: "POWERALM,ON,0#", label: "تفعيل تنبيه انقطاع الطاقة (GPRS فقط)" },
        { value: "POWERALM,ON,1#", label: "تفعيل تنبيه انقطاع الطاقة (SMS+GPRS)" },
        { value: "POWERALM,ON,2#", label: "تفعيل تنبيه انقطاع الطاقة (GPRS+SMS+PHONE)" },
        { value: "POWERALM,ON,3#", label: "تفعيل تنبيه انقطاع الطاقة (GPRS+PHONE)" },
        { value: "POWERALM,OFF#", label: "إيقاف تنبيه انقطاع الطاقة" },
        { value: "POWERALM#", label: "استعلام إعدادات تنبيه انقطاع الطاقة" },
      ],
      content: "تنبيه انقطاع الطاقة: يرسل تنبيه عند فصل الطاقة الخارجية عن الجهاز. مفعّل افتراضياً.",
      value: null,
    },
    // 8: ACC Alarm (NEW)
    {
      type: "select",
      selectOptions: [
        { value: "ACCALM,ON,1,0#", label: "تنبيه ACC ON فقط (GPRS)" },
        { value: "ACCALM,ON,2,0#", label: "تنبيه ACC OFF فقط (GPRS)" },
        { value: "ACCALM,ON,3,0#", label: "تنبيه ACC ON و OFF (GPRS)" },
        { value: "ACCALM,ON,1,1#", label: "تنبيه ACC ON فقط (SMS+GPRS)" },
        { value: "ACCALM,ON,2,1#", label: "تنبيه ACC OFF فقط (SMS+GPRS)" },
        { value: "ACCALM,ON,3,1#", label: "تنبيه ACC ON و OFF (SMS+GPRS)" },
        { value: "ACCALM,OFF#", label: "إيقاف تنبيه ACC" },
        { value: "ACCALM#", label: "استعلام إعدادات تنبيه ACC" },
      ],
      content: "تنبيه ACC: يرسل تنبيه عند تشغيل/إيقاف المحرك (ACC ON/OFF). B=1: ACC ON، B=2: ACC OFF، B=3: كلاهما.",
      value: null,
    },
    // 9: Driving Behavior (NEW)
    {
      type: "select",
      selectOptions: [
        // Rapid Acceleration
        // { value: "EACCELE,3,1#", label: "تنبيه التسارع المفاجئ (3 م/ث²)" },
        // { value: "EACCELE,5,1#", label: "تنبيه التسارع المفاجئ (5 م/ث²)" },
        // { value: "EACCELE,0,0#", label: "إيقاف تنبيه التسارع المفاجئ" },
        { value: "EACCELE#", label: "استعلام إعدادات التسارع المفاجئ" },
        // Rapid Deceleration
        { value: "EDECELE,3,1#", label: "تنبيه التباطؤ المفاجئ (3 م/ث²)" },
        { value: "EDECELE,5,1#", label: "تنبيه التباطؤ المفاجئ (5 م/ث²)" },
        { value: "EDECELE,0,0#", label: "إيقاف تنبيه التباطؤ المفاجئ" },
        { value: "EDECELE#", label: "استعلام إعدادات التباطؤ المفاجئ" },
        // Sharp Turn
        { value: "EANGLE,5,1#", label: "تنبيه الانعطاف الحاد (5 م/ث²)" },
        { value: "EANGLE,7,1#", label: "تنبيه الانعطاف الحاد (7 م/ث²)" },
        { value: "EANGLE,0,0#", label: "إيقاف تنبيه الانعطاف الحاد" },
        { value: "EANGLE#", label: "استعلام إعدادات الانعطاف الحاد" },
        // Collision
        { value: "ECOLLI,12,1#", label: "تنبيه التصادم (12 - حساسية عالية)" },
        { value: "ECOLLI,15,1#", label: "تنبيه التصادم (15 - حساسية متوسطة)" },
        { value: "ECOLLI,18,1#", label: "تنبيه التصادم (18 - حساسية منخفضة)" },
        { value: "ECOLLI,0,0#", label: "إيقاف تنبيه التصادم" },
        { value: "ECOLLI#", label: "استعلام إعدادات التصادم" },
      ],
      content: "تنبيهات سلوك القيادة: التسارع المفاجئ (2-10 م/ث²)، التباطؤ المفاجئ (3-10 م/ث²)، الانعطاف الحاد (3-15 م/ث²)، التصادم (10-25). القيمة الأصغر = حساسية أعلى.",
      value: null,
    },
    // 10: Door & AC Control (NEW)
    {
      type: "select",
      selectOptions: [
        // Extended Function Mode
        { value: "EXTENSIONS,1#", label: "وضع: تنبيه مفتاح التكييف" },
        { value: "EXTENSIONS,2#", label: "وضع: تنبيه فتح/إغلاق الباب (افتراضي)" },
        { value: "EXTENSIONS#", label: "استعلام وضع الوظائف الممتدة" },
        // Remote Door
        { value: "CTRDOOR,1#", label: "فتح الباب عن بعد" },
        { value: "CTRDOOR,0#", label: "إغلاق الباب عن بعد" },
        // Door Alarm
        { value: "CDALM,ON,1,1#", label: "تنبيه فتح الباب" },
        { value: "CDALM,ON,2,1#", label: "تنبيه إغلاق الباب" },
        { value: "CDALM,ON,3,1#", label: "تنبيه فتح وإغلاق الباب" },
        { value: "CDALM,OFF#", label: "إيقاف تنبيه الباب" },
        { value: "CDALM#", label: "استعلام إعدادات تنبيه الباب" },
        // AC Alarm
        { value: "ACALM,ON,1,1#", label: "تنبيه تشغيل التكييف" },
        { value: "ACALM,ON,2,1#", label: "تنبيه إيقاف التكييف" },
        { value: "ACALM,ON,3,1#", label: "تنبيه تشغيل وإيقاف التكييف" },
        { value: "ACALM,OFF#", label: "إيقاف تنبيه التكييف" },
        { value: "ACALM#", label: "استعلام إعدادات تنبيه التكييف" },
      ],
      content: "التحكم بالباب والتكييف: فتح/إغلاق الباب عن بعد، تنبيهات الباب (B=1: فتح، B=2: إغلاق، B=3: كلاهما)، تنبيهات التكييف.",
      value: null,
    },
    // 11: GSM Jamming (NEW)

    /*
    {
      type: "select",
      selectOptions: [
        { value: "JAMALM,ON,30,0,0#", label: "تفعيل كشف التشويش (بدون قطع الوقود)" },
        { value: "JAMALM,ON,30,1,0#", label: "تفعيل + قطع الوقود (سرعة < 20 كم/س)" },
        { value: "JAMALM,ON,30,2,0#", label: "تفعيل + قطع الوقود فوري" },
        { value: "JAMALM,ON,30,3,0#", label: "تفعيل + قطع الوقود (ACC OFF فقط)" },
        { value: "JAMALM,ON,10,1,1#", label: "كشف سريع 10ث + قطع + SMS" },
        { value: "JAMALM,OFF#", label: "إيقاف كشف التشويش" },
        { value: "JAMALM#", label: "استعلام إعدادات كشف التشويش" },
      ],
      content: "كشف تشويش GSM: يكتشف أجهزة التشويش ويمكنه قطع الوقود تلقائياً. T=وقت الكشف بالثواني، N=0: بدون قطع، N=1: قطع عند سرعة<20، N=2: قطع فوري، N=3: قطع في ACC OFF فقط. يعود الوقود بعد 1 دقيقة من استعادة الإشارة.",
      value: null,
    },
*/

    // 12: Customized Command
    {
      type: "customized",
      selectOptions: null,
      content: null,
      value: null,
    },
    // 13: SOS Numbers (NEW)
    {
      type: "sos",
      selectOptions: null,
      content:
        "أوامر SOS:\n- إضافة: SOS,A,[phone1][,phone2][,phone3]# (يمكن إضافة 3 أرقام)\n- حذف: SOS,D,[sequence1][,sequence2][,sequence3]# أو SOS,D,[phone][,phone2]#",
      value: null,
    },
  ];

  const normalizePhone = (v) =>
    String(v ?? "")
      .trim()
      .replace(/[^\d+]/g, ""); // يسمح بـ + في البداية إن وجدت

  const buildSosCommand = () => {
    if (sosAction === "add") {
      const p1 = normalizePhone(sosAddPhones.phone1);
      const p2 = normalizePhone(sosAddPhones.phone2);
      const p3 = normalizePhone(sosAddPhones.phone3);

      if (!p1 && !p2 && !p3) return null;

      // نلتزم بصيغة البروتوكول مع 3 خانات (يترك الخانة فارغة عند عدم إدخالها)
      return `SOS,A,${p1 || ""},${p2 || ""},${p3 || ""}#`;
    }

    // delete
    const raw = [sosDeleteValues.v1, sosDeleteValues.v2, sosDeleteValues.v3]
      .map((x) => String(x ?? "").trim())
      .filter(Boolean);

    if (raw.length === 0) return null;

    const entries =
      sosDeleteBy === "phone" ? raw.map(normalizePhone).filter(Boolean) : raw;

    if (entries.length === 0) return null;

    return `SOS,D,${entries.join(",")}#`;
  };

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

    // SOS dynamic command
    if (commands[activeCommand].type === "sos") {
      commandValue = buildSosCommand();
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
    <section className="flex" >
      {/* ✅ القائمة اليمنى */}
      <aside className="flex flex-col p-4 gap-2 max-h-[60vh] overflow-y-auto">
        {commandTabs.map((cmd, index) => (
          <button
            key={index}
            onClick={() => setActiveCommand(index)}
            className={`px-3 py-2 text-sm text-start rounded transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeCommand === index
                ? "text-mainColor border-e-4 border-mainColor bg-mainColor/10"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            {cmd.label}
            {cmd.isNew && (
              <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                NEW
              </span>
            )}
          </button>
        ))}
      </aside>

      {/* ✅ منطقة المحتوى */}
      <div className="flex-1">
        <form className="space-y-4 max-w-xl" onSubmit={handleSubmit}>
          {commands[activeCommand].type === "select" && (
            <>
              {/* ✅ وصف الأمر إن وجد */}
              {commands[activeCommand].content && (
                <p className="text-gray-600 bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs mb-3 leading-relaxed">
                  💡 {commands[activeCommand].content}
                </p>
              )}
              <MainInput
                type="select"
                id="command"
                label="الأوامر"
                options={[
                  { value: "", label: "اختر الأمر..." },
                  ...commands[activeCommand].selectOptions,
                ]}
                value={selectedCommand}
                onChange={(e) => setSelectedCommand(e.target.value)}
              />
            </>
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

          {commands[activeCommand].type === "sos" && (
            <div className="space-y-4" >
              <p className="text-gray-600 bg-red-50 border border-red-200 p-3 rounded-lg text-xs leading-relaxed whitespace-pre-line">
                💡 {commands[activeCommand].content}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSosAction("add")}
                  className={`px-3 py-2 text-xs rounded-lg border transition-all cursor-pointer ${
                    sosAction === "add"
                      ? "bg-mainColor text-white border-mainColor"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  إضافة أرقام SOS
                </button>
                <button
                  type="button"
                  onClick={() => setSosAction("delete")}
                  className={`px-3 py-2 text-xs rounded-lg border transition-all cursor-pointer ${
                    sosAction === "delete"
                      ? "bg-mainColor text-white border-mainColor"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  حذف أرقام SOS
                </button>
              </div>

              {sosAction === "add" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <MainInput
                    id="sos_phone1"
                    label="SOS رقم 1"
                    placeholder="مثال: 13122012031"
                    value={sosAddPhones.phone1}
                    onChange={(e) =>
                      setSosAddPhones((p) => ({ ...p, phone1: e.target.value }))
                    }
                  />
                  <MainInput
                    id="sos_phone2"
                    label="SOS رقم 2"
                    placeholder="اختياري"
                    value={sosAddPhones.phone2}
                    onChange={(e) =>
                      setSosAddPhones((p) => ({ ...p, phone2: e.target.value }))
                    }
                  />
                  <MainInput
                    id="sos_phone3"
                    label="SOS رقم 3"
                    placeholder="اختياري"
                    value={sosAddPhones.phone3}
                    onChange={(e) =>
                      setSosAddPhones((p) => ({ ...p, phone3: e.target.value }))
                    }
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSosDeleteBy("sequence")}
                      className={`px-3 py-2 text-xs rounded-lg border transition-all cursor-pointer ${
                        sosDeleteBy === "sequence"
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      حذف بالترتيب (Sequence)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSosDeleteBy("phone")}
                      className={`px-3 py-2 text-xs rounded-lg border transition-all cursor-pointer ${
                        sosDeleteBy === "phone"
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      حذف بالرقم (Phone)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <MainInput
                      id="sos_del_1"
                      label={sosDeleteBy === "phone" ? "رقم/1" : "Sequence/1"}
                      placeholder={sosDeleteBy === "phone" ? "مثال: 13122012031" : "مثال: 2"}
                      value={sosDeleteValues.v1}
                      onChange={(e) =>
                        setSosDeleteValues((p) => ({ ...p, v1: e.target.value }))
                      }
                    />
                    <MainInput
                      id="sos_del_2"
                      label={sosDeleteBy === "phone" ? "رقم/2" : "Sequence/2"}
                      placeholder="اختياري"
                      value={sosDeleteValues.v2}
                      onChange={(e) =>
                        setSosDeleteValues((p) => ({ ...p, v2: e.target.value }))
                      }
                    />
                    <MainInput
                      id="sos_del_3"
                      label={sosDeleteBy === "phone" ? "رقم/3" : "Sequence/3"}
                      placeholder="اختياري"
                      value={sosDeleteValues.v3}
                      onChange={(e) =>
                        setSosDeleteValues((p) => ({ ...p, v3: e.target.value }))
                      }
                    />
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-[11px] text-gray-500 mb-1">سيتم إرسال الأمر التالي:</p>
                <p className="font-mono text-xs text-gray-800 break-all">
                  {buildSosCommand() || "—"}
                </p>
              </div>
            </div>
          )}

          {/* ✅ عرض Loader أثناء انتظار الاستجابة */}
          {waitingForResponse && !isResponseForThisDevice && (
            <div
              className="mb-4 p-4 bg-linear-to-r from-blue-50 to-indigo-50 border-r-4 border-blue-500 rounded-lg shadow-md animate-fade-in-up"
              
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

export default CommandOLD;
