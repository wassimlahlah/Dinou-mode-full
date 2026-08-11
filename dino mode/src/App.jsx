import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import DashboardProducts from "./pages/DashboardProducts";
import DashboardOrders from "./pages/DashboardOrders";
import About from "./pages/About";
import Categories from "./components/Sections/Categories";
import Offers from "./pages/Offers";
import Checkout from "./pages/Checkout";
import DashboardCategories from "./pages/DashboardCategories";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route path="/checkout" element={<Checkout />} />
        </Route>

        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/products" element={<DashboardProducts />} />
        <Route path="/dashboard/orders" element={<DashboardOrders />} />
        <Route path="/dashboard/categories" element={<DashboardCategories />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;