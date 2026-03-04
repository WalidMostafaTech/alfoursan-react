import { useMemo, useState } from "react";
import { updateCarDriverLink } from "../../../../services/monitorServices";
import { toast } from "react-toastify";

const CarDriver = ({ deviceSettings, refetch, deviceID }) => {
  const device = deviceSettings?.device || {};
  const carDriver = deviceSettings?.car_driver || {};
  const lists = deviceSettings?.lists || {};

  const branches = Array.isArray(lists.branches) ? lists.branches : [];
  const cars = Array.isArray(lists.cars) ? lists.cars : [];

  const [selectedCarId, setSelectedCarId] = useState(() => String(carDriver?.linked_car_id ?? ""));
  const [selectedBranchId, setSelectedBranchId] = useState(() => String(device?.branch_id ?? ""));

  const linkedCarLabel = useMemo(() => {
    const c = carDriver?.linked_car;
    if (!c) return "غير مرتبط";
    return `${c.name || "سيارة"}${c.car_number ? ` - ${c.car_number}` : ""}`;
  }, [carDriver?.linked_car]);

  const linkedBranchLabel = useMemo(() => {
    const b = carDriver?.linked_car_branch;
    if (!b) return "—";
    return b.name || "—";
  }, [carDriver?.linked_car_branch]);

  const linkedDriverLabel = useMemo(() => {
    const d = carDriver?.linked_driver;
    if (!d) return "—";
    return `${d.name || "—"}${d.phone ? ` - ${d.phone}` : ""}`;
  }, [carDriver?.linked_driver]);

  const directBranchLabel = useMemo(() => {
    const b = carDriver?.direct_branch;
    if (!b) return "لا يوجد (يعتمد على فرع السيارة)";
    return b.name || "—";
  }, [carDriver?.direct_branch]);

  const submit = async (payload, successMsg) => {
    try {
      await updateCarDriverLink({ device_id: deviceID, ...payload });
      toast.success(successMsg);
      await refetch?.();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "فشل تنفيذ العملية";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl border border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-gray-500">السيارة الحالية</div>
            <div className="font-semibold">{linkedCarLabel}</div>
          </div>
          <div>
            <div className="text-gray-500">فرع السيارة</div>
            <div className="font-semibold">{linkedBranchLabel}</div>
          </div>
          <div>
            <div className="text-gray-500">السائق</div>
            <div className="font-semibold">{linkedDriverLabel}</div>
          </div>
          <div>
            <div className="text-gray-500">الفرع المباشر على الجهاز</div>
            <div className="font-semibold">{directBranchLabel}</div>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl border border-gray-200">
        <div className="font-semibold mb-2">تغيير السيارة</div>
        <div className="flex flex-col md:flex-row gap-2">
          <select
            className="flex-1 border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-mainColor"
            value={selectedCarId}
            onChange={(e) => setSelectedCarId(e.target.value)}
          >
            <option value="">بدون سيارة</option>
            {cars.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {(c.name || "سيارة") + (c.car_number ? ` - ${c.car_number}` : "")}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-sm bg-mainColor text-white"
            onClick={() =>
              submit(
                selectedCarId ? { car_id: Number(selectedCarId) } : { detach_car: true },
                "تم تحديث ربط السيارة"
              )
            }
          >
            حفظ
          </button>

          <button
            type="button"
            className="btn btn-sm bg-red-600 text-white"
            onClick={() => submit({ detach_car: true }, "تم فصل ربط السيارة")}
          >
            فصل
          </button>
        </div>
      </div>

      <div className="p-3 rounded-xl border border-gray-200">
        <div className="font-semibold mb-2">تحديد فرع مباشر (تجاوز فرع السيارة)</div>
        <div className="flex flex-col md:flex-row gap-2">
          <select
            className="flex-1 border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-mainColor"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
          >
            <option value="">بدون فرع مباشر</option>
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
                selectedBranchId ? { branch_id: Number(selectedBranchId) } : { clear_branch: true },
                "تم تحديث الفرع المباشر"
              )
            }
          >
            حفظ
          </button>

          <button
            type="button"
            className="btn btn-sm bg-gray-700 text-white"
            onClick={() => {
              setSelectedBranchId("");
              submit({ clear_branch: true }, "تم إلغاء الفرع المباشر");
            }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarDriver;

