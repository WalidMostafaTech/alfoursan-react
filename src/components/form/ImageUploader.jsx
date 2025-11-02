import { useState, useEffect } from "react";
import { FiCamera, FiX } from "react-icons/fi";

const ImageUploader = ({
  label = "Upload Image",
  onChange,
  error,
  initialImages = [],
}) => {
  const [image, setImage] = useState(initialImages[0] || null);

  // ✅ تحدّث الصورة لو جات initialImages جديدة
  useEffect(() => {
    if (initialImages[0]?.preview !== image?.preview) {
      setImage(initialImages[0] || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialImages]);

  // ✅ عند اختيار صورة جديدة
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    const newImage = { file, preview };

    // استبدال الصورة القديمة
    setImage(newImage);
    onChange([newImage]);

    // لإعادة اختيار نفس الملف لاحقاً
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setImage(null);
    onChange([]);
  };

  return (
    <div>
      <p className="font-medium text-gray-900 mb-2">{label}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {/* ✅ زر رفع الصورة (دايمًا موجود) */}
        <label
          htmlFor="product_image"
          className="w-full aspect-square flex flex-col items-center justify-center gap-2 text-center
          border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-myBlue-2 hover:bg-gray-50 transition"
        >
          <FiCamera className="text-3xl text-gray-500" />
          <span className="text-gray-500 text-sm">
            {image ? "Replace Image" : "Upload Image"}
          </span>
          <input
            id="product_image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>

        {/* ✅ لو في صورة حالياً نعرضها */}
        {image && (
          <div className="relative group w-full aspect-square">
            <img
              src={image.preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-xl border border-myBlue-2"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default ImageUploader;
