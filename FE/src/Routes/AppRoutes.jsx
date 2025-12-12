import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Root from "../Pages/Root";
import Signup from "../Pages/Signup";
import Login from "../Pages/Login";
import Dashboard from "../Pages/Dashboard";
import Success from "../Pages/Success";
import Cancel from "../Pages/Cancel";
import Upgrade from "../Pages/Upgrade";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "../Pages/NotFound";

const AppRoutes = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Root />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stripe/success" element={<Success />} />
          <Route path="/stripe/cancel" element={<Cancel />} />
          <Route path="/upgrade" element={<Upgrade />} />
        </Route>
        <Route path="*" element={<NotFound/>}/>
      </>
    )
  );
  return <RouterProvider router={router} />;
};

export default AppRoutes;
