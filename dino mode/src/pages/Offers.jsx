import { motion } from "framer-motion";
import { products } from "../data/products";
import ProductCard from "../components/Products/ProductCard";

export default function Offers() {
    const offers = products.filter((product) => product.oldPrice);

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto bg-pink-50">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl md:text-6xl font-serif mb-3 md:mb-4">Special Offers</h1>
                <p className="text-gray-500 mb-8 md:mb-12 text-base md:text-lg">
                    Discover our exclusive deals
                </p>
            </motion.div>

            {offers.length === 0 ? (
                <div className="text-center py-20 text-gray-400 text-lg md:text-xl">
                    No offers available right now
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
                    {offers.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}