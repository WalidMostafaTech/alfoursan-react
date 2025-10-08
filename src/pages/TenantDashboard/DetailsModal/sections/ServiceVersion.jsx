import AfterTitle from "../../../../components/common/AfterTitle";
import FormBtn from "../../../../components/form/FormBtn";
import MainInput from "../../../../components/form/MainInput";

const ServiceVersion = () => {
  return (
    <section>
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MainInput id="version" label="اسم الاصدار" />
          <MainInput id="serviceStatus" label="حالة الخدمة" />
          <MainInput id="serviceVersion" label="اصدار الخدمة" />
        </div>

        {/* الحركية */}
        <AfterTitle title="خدمة بطاقة SIM" />

        {/* رقم السيارة واستهلاك الوقود */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MainInput id="iccid" label="iccid" />
          <MainInput id="status" label="حالة" />
        </div>

        <p className="text-sm text-gray-600">الموعد النهائي: 2026-04-27</p>

        {/* <FormBtn title="تحديث البيانات" /> */}
      </form>
    </section>
  );
};

export default ServiceVersion;
