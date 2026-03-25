import { useState, useEffect } from "react";
import { FiCamera, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const ImageUploader = ({ label, onChange, error, initialImages = [] }) => {
  const { t } = useTranslation();

  const [image, setImage] = useState(initialImages[0] || null);

  useEffect(() => {
    if (initialImages[0]?.preview !== image?.preview) {
      setImage(initialImages[0] || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialImages]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    const newImage = { file, preview };

    setImage(newImage);
    onChange([newImage]);

    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setImage(null);
    onChange([]);
  };

  return (
    <div>
      <p className="font-medium text-gray-900 mb-2">
        {label || t("imageUploader.uploadImage")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        <label
          htmlFor="product_image"
          className="w-full aspect-square flex flex-col items-center justify-center gap-2 text-center
          border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-myBlue-2 hover:bg-gray-50 transition"
        >
          <FiCamera className="text-3xl text-gray-500" />

          <span className="text-gray-500 text-sm">
            {image
              ? t("imageUploader.replaceImage")
              : t("imageUploader.uploadImage")}
          </span>

          <input
            id="product_image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>

        {image && (
          <div className="relative group w-full aspect-square">
            <img
              src={image.preview}
              alt={t("imageUploader.preview")}
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

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default ImageUploader;
