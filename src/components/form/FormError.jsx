const FormError = ({ errorMsg }) => {
  return (
    <div
      className={`bg-red-800 text-white px-4 rounded-lg overflow-hidden duration-300 ease-in-out ${
        !errorMsg ? "max-h-0" : "max-h-60 py-4"
      }`}
    >
      {errorMsg}
    </div>
  );
};

export default FormError;
