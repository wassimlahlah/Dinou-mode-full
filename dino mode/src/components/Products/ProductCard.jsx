// ============ ProductCard.jsx ============
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
    const discount = product.oldPrice
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : 0;

    // ✅ Image principale depuis colors[0] ou fallback product.image
    const mainImage = product.colors?.[0]?.image || product.image;
    
    // ✅ Liste des couleurs disponibles (sans doublons)
    const availableColors = product.colors?.map(c => c.color) || [];
    
    // ✅ Nombre total de tailles disponibles (toutes couleurs confondues)
    const totalSizes = product.colors?.reduce((acc, c) => acc + (c.sizes?.length || 0), 0) || 0;

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group cursor-pointer"
        >
            <Link to={`/product/${product.id}`} className="block">
                
                {/* الصورة */}
                <div className="relative aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden bg-gray-100 mb-2 md:mb-4">
                    <img
                        src={mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                    />
                    
                    {/* Overlay خفيف على hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />

                    {/* Badge الخصم */}
                    {product.oldPrice && (
                        <span className="absolute top-2 md:top-4 left-2 md:left-4 bg-red-500 text-white text-[9px] md:text-[11px] font-bold tracking-wider px-2 md:px-3 py-1 md:py-1.5 rounded-full uppercase">
                            {discount}% Off
                        </span>
                    )}

                    {/* ✅ Badge nombre de couleurs (nouveau, discret) */}
                    {availableColors.length > 1 && (
                        <span className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[9px] md:text-[10px] font-semibold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full">
                            {availableColors.length} colors
                        </span>
                    )}
                </div>

                {/* المعلومات */}
                <div className="space-y-0.5 md:space-y-1.5 px-0.5 md:px-1">
                    <h3 className="text-[13px] md:text-[15px] font-medium text-gray-900 leading-snug group-hover:text-gray-600 transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 md:gap-2.5 flex-wrap">
                        <span className="text-sm md:text-base font-semibold text-pink-500">
                            {product.price.toLocaleString()} DA
                        </span>
                        
                        {product.oldPrice && (
                            <span className="text-[11px] md:text-sm text-gray-400 line-through">
                                {product.oldPrice.toLocaleString()} DA
                            </span>
                        )}
                    </div>

                    {/* ✅ Dots des couleurs disponibles (nouveau, discret) */}
                    {availableColors.length > 0 && (
                        <div className="flex items-center gap-1 pt-0.5">
                            {availableColors.slice(0, 4).map((color, i) => (
                                <span
                                    key={i}
                                    className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border border-gray-200"
                                    style={{ backgroundColor: color.toLowerCase() === 'white' ? '#f3f4f6' : color.toLowerCase() }}
                                    title={color}
                                />
                            ))}
                            {availableColors.length > 4 && (
                                <span className="text-[9px] md:text-[10px] text-gray-400 ml-0.5">
                                    +{availableColors.length - 4}
                                </span>
                            )}
                        </div>
                    )}
                </div>

            </Link>
        </motion.div>
    );
}