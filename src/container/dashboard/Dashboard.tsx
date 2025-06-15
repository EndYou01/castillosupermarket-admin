import castilloLogo from "../../assets/castillo_logo.png";
import Stats from "./Stats";

export default function Dashboard() {
  return (
    <div className="w-full h-full p-8">
      <div className="w-full mx-auto flex justify-center items-center">
        <img
          src={castilloLogo}
          className="w-2/3 md:w-1/3"
          alt="Castillo Logo"
        />
      </div>

      <div className="w-full flex flex-col justify-center items-center py-24 sm:py-32">
        <Stats />
      </div>
    </div>
  );
}
