const LoadingSpin = () => {
  return (
    <div className="mt-20 flex flex-col items-center justify-center text-white text-xl">
      <svg
        className="animate-spin h-10 w-10 text-amber-400 mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      <span>Cargando datos...</span>
    </div>
  );
};

export default LoadingSpin;
