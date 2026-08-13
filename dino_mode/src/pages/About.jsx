import { motion } from "framer-motion";

export default function About() {
    return (
        <div className="p-4 md:p-10 bg-pink-50 min-h-screen flex flex-col justify-center">
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto text-center"
            >
                <h1 className="text-4xl md:text-6xl font-serif mb-6 md:mb-8">
                    About Dinou Moda
                </h1>

                <p className="text-gray-600 text-base md:text-lg leading-7 md:leading-8 max-w-2xl mx-auto px-2 md:px-0">
                    Dinou Moda is a luxury women's fashion brand
                    created to bring elegance, confidence, and modern style
                    to every woman.
                    <br className="hidden md:block" />
                    Our collections combine timeless designs,
                    quality fabrics, and contemporary fashion.
                </p>

                <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-pink-100 p-6 md:p-8 rounded-2xl md:rounded-3xl"
                    >
                        <h2 className="text-xl md:text-2xl font-bold">Elegance</h2>
                        <p className="mt-2 md:mt-3 text-sm md:text-base text-gray-500">
                            Modern feminine style
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-pink-100 p-6 md:p-8 rounded-2xl md:rounded-3xl"
                    >
                        <h2 className="text-xl md:text-2xl font-bold">Quality</h2>
                        <p className="mt-2 md:mt-3 text-sm md:text-base text-gray-500">
                            Selected materials
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-pink-100 p-6 md:p-8 rounded-2xl md:rounded-3xl"
                    >
                        <h2 className="text-xl md:text-2xl font-bold">Luxury</h2>
                        <p className="mt-2 md:mt-3 text-sm md:text-base text-gray-500">
                            Premium experience
                        </p>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
}