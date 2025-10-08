const AfterTitle = ({title}) => {
  return (
    <div className="relative my-10">
      <hr className="border-gray-300" />
      <h3 className="text-lg font-semibold px-4 bg-white text-gray-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {title}
      </h3>
    </div>
  );
};

export default AfterTitle;
