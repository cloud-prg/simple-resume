import React from "react";
import BasicLayout from "@/layout";
import { RouteObject, createBrowserRouter, createHashRouter } from 'react-router-dom';
import Home from "@/pages/Home";
import Resume from "@/pages/ResumePage";
import NoMatch from "@/pages/404";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <BasicLayout />,
    children: [
      // { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      {
        // path: "/resume",
        index: true,
        element: <Resume />,
      },
      { path: "*", element: <NoMatch /> },
    ],
  },
];

// createHashRouter
const router = createHashRouter(routes)

export default router;