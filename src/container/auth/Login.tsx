import { useState } from "react";
import { Input } from "../../components/shadcn/Input";
import { Button } from "../../components/shadcn/Button";
import castilloLogo from "../../assets/castillo_logo.png";
import castilloImagetipo from "../../assets/castillo_imagotipo.png";

const CREDENTIALS = {
  username: "castillo2024",
  password: "castillo2024",
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      username === CREDENTIALS.username &&
      password === CREDENTIALS.password
    ) {
      localStorage.setItem("auth", "true");
      window.location.reload();
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#004226] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-4">
          <img src={castilloImagetipo} alt="Castillo" className="h-20 w-20" />
          <img src={castilloLogo} alt="Castillo Supermarket" className="h-10" />
          <p className="text-sm text-amber-100/60">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-amber-100/80">
              Usuario
            </label>
            <Input
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-11 border-white/10 bg-white/5 text-amber-50 placeholder:text-amber-100/30 focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-amber-100/80">
              Contraseña
            </label>
            <Input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 border-white/10 bg-white/5 text-amber-50 placeholder:text-amber-100/30 focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-400">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="mt-1 h-11 bg-amber-500 text-sm font-semibold text-stone-900 hover:bg-amber-400 transition-colors"
          >
            Iniciar sesión
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
