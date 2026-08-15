import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function AdminLogin() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            toast.error("Username and password are required");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/signin/", {
                username: username.trim(),
                password: password,
            });

            const data = response.data.data;

            if (!data.role || data.role.toLowerCase() !== "admin") {
                toast.error("This account is not an admin");
                return;
            }

            localStorage.setItem("access_token", data.tokens.access);
            localStorage.setItem("refresh_token", data.tokens.refresh);
            localStorage.setItem("compte_id", data.id);
            localStorage.setItem("username", data.username);
            localStorage.setItem("role", data.role.toLowerCase());

            toast.success("Login successful");
            navigate("/dashboard", { replace: true });

        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.response?.data?.detail ||
                "Login failed";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-pink-50 p-4">
            <motion.form
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                onSubmit={handleLogin}
                className="bg-white shadow-xl rounded-2xl md:rounded-3xl p-6 md:p-10 w-full max-w-md"
            >
                <h1 className="text-3xl md:text-4xl font-serif text-center mb-2">
                    Dinou<span className="text-pink-500">Moda</span>
                </h1>
                <p className="text-center text-gray-400 text-xs md:text-sm uppercase tracking-[0.3em] mb-6 md:mb-8">
                    Panneau d'administration
                </p>

                <div className="space-y-3 md:space-y-4">
                    <input
                        type="text"
                        placeholder="Nom d'utilisateur"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        className="w-full border border-gray-200 p-3.5 md:p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] focus:border-pink-300 transition"
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className="w-full border border-gray-200 p-3.5 md:p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] focus:border-pink-300 transition"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white cursor-pointer py-3.5 md:py-4 rounded-full hover:bg-pink-500 transition font-medium mt-6 md:mt-8 disabled:opacity-50"
                >
                    {loading ? "Chargement..." : "Connexion"}
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">
                    © 2026 Dinou Moda
                </p>
            </motion.form>
        </div>
    );
}