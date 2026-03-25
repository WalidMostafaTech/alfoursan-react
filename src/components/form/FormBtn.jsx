import { useState } from "react";
import { useTranslation } from "react-i18next";

const FormBtn = ({
  title = "form.submit",
  disabled,
  loading,
  onClick = () => {},
  type = "submit",
  variant = "primary",
}) => {
  const { t } = useTranslation();
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`btn btn-sm ${loading ? "cursor-wait! contrast-50" : ""} ${
        variant === "primary" ? "btn-primary" : "btn-success text-white"
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? (
        <>
          {t("form.loading")}
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ms-2"></span>
        </>
      ) : (
        t(title)
      )}
    </button>
  );
};

export default FormBtn;
