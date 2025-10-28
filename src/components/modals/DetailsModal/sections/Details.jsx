import FormBtn from "../../../../components/form/FormBtn";
import MainInput from "../../../../components/form/MainInput";

const Details = () => {
  return (
    <section>
      <form className="space-y-6">
        {/* اسم الجهاز */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MainInput
            id="deviceName"
            label="اسم الجهاز"
            value="R12L-F-424279"
            disabled
          />
          <MainInput id="importTime" label="وقت الاستيراد" disabled />
          {/* الموديل ووقت التفعيل */}
          <MainInput id="model" label="الموديل" value="R12L-F" disabled />
          <MainInput
            id="activationTime"
            label="وقت التفعيل"
            value="2025-09-21"
            disabled
          />
          {/* IMEI وانتهاء صلاحية الضمنة */}
          <MainInput id="imei" label="IMEI" value="353994714424279" disabled />
          <MainInput
            id="expiryDate"
            label="انتهاء صلاحية المنصة"
            value="2026-09-21"
            disabled
          />
          {/* SIM card number */}
          <MainInput
            id="simCardNumber"
            label="SIM card number"
            value="436888731137119"
            disabled
          />
          {/* iccid */}
          <MainInput
            id="iccid"
            label="iccid"
            value="89430103524285274807"
            disabled
          />
        </div>

        {/* الحركية */}
        <div className="divider my-10">المركبه</div>

        {/* رقم السيارة واستهلاك الوقود */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MainInput id="carNumber" label="رقم السيارة" value="R12L-F-424279" />

          <MainInput id="fuelConsumption" label="استهلاك الوقود / 100 كم" />

          {/* رقم الهاتف والشخص الذي يمكن الاتصال به */}

          <MainInput id="phoneNumber" label="رقم الهاتف" />

          <MainInput id="contactPerson" label="الشخص الذي يمكن الاتصال به" />
        </div>

        <FormBtn title="تحديث البيانات" />
      </form>
    </section>
  );
};

export default Details;
