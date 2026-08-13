import { Navigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function AdminRoute({ children }) {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");
    const location = useLocation();

    if (!token) {
        return <Navigate to="/admin" replace state={{ from: location }} />;
    }

    if (role?.toLowerCase() !== "admin") {
        toast.error("Access denied: Admins only");
        return <Navigate to="/admin" replace />;
    }

    return children;
}