import Hero from "../components/Hero/Hero";
import Footer from "../components/Sections/Footer";
import Offers from "./Offers";
import CategoryList from "./CategoryList";
import { useShop } from "../context/ShopContext";
import { motion } from "framer-motion";
import ProductCard from "../components/Products/ProductCard";

export default function Home() {
    const { products, loading } = useShop();

    const offers = products.filter((product) => Number(product.oldPrice) > 0);
    const hasOffers = offers.length > 0;
    const hasProducts = products.length > 0;

    if (loading) {
        return (
            <>
                <Hero />
                <div className="p-4 md:p-10 max-w-7xl mx-auto bg-pink-50 min-h-[50vh] flex items-center justify-center">
                    <p className="text-gray-500 text-lg">Chargement...</p>
                </div>
                <CategoryList />
                <Footer />
            </>
        );
    }

    return (
        <>
            <Hero />

            {hasOffers ? (
                <Offers />
            ) : hasProducts ? (
                <div className="p-4 md:p-10 max-w-7xl mx-auto bg-pink-50">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-serif mb-3 md:mb-4">
                            Nos Produits
                        </h1>
                        <p className="text-gray-500 mb-8 md:mb-12 text-base md:text-lg">
                            Découvrez notre sélection de produits
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
                        {products
                            .slice(0, 10) // ← هنا: غير 10 كارت
                            .map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                    </div>
                </div>
            ) : (
                <div className="p-4 md:p-10 max-w-7xl mx-auto bg-pink-50 min-h-[50vh] flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-400 text-lg md:text-xl mb-2">
                            Aucun produit disponible pour le moment
                        </p>
                        <p className="text-gray-300 text-sm">
                            Revenez plus tard, de nouveaux articles arrivent bientôt !
                        </p>
                    </div>
                </div>
            )}

            <CategoryList />
            <Footer />
        </>
    );
}