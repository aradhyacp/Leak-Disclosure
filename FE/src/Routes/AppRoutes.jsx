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

const AppRoutes = () => {
    const router = createBrowserRouter(createRoutesFromElements(
        <>
        <Route path="/" element={<Root/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        </>
    ));
    return <RouterProvider router={router}/>
};

export default AppRoutes;
