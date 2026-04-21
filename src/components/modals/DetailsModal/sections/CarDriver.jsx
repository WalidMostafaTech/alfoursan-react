import { useMemo, useState } from "react";
import { updateCarDriverLink } from "../../../../services/monitorServices";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const CarDriver = ({ deviceSettings, refetch, deviceID }) => {
  const { t } = useTranslation();

  const device = deviceSettings?.device || {};
  const carDriver = deviceSettings?.car_driver || {};
  const lists = deviceSettings?.lists || {};

  if (!deviceSettings || !device || !carDriver || !lists)
    return (
      <p className="text-center py-2 px-4 my-20 w-fit mx-auto rounded-lg bg-primary text-white">
        {t("somethingWentWrong")}
      </p>
    );

  const branches = Array.isArray(lists?.branches) ? lists?.branches : [];
  const cars = Array.isArray(lists?.cars) ? lists?.cars : [];

  const [selectedCarId, setSelectedCarId] = useState(() =>
    String(carDriver?.linked_car_id ?? ""),
  );
  const [selectedBranchId, setSelectedBranchId] = useState(() =>
    String(device?.branch_id ?? ""),
  );

  const linkedCarLabel = useMemo(() => {
    const c = carDriver?.linked_car;
    if (!c) return t("carDriver?.notLinked");
    return `${c.name || t("carDriver?.car")}${
      c.car_number ? ` - ${c.car_number}` : ""
    }`;
  }, [carDriver?.linked_car, t]);

  const linkedBranchLabel = useMemo(() => {
    const b = carDriver?.linked_car_branch;
    if (!b) return t("carDriver?.noData");
    return b.name || t("carDriver?.noData");
  }, [carDriver?.linked_car_branch, t]);

  const linkedDriverLabel = useMemo(() => {
    const d = carDriver?.linked_driver;
    if (!d) return t("carDriver?.noData");
    return `${d.name || t("carDriver?.noData")}${
      d.phone ? ` - ${d.phone}` : ""
    }`;
  }, [carDriver?.linked_driver, t]);

  const directBranchLabel = useMemo(() => {
    const b = carDriver?.direct_branch;
    if (!b) return t("carDriver?.noDirectBranch");
    return b.name || t("carDriver?.noData");
  }, [carDriver?.direct_branch, t]);

  const submit = async (payload, successMsg) => {
    try {
      await updateCarDriverLink({ device_id: deviceID, ...payload });
      toast.success(successMsg);
      await refetch?.();
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || t("carDriver?.error");
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl border border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-gray-500">{t("carDriver?.currentCar")}</div>
            <div className="font-semibold">{linkedCarLabel}</div>
          </div>
          <div>
            <div className="text-gray-500">{t("carDriver?.carBranch")}</div>
            <div className="font-semibold">{linkedBranchLabel}</div>
          </div>
          <div>
            <div className="text-gray-500">{t("carDriver?.driver")}</div>
            <div className="font-semibold">{linkedDriverLabel}</div>
          </div>
          <div>
            <div className="text-gray-500">{t("carDriver?.directBranch")}</div>
            <div className="font-semibold">{directBranchLabel}</div>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl border border-gray-200">
        <div className="font-semibold mb-2">{t("carDriver?.changeCar")}</div>
        <div className="flex flex-col md:flex-row gap-2">
          <select
            className="flex-1 border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-mainColor"
            value={selectedCarId}
            onChange={(e) => setSelectedCarId(e.target.value)}
          >
            <option value="">{t("carDriver?.noCar")}</option>
            {cars.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {(c.name || t("carDriver?.car")) +
                  (c.car_number ? ` - ${c.car_number}` : "")}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-sm bg-mainColor text-white"
            onClick={() =>
              submit(
                selectedCarId
                  ? { car_id: Number(selectedCarId) }
                  : { detach_car: true },
                t("carDriver?.updateCarSuccess"),
              )
            }
          >
            {t("carDriver?.save")}
          </button>

          <button
            type="button"
            className="btn btn-sm bg-red-600 text-white"
            onClick={() =>
              submit({ detach_car: true }, t("carDriver?.detachCarSuccess"))
            }
          >
            {t("carDriver?.detach")}
          </button>
        </div>
      </div>

      <div className="p-3 rounded-xl border border-gray-200">
        <div className="font-semibold mb-2">
          {t("carDriver?.setDirectBranch")}
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <select
            className="flex-1 border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-mainColor"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
          >
            <option value="">{t("carDriver?.noDirectBranchOption")}</option>
            {branches.map((b) => (
              <option key={b.id} value={String(b.id)}>
                {b.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-sm bg-mainColor text-white"
            onClick={() =>
              submit(
                selectedBranchId
                  ? { branch_id: Number(selectedBranchId) }
                  : { clear_branch: true },
                t("carDriver?.updateBranchSuccess"),
              )
            }
          >
            {t("carDriver?.save")}
          </button>

          <button
            type="button"
            className="btn btn-sm bg-gray-700 text-white"
            onClick={() => {
              setSelectedBranchId("");
              submit(
                { clear_branch: true },
                t("carDriver?.clearBranchSuccess"),
              );
            }}
          >
            {t("carDriver?.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarDriver;
