import React from "react";
import ReactDOM from "react-dom/client";

import { RouterProvider } from "react-router-dom";

import { router } from "@/app/Router";
import { AppProviders } from "@/app/providers/AppProviders";

import "@/shared/theme/globals.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(

    <React.StrictMode>

        <AppProviders>

            <RouterProvider router={router} />

        </AppProviders>

    </React.StrictMode>

);