import MainInput from "../../../../components/form/MainInput";

const ServiceVersion = ({ deviceSettings }) => {
  const subscription = deviceSettings?.subscription;

  return (
    <section>
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MainInput
            id="version"
            label="اسم الاصدار"
            value={subscription?.package_name_ar || ""}
            disabled
          />
          <MainInput
            id="serviceStatus"
            label="حالة الخدمة"
            value={subscription?.status || ""}
            disabled
          />
          <MainInput
            id="serviceVersion"
            label="اصدار الخدمة"
            value={subscription?.version || ""}
            disabled
          />
        </div>

        <div className="divider my-10">خدمة بطاقة SIM</div>

        {/* رقم السيارة واستهلاك الوقود */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MainInput id="iccid" label="iccid" disabled />
          <MainInput id="status" label="حالة" disabled />
        </div>

        <p className="text-sm text-gray-600">الموعد النهائي: 2026-04-27</p>

        {/* <FormBtn title="تحديث البيانات" /> */}
      </form>
    </section>
  );
};

export default ServiceVersion;
