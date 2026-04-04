import { useState } from "react";
import { Input } from "../../components/shadcn/Input";
import { Button } from "../../components/shadcn/Button";

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
    <div className="flex min-h-screen items-center justify-center bg-[#004226]">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-stone-700 bg-stone-900 p-8"
      >
        <h1 className="text-2xl font-semibold text-amber-50 text-center">
          Castillo Supermarket
        </h1>

        <Input
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="text-amber-50"
        />

        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="text-amber-50"
        />

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <Button
          type="submit"
          className="bg-amber-500/90 text-white hover:bg-amber-600 transition"
        >
          Iniciar sesión
        </Button>
      </form>
    </div>
  );
};

export default Login;
