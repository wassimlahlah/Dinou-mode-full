import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";

export default function Hero() {
    return (
        <section
            className="relative min-h-[100dvh] bg-cover bg-center flex items-center justify-center md:justify-start"
            style={{
                backgroundImage:
                    "url(https://images.unsplash.com/photo-1483985988355-763728e1935b)",
            }}
        >
            {/* Overlay متدرج — أنيق أكثر في الموبايل */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70 md:from-black/50 md:via-black/30 md:to-black/50" />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative text-white px-6 md:px-0 md:ml-20 max-w-2xl text-center md:text-left w-full"
            >
                {/* Label صغير فوق العنوان */}
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="inline-block text-[10px] md:text-xs uppercase tracking-[0.4em] mb-4 md:mb-6 text-[#F7D6DF] font-semibold"
                >
                    Dinou Moda — 2026
                </motion.span>

                {/* العنوان */}
                <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif font-bold leading-[1.05]">
                    <motion.span
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.7 }}
                        className="block"
                    >
                        New
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.7 }}
                        className="block italic text-[#F7D6DF] mt-1"
                    >
                        Collection
                    </motion.span>
                </h1>

                {/* الوصف */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.7 }}
                    className="mt-5 md:mt-6 text-base md:text-2xl font-light text-white/80 max-w-sm mx-auto md:mx-0"
                >
                    Elegance and confidence in every piece
                </motion.p>

                {/* الزر */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                >
                    <Link to="/shop">
                        <button className="mt-8 md:mt-10 bg-[#F7D6DF] text-black/80 px-10 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer">
                            Shop Now
                        </button>
                    </Link>
                </motion.div>
            </motion.div>

            {/* Scroll indicator — يختفي في الموبايل */}
            <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hidden md:flex flex-col items-center gap-1"
            >
                <span className="text-[9px] uppercase tracking-[0.3em]">Scroll</span>
                <FaChevronDown size={14} />
            </motion.div>

            {/* لمسة سفلية وردية في الموبايل */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F7D6DF]/30 to-transparent md:hidden pointer-events-none" />
        </section>
    );
}