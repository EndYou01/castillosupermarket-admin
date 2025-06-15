import { BrowserRouter } from "react-router-dom";
import AppRoute from "./AppRoute";
import AuthRoute from "./AuthRoute";

export const MainRouter = () => {
  //   const {key} = useAppSelector((state) => state.session);
  const key: boolean = true;

  return <BrowserRouter>{key ? <AppRoute /> : <AuthRoute />}</BrowserRouter>;
};
