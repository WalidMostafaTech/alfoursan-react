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

        <div className="divider my-14">خدمة بطاقة SIM</div>

        {/* رقم السيارة واستهلاك الوقود */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MainInput
            id="iccid"
            label="iccid"
            value={deviceSettings?.device.iccid}
            disabled
          />
          <MainInput id="status" label="حالة" disabled />
        </div>

        <p className="text-xs text-gray-600">
          الموعد النهائي: {subscription?.expiry_date}
        </p>

        {/* <FormBtn title="تحديث البيانات" /> */}
      </form>
    </section>
  );
};

export default ServiceVersion;
