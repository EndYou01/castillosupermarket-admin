import { FormData, IDistribution } from "./interfaces/interfaces";

const Stats = ({
  distribution,
  setShowForm,
  formData,
}: {
  distribution: IDistribution;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
  formData: FormData;
}) => {
  const closeModal = () => {
    setShowForm(false);
  };

  const formatCurrency = (amount: number) => {
    return (
      <p>
        {new Intl.NumberFormat("es-MX", {
          currency: "MXN",
        }).format(amount)}{" "}
        <span className="font-xs font-thin">cup</span>
      </p>
    );
  };

  return (
    <div className="flex flex-col">
      <div className=" py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* ----------------------------- */}

          <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl mb-6">
            Resumen general{" "}
          </h2>
          <dl className="grid grid-cols-4 gap-8 lg:grid-cols-4 items-start justify-start">
            <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
              <dt className="text-base/7 text-amber-100">Venta neta</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                {formatCurrency(+formData.ventaNeta)}
              </dd>
            </div>

            <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
              <dt className="text-base/7 text-amber-100">Ganancia bruta</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                {formatCurrency(+formData.gananciaBruta)}
              </dd>
            </div>

            <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
              <dt className="text-base/7 text-amber-100">Pago trabajadores</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                {formatCurrency(distribution.pagoTrabajadores)}
              </dd>
              <div className="order-first font-thin tracking-tight text-amber-50 sm:text-5xl flex w-full">
                {formatCurrency(distribution.pagoTrabajadores / 2)}{" "}
                <span className="ml-2">C / U</span>
              </div>
            </div>

            <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
              <dt className="text-base/7 text-amber-100">Pago impuestos</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                {formatCurrency(distribution.pagoImpuestos)}
              </dd>
            </div>

            <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
              <dt className="text-base/7 text-orange-400">Ganancia neta</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-orange-400 sm:text-5xl">
                {formatCurrency(distribution.gananciaNeta)}
              </dd>
            </div>
          </dl>

          {/* ----------------------------- */}

          <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl mt-14 mb-6 flex justify-between">
            Administradores <span className="sm:text-md font-thin">40%</span>
          </h2>
          <dl className="grid grid-cols-4 gap-8  lg:grid-cols-4">
            <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
              <dt className="text-base/7 text-amber-100">
                Jose <span className="font-thin">20%</span>
              </dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                {formatCurrency(distribution.administradores.jose)}
              </dd>
            </div>

            <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
              <dt className="text-base/7 text-amber-100">
                Alfonso <span className="font-thin">20%</span>
              </dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                {formatCurrency(distribution.administradores.alfonso)}
              </dd>
            </div>

            <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
              <dt className="text-base/7 text-orange-400">
                Total administradores
              </dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-orange-400 sm:text-5xl">
                {formatCurrency(distribution.administradores.total)}
              </dd>
            </div>
          </dl>

          {/* ----------------------------- */}

          <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl mt-14 mb-6 flex justify-between">
            Inversores <span className="sm:text-md font-thin">55%</span>
          </h2>
          <dl className="grid grid-cols-4 gap-8  lg:grid-cols-4">
            <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
              <dt className="text-base/7 text-amber-100">
                Adalberto <span className="font-thin">28.11%</span>
              </dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                {formatCurrency(distribution.inversores.adalberto)}
              </dd>
            </div>

            <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
              <dt className="text-base/7 text-amber-100">
                Senjudo <span className="font-thin">26.88%</span>
              </dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                {formatCurrency(distribution.inversores.senjudo)}
              </dd>
            </div>

            <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
              <dt className="text-base/7 text-orange-400">Total inversores</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-orange-400 sm:text-5xl">
                {formatCurrency(distribution.inversores.total)}
              </dd>
            </div>
          </dl>

          {/* ----------------------------- */}
          <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl mt-14 mb-6 flex justify-between">
            Reinversion <span className="sm:text-md font-thin">5%</span>
          </h2>
          <dl className="grid grid-cols-4 gap-8  lg:grid-cols-4">
            <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
              <dt className="text-base/7 text-orange-400">Total reinversion</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-orange-400 sm:text-5xl">
                {formatCurrency(distribution.reinversion)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <button
        onClick={closeModal}
        className="fixed bottom-10 right-10 px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500 transition"
      >
        Atrás
      </button>
    </div>
  );
};

export default Stats;
