import { useState } from "react";
import { Input } from "../../components/shadcn/Input";
import { Button } from "../../components/shadcn/Button";
import castilloLogo from "../../assets/castillo_logo.png";

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
    <div className="flex min-h-dvh w-full flex-col items-center bg-[#004226] px-4 pt-24 sm:pt-32">
      <div className="w-full flex justify-center mb-12">
        <img
          src={castilloLogo}
          className="w-2/3 md:w-1/3"
          alt="Castillo Logo"
        />
      </div>

      <div className="w-full max-w-7xl px-3 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl mb-6">
          Iniciar sesión
        </h2>

        <form onSubmit={handleSubmit}>
          <dl className="grid grid-cols-4 gap-8 lg:grid-cols-6 items-start">
            <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
              <dt className="text-base/7 text-amber-100">Usuario</dt>
              <dd className="order-first">
                <Input
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 border-0 border-b border-stone-50/20 rounded-none bg-transparent text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl placeholder:text-amber-50/20 focus-visible:ring-0 focus-visible:border-orange-400 px-0"
                />
              </dd>
            </div>

            <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
              <dt className="text-base/7 text-amber-100">Contraseña</dt>
              <dd className="order-first">
                <Input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-0 border-b border-stone-50/20 rounded-none bg-transparent text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl placeholder:text-amber-50/20 focus-visible:ring-0 focus-visible:border-orange-400 px-0"
                />
              </dd>
            </div>

            <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
              <dt className="text-base/7 text-orange-400">Acceder</dt>
              <dd className="order-first">
                <Button
                  type="submit"
                  className="h-12 w-full bg-amber-500/90 text-3xl font-semibold tracking-tight text-white sm:text-5xl hover:bg-amber-600 transition rounded-none"
                >
                  Entrar
                </Button>
              </dd>
            </div>
          </dl>

          {error && (
            <p className="mt-6 text-base/7 text-red-400 border-l-1 border-red-400 pl-4">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
