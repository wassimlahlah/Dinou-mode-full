import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./App.css";

import { ShopProvider } from "./context/ShopContext";
import { Toaster } from "react-hot-toast";


ReactDOM.createRoot(
    document.getElementById("root")
)
    .render(

        <React.StrictMode>

            <ShopProvider>
                <Toaster
                    position="top-center"
                />

                <App />

            </ShopProvider>

        </React.StrictMode>

    );