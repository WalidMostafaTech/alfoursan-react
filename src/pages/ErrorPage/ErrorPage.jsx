import { Link, useRouteError } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CiWarning } from "react-icons/ci";
import { AiFillHome } from "react-icons/ai";
import { RxReload } from "react-icons/rx";

const ErrorPage = () => {
  const { t } = useTranslation();
  const error = useRouteError();

  return (
    <section className="h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <CiWarning className="text-[120px] text-primary" />

      <h2 className="text-2xl font-bold">{t("ErrorPage.title")}</h2>

      <p className="text-primary font-medium text-lg max-w-md">
        {error?.message || t("ErrorPage.description")}
      </p>

      <div className="flex items-center justify-center flex-wrap gap-3 mt-4">
        <button
          onClick={() => window.location.reload()}
          className="mainBtn flex items-center gap-2 light"
        >
          {t("ErrorPage.reload")}
          <RxReload />
        </button>

        <Link
          to="/tenant-dashboard/monitoring"
          replace
          className="mainBtn flex items-center gap-2"
        >
          {t("ErrorPage.goHome")}
          <AiFillHome />
        </Link>
      </div>
    </section>
  );
};

export default ErrorPage;
