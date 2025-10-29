import { useState } from "react";
import FormBtn from "../../../../components/form/FormBtn";
import MainInput from "../../../../components/form/MainInput";
import ImageUploader from "../../../form/ImageUploader";

const Details = () => {
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [currentIcons, setCurrentIcons] = useState(0);

  const icons = [
    { src: "/car-green.png", value: "car" },
    { src: "/car-red.png", value: "bus" },
    { src: "/car-green.png", value: "car" },
    { src: "/car-red.png", value: "bus" },
    { src: "/car-green.png", value: "car" },
    { src: "/car-red.png", value: "bus" },
    { src: "/car-green.png", value: "car" },
    { src: "/car-red.png", value: "bus" },
    { src: "/car-green.png", value: "car" },
    { src: "/car-red.png", value: "bus" },
    { src: "/car-green.png", value: "car" },
    { src: "/car-red.png", value: "bus" },
    { src: "/car-green.png", value: "car" },
    { src: "/car-red.png", value: "bus" },
  ];

  return (
    <section>
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MainInput
            id="deviceName"
            label="اسم الجهاز"
            value="R12L-F-424279"
            disabled
          />
          <MainInput id="importTime" label="وقت الاستيراد" disabled />
          <MainInput id="model" label="الموديل" value="R12L-F" disabled />
          <MainInput
            id="activationTime"
            label="وقت التفعيل"
            value="2025-09-21"
            disabled
          />
          <MainInput id="imei" label="IMEI" value="353994714424279" disabled />
          <MainInput
            id="expiryDate"
            label="انتهاء صلاحية المنصة"
            value="2026-09-21"
            disabled
          />
          <MainInput
            id="simCardNumber"
            label="SIM card number"
            value="436888731137119"
            disabled
          />
          <MainInput
            id="iccid"
            label="iccid"
            value="89430103524285274807"
            disabled
          />
        </div>

        <div className="divider my-10">المركبه</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MainInput id="carNumber" label="رقم السيارة" />

          <MainInput id="fuelConsumption" label="استهلاك الوقود / 100 كم" />

          <MainInput id="phoneNumber" label="رقم الهاتف" />

          <MainInput id="contactPerson" label="الشخص الذي يمكن الاتصال به" />

          <ImageUploader
            label="صور"
            onChange={setImages}
            error={imageError}
            initialImages={images}
          />

          <div>
            <p className="mb-2 font-medium text-gray-900">أيقونة السيارة</p>
            <div className="flex flex-wrap items-center gap-2">
              {icons.map((icon, index) => (
                <img
                  key={index}
                  src={icon.src}
                  alt={icon.value}
                  className={`cursor-pointer rounded-lg w-14 p-1 ${
                    currentIcons === index ? "bg-mainColor" : "bg-gray-200"
                  }`}
                  onClick={() => setCurrentIcons(index)}
                />
              ))}
            </div>
          </div>

          <MainInput id="remarks" label="ملاحظات" type="textarea" />
        </div>

        <FormBtn title="تحديث البيانات" />
      </form>
    </section>
  );
};

export default Details;
