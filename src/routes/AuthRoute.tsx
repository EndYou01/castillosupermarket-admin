import { Route, Routes } from "react-router-dom";


const AuthRoute = () => {
  return (
    <Routes>
      <Route path="*" element={<></>} />
    </Routes>
  )
}

export default AuthRoute
