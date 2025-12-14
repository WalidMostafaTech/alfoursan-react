import { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const MainInput = ({
  label,
  type = "text",
  options = [],
  error,
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const commonInputClasses = `w-full text-base bg-white outline-none border-none px-1 py-0.5 rounded-md ring-1 transition-all placeholder:text-gray-400 placeholder:text-sm ${
    isPassword && "pe-10"
  } ${
    error
      ? "ring-red-600"
      : "ring-gray-400 focus-within:ring-2 focus-within:ring-mainColor"
  } ${disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : ""}`;

  const commonLabel = label && (
    <label
      htmlFor={id}
      className="block w-fit text-xs font-semibold mb-2 capitalize"
    >
      {label} :
    </label>
  );

  const commonError = error && (
    <p className="mt-2 flex items-center gap-1 text-sm text-red-600">{error}</p>
  );

  // ✅ textarea input
  if (type === "textarea") {
    return (
      <div>
        {commonLabel}
        <textarea
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          {...rest}
          className={`${commonInputClasses} h-22 resize-none`}
        />
        {commonError}
      </div>
    );
  }

  // ✅ select input
  if (type === "select") {
    return (
      <div>
        {commonLabel}
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          {...rest}
          className={`${commonInputClasses} select pe-10 h-7 text-sm`}
        >
          {options.map((option, idx) => (
            <option key={`${option.value}-${idx}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {commonError}
      </div>
    );
  }

  // ✅ باقي أنواع الـ inputs (text - email - password ...)
  return (
    <div>
      {commonLabel}
      <div className="relative">
        <input
          id={id}
          name={id}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          {...rest}
          className={commonInputClasses}
        />

        {isPassword && (
          <span
            onClick={() => !disabled && setShowPassword(!showPassword)}
            className={`text-neutral-500 cursor-pointer absolute top-1/2 -translate-y-1/2 end-2 text-2xl ${
              disabled ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
          </span>
        )}
      </div>
      {commonError}
    </div>
  );
};

export default MainInput;
