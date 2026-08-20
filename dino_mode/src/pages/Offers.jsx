import { motion } from "framer-motion";
import ProductCard from "../components/Products/ProductCard";
import { useShop } from "../context/ShopContext";

export default function Offers() {
    const { products, loading } = useShop();

    // ← صحيح: oldPrice لازم يكون number > 0
    const offers = products.filter((product) => Number(product.oldPrice) > 0);

    if (loading) {
        return (
            <div className="p-4 md:p-10 bg-pink-50 min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-lg">Chargement des offres...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-10 bg-pink-50 h-min-screen">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl md:text-6xl font-serif mb-3 md:mb-4">Offres Spéciales</h1>
                <p className="text-gray-500 mb-8 md:mb-12 text-base md:text-lg">
                    Découvrez nos offres exclusives
                </p>
            </motion.div>

            {offers.length === 0 ? (
                <div className="text-center py-20 text-gray-400 text-lg md:text-xl">
                    Aucune offre disponible pour le moment
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