import { BrowserRouter } from "react-router-dom";
import AppRoute from "./AppRoute";
import AuthRoute from "./AuthRoute";

export const MainRouter = () => {
  const isAuth = localStorage.getItem("auth") === "true";

  return <BrowserRouter>{isAuth ? <AppRoute /> : <AuthRoute />}</BrowserRouter>;
};
