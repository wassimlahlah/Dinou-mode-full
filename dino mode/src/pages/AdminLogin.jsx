import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
    const navigate = useNavigate();

    function handleLogin(e) {
        e.preventDefault();
        navigate("/dashboard");
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
                    Admin Panel
                </p>

                <div className="space-y-3 md:space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full border border-gray-200 p-3.5 md:p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] focus:border-pink-300 transition text-sm md:text-base"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full border border-gray-200 p-3.5 md:p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] focus:border-pink-300 transition text-sm md:text-base"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-black text-white cursor-pointer py-3.5 md:py-4 rounded-full hover:bg-pink-500 transition font-medium mt-6 md:mt-8 text-sm md:text-base active:scale-[0.98]"
                >
                    Login
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">
                    © 2026 Dinou Moda
                </p>
            </motion.form>
        </div>
    );
}