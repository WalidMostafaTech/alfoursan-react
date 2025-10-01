import Loader from "./Loader";

const LoadingPage = ({ overlay = false }) => {
  return (
    <article
      className={`h-screen flex items-center justify-center ${
        overlay
          ? "w-screen fixed inset-0 z-50 bg-dark-gray/80"
          : "bg-dark-gray"
      }`}
    >
      <Loader />
    </article>
  );
};

export default LoadingPage;
