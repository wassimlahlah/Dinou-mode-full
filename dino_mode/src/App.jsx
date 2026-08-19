// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import CategoryList from "./pages/CategoryList";    // ← /category
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Offers from "./pages/Offers";
import About from "./pages/About";
import Checkout from "./pages/Checkout";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import DashboardProducts from "./pages/DashboardProducts";
import DashboardOrders from "./pages/DashboardOrders";
import DashboardCategories from "./pages/DashboardCategories";
import AdminRoute from "./routes/AdminRoute";
import DashboardLivraison from "./pages/DashboardLivraison";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ← Client Pages */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/category" element={<CategoryList />} />           // ← Grid
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/offers" element={<Offers />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/checkout" element={<Checkout />} />
                </Route>

                {/* ← Admin Pages */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/dashboard" element={<AdminRoute>
                    <Dashboard />
                </AdminRoute>} />
                <Route path="/dashboard/products" element={<AdminRoute>
                    <DashboardProducts />
                </AdminRoute>} />
                <Route path="/dashboard/orders" element={<AdminRoute>
                    <DashboardOrders />
                </AdminRoute>} />
                <Route path="/dashboard/categories" element={<AdminRoute>
                    <DashboardCategories />
                </AdminRoute>} />
                
                <Route path="/dashboard/livraison" element={<AdminRoute>
                    <DashboardLivraison  />
                </AdminRoute>} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;