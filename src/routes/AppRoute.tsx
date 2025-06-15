import { Route, Routes } from "react-router-dom";
import { INavigationRoute } from "../interfaces/interfaces";
import { NavigationRoutes } from "../static/NavigationRoutes";
import { Suspense } from "react";
import Sidebar from "../components/layout/SideBar";
import Dashboard from "../container/dashboard/Dashboard";
// import { FaztLoading } from "fazt-web-module";
// import PageNotFound from "../pages/PageNotFound";

const AppRoute = () => {

  return (
    <Routes>
      <Route path="/" element={<Sidebar />}>
        <Route index element={<Dashboard />} />

        {extractAllItems(NavigationRoutes).map((route, key) => (
          <>
            <Route
              key={key}
              path={route.url}
              element={
                <Suspense fallback={<>loading</>}>{route.element}</Suspense>
                // <Suspense fallback={<FaztLoading />}>{route.element}</Suspense>
              }
            />

            {route.items !== undefined &&
              route.items.length > 0 &&
              route.items.map((itemRoute, key2) => (
                <Route
                  key={key + key2}
                  path={itemRoute.url}
                  element={
                    <Suspense fallback={<>loading</>}>
                    {/* <Suspense fallback={<FaztLoading />}> */}
                      {itemRoute.element}
                    </Suspense>
                  }
                />
              ))}
          </>
        ))}
      </Route>

      <Route path="*" element={<>page not found</>} />
      {/* <Route path="*" element={<PageNotFound />} /> */}
    </Routes>
  );
  //   }
};

export default AppRoute;

// Función para extraer todos los `items`
function extractAllItems(routes: INavigationRoute[]) {
  return routes.flatMap((route) => route.items || []);
}
