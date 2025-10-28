import FormBtn from "../../../../components/form/FormBtn";

const Alerts = () => {
  const alerts = [
    { label: "تنبيه حد السرعة" },
    { label: "تنبيه انقطاع الاتصال" },
    { label: "تحذير القيادة المتهورة" },
    { label: "تنبيه الجهد المنخفض" },
    { label: "عتبة الراحة" },
    { label: "Idle Speed alert" },
    { label: "تنبيه القيادة بسبب التعب" },
    { label: "ACC OFF" },
    { label: "ACC ON" },
    { label: "حكم غير متصل بالإنترنت" },
  ];

  return (
    <section dir="rtl">
      {/* ✅ السويتشات */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
        {alerts.map((item, index) => (
          <label key={index} className="flex items-center gap-2">
            <input type="checkbox" className="toggle toggle-primary" />
            <span className="text-gray-700 text-sm font-medium">
              {item.label}
            </span>
          </label>
        ))}
      </div>

      <FormBtn title="تحديث اعدادات التنبيهات" />
    </section>
  );
};

export default Alerts;
