import Loader from "./Loader";

const LoadingSection = () => {
  return (
    <article className="h-[600px] flex items-center justify-center bg-dark-gray">
      <Loader />
    </article>
  );
};

export default LoadingSection;
