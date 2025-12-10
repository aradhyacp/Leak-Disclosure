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

const AppRoutes = () => {
    const router = createBrowserRouter(createRoutesFromElements(
        <>
        <Route path="/" element={<Root/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/stripe/success" element={<Success/>}/>
        <Route path="/stripe/cancel" element={<Cancel/>}/>        
        <Route path="/upgrade" element={<Upgrade/>}/>        

        </>
    ));
    return <RouterProvider router={router}/>
};

export default AppRoutes;
