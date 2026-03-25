import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import FormBtn from "../../../../components/form/FormBtn";
import MainInput from "../../../../components/form/MainInput";
import { updateDialogCar } from "../../../../services/monitorServices";

const Details = ({ deviceSettings, refetch }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    sim_number: "",
    iccid: "",
    carnum: "",
    fuel_consumption_per_100km: "",
    contact_phone: "",
    contact_person: "",
    notes: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [currentIcon, setCurrentIcon] = useState(0);

  const icons = [
    { src: "/car-green.svg", value: "car" },
    { src: "/car-red.svg", value: "bus" },
  ];

  const device = deviceSettings?.device;

  // ✅ تحميل بيانات السيارة داخل الفورم
  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name || "",
        sim_number: device.sim_number || "",
        iccid: device.iccid || "",
        carnum: device.carnum || "",
        fuel_consumption_per_100km: device.fuel_consumption_per_100km || "",
        contact_phone: device.contact_phone || "",
        contact_person: device.contact_person || "",
        notes: device.notes || "",
      });

      setPreview(device.image_full_path || "");
    }
  }, [device]);

  // ✅ Mutation لتحديث بيانات السيارة
  const { mutate: updateCar, isPending } = useMutation({
    mutationFn: ({ id, formData }) => updateDialogCar(id, formData),
    onSuccess: (res) => {
      toast.success(t("details.updateSuccess"));

      // ✅ حدث بيانات السيارة مباشرة داخل TenantDashboard باستخدام استجابة API
      // res shape: { device_id, imei, device }
      try {
        if (res?.device?.id) {
          window.dispatchEvent(
            new CustomEvent("device-updated", {
              detail: { device: res.device, device_id: res.device_id, imei: res.imei },
            })
          );
        }
      } catch {
        // ignore
      }

      refetch();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
  });

  // ✅ تغيير القيم داخل الفورم
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ عند اختيار صورة جديدة
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file)); // عرض الصورة الجديدة
  };

  // ✅ حذف الصورة
  const handleRemoveImage = () => {
    setImage(null);
    setPreview("");
  };

  // ✅ عند الضغط على "تحديث البيانات"
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!device?.id) return;

    const dataToSend = new FormData();

    dataToSend.append("name", formData.name);
    dataToSend.append("sim_number", formData.sim_number);
    dataToSend.append("iccid", formData.iccid);

    dataToSend.append("carnum", formData.carnum);
    dataToSend.append(
      "fuel_consumption_per_100km",
      formData.fuel_consumption_per_100km
    );
    dataToSend.append("contact_phone", formData.contact_phone);
    dataToSend.append("contact_person", formData.contact_person);
    dataToSend.append("notes", formData.notes);
    dataToSend.append("icon", icons[currentIcon].value);

    if (image) dataToSend.append("image", image);

    updateCar({ id: device.id, formData: dataToSend });
  };

  return (
    <section>
      <div className="space-y-4">
        {/* ✅ بيانات الجهاز */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <MainInput
            id="name"
            label={t("details.deviceName")}
            value={formData.name}
            onChange={handleChange}
          />
          <MainInput
            id="importTime"
            label={t("details.importTime")}
            value={device.imported_at || ""}
            disabled
          />
          <MainInput
            id="model"
            label={t("details.model")}
            value={device.device_model?.name_ar || ""}
            disabled
          />
          <MainInput
            id="activationTime"
            label={t("details.activationTime")}
            value={device.activated_at || ""}
            disabled
          />
          <MainInput
            id="imei"
            label={t("details.imei")}
            value={device.serial_number || ""}
            disabled
          />
          <MainInput
            id="expiryDate"
            label={t("details.expiryDate")}
            value={device.platform_expiry || ""}
            disabled
          />
          <MainInput
            id="sim_number"
            label={t("details.simCardNumber")}
            value={formData.sim_number}
            onChange={handleChange}
          />
          <MainInput
            id="iccid"
            label={t("details.iccid")}
            value={formData.iccid}
            onChange={handleChange}
          />
        </div>

        <div className="divider my-3">{t("details.vehicle")}</div>

        {/* ✅ نموذج التحديث */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <MainInput
              id="carnum"
              name="carnum"
              label={t("details.carNumber")}
              value={formData.carnum}
              onChange={handleChange}
            />

            <MainInput
              id="fuel_consumption_per_100km"
              name="fuel_consumption_per_100km"
              label={t("details.fuelConsumption")}
              value={formData.fuel_consumption_per_100km}
              onChange={handleChange}
            />

            <MainInput
              id="contact_phone"
              name="contact_phone"
              label={t("details.phoneNumber")}
              value={formData.contact_phone}
              onChange={handleChange}
            />

            <MainInput
              id="contact_person"
              name="contact_person"
              label={t("details.contactPerson")}
              value={formData.contact_person}
              onChange={handleChange}
            />

            {/* ✅ رفع الصورة العادي */}
            <div>
              <div className="flex items-center gap-3">
                <MainInput
                  id="image"
                  type="file"
                  label={t("details.carImage")}
                  onChange={handleImageChange}
                />
                {preview && (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Car Preview"
                      className="w-24 h-24 rounded-lg object-cover border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-1 -right-1 bg-red-600 text-white p-1 rounded-full shadow-md"
                    >
                      <FiX className="text-sm" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ اختيار الأيقونة */}
            <div>
              <p className="mb-2 text-sm font-medium text-gray-900">
                {t("details.carIcon")}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {icons.map((icon, index) => (
                  <img
                    key={index}
                    src={icon.src}
                    alt={icon.value}
                    className={`cursor-pointer rounded w-9 p-1 ${
                      currentIcon === index ? "bg-mainColor" : "bg-gray-200"
                    }`}
                    onClick={() => setCurrentIcon(index)}
                  />
                ))}
              </div>
            </div>

            <MainInput
              id="notes"
              name="notes"
              label={t("details.notes")}
              type="textarea"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <FormBtn title={t("details.updateData")} disabled={isPending} />
        </form>
      </div>
    </section>
  );
};

export default Details;
