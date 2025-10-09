import FormBtn from "../../../../components/form/FormBtn";
import MainInput from "../../../../components/form/MainInput";

const SpecificTask = () => {
  return (
    <section dir="rtl" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MainInput
          id="deviceName"
          label="اسم الجهاز"
          value="R12L-F-424279"
          disabled
        />
        <MainInput id="type" label="نوع" value="ايقاف المحرك" disabled />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control w-full max-w-xs" dir="rtl">
          <label className="label">
            <span className="label-text text-lg font-semibold text-gray-700">
              نوع التنفيذ
            </span>
          </label>

          <div className="flex items-center gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="execution-type"
                className="radio radio-primary"
                defaultChecked
              />
              <span className="text-gray-700 font-medium">يوميًا</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="execution-type"
                className="radio radio-primary"
              />
              <span className="text-gray-700 font-medium">نطاق التاريخ</span>
            </label>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">تفعيل المهمه :</span>
            <input type="checkbox" className="toggle toggle-primary" />
          </label>
        </div>

        <MainInput id="startDate" type="date" label="تاريخ البداية" />
        <MainInput id="endDate" type="date" label="تاريخ النهاية" />
        <MainInput id="startTime" type="time" label="من" />
        <MainInput id="endTime" type="time" label="الى" />
      </div>

      <FormBtn title="تأكيد" />
    </section>
  );
};

export default SpecificTask;
