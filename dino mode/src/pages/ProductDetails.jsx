import { Link, useParams, useNavigate } from "react-router-dom";
import { products } from "../data/products";
import { useShop } from "../context/ShopContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaShoppingCart, FaArrowLeft } from "react-icons/fa";

export default function ProductDetails() {
    const { id } = useParams();
    const { addToCart } = useShop();
    const navigate = useNavigate();
    const product = products.find((item) => item.id === Number(id));

    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColorObj, setSelectedColorObj] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState(null);
    const [added, setAdded] = useState(false);

    // ✅ Initialisation dynamique depuis product.colors
    useEffect(() => {
        if (product?.colors?.length > 0) {
            const firstColor = product.colors[0];
            setSelectedColorObj(firstColor);
            setMainImage(firstColor.image);
            setSelectedSize(null);
            setQuantity(1);
        } else if (product?.image) {
            // Fallback pour ancienne structure
            setMainImage(product.image);
        }
    }, [product]);

    if (!product) {
        return <div className="p-10 text-center text-2xl">Product not found</div>;
    }

    // ✅ Toutes les images uniques pour la galerie
    const allImages = product.colors?.map(c => c.image) || [product.image];
    const uniqueImages = [...new Set(allImages)];

    // ✅ Tailles disponibles pour la couleur sélectionnée
    const availableSizes = selectedColorObj?.sizes?.map(s => s.label) || [];
    
    // ✅ Stock max pour la taille sélectionnée
    const maxQuantity = selectedColorObj?.sizes?.find(s => s.label === selectedSize)?.quantity || 1;

    const handleColorSelect = (colorObj) => {
        setSelectedColorObj(colorObj);
        setMainImage(colorObj.image);
        setSelectedSize(null); // Reset taille quand on change de couleur
        setQuantity(1);
    };

    const handleSizeSelect = (sizeLabel) => {
        setSelectedSize(sizeLabel);
        setQuantity(1); // Reset quantité quand on change de taille
    };

    const handleQuantityChange = (delta) => {
        setQuantity(prev => {
            const newQty = prev + delta;
            if (newQty < 1) return 1;
            if (newQty > maxQuantity) return maxQuantity;
            return newQty;
        });
    };

    const handleAddToCart = () => {
        if (!selectedSize || !selectedColorObj) {
            alert("Please select a size and color");
            return;
        }
        addToCart(product, quantity, selectedSize, selectedColorObj.color);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        navigate("/cart");
    };

    const isOnSale = product.oldPrice && product.oldPrice > product.price;
    const discount = isOnSale
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : 0;

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto bg-pink-50">
            {/* Back button - mobile only */}
            <button
                onClick={() => navigate(-1)}
                className="md:hidden flex items-center gap-2 text-gray-500 mb-4 text-sm"
            >
                <FaArrowLeft /> Back
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10"
            >
                {/* ===== IMAGES ===== */}
                <div className="space-y-3 md:space-y-4">
                    <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-lg md:shadow-xl">
                        <img
                            src={mainImage}
                            className="w-full h-[350px] md:h-[500px] object-cover"
                            alt={product.name}
                        />
                        {isOnSale && (
                            <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-red-500 text-white text-xs md:text-sm font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full">
                                -{discount}%
                            </div>
                        )}
                    </div>
                    {/* ✅ Galerie dynamique depuis toutes les couleurs */}
                    <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1">
                        {uniqueImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setMainImage(img)}
                                className={`w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden border-2 transition flex-shrink-0 ${
                                    mainImage === img ? "border-black" : "border-transparent opacity-60"
                                }`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt="" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* ===== INFO ===== */}
                <div className="flex flex-col justify-center">
                    <p className="text-xs md:text-sm text-gray-400 uppercase tracking-wider mb-1 md:mb-2">
                        {product.category}
                    </p>
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight">
                        {product.name}
                    </h1>

                    {/* Price */}
                    <div className="mt-3 md:mt-5 flex items-baseline gap-2 md:gap-4 flex-wrap">
                        {isOnSale ? (
                            <>
                                <span className="text-xl md:text-3xl font-bold text-pink-500">
                                    {product.price.toLocaleString()} DA
                                </span>
                                <span className="text-sm md:text-lg text-gray-400 line-through">
                                    {product.oldPrice.toLocaleString()} DA
                                </span>
                                <span className="text-xs md:text-sm bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
                                    Save {(product.oldPrice - product.price).toLocaleString()} DA
                                </span>
                            </>
                        ) : (
                            <span className="text-2xl md:text-3xl font-light text-pink-500">
                                {product.price.toLocaleString()} DA
                            </span>
                        )}
                    </div>

                    <p className="mt-4 md:mt-6 text-sm md:text-base text-gray-600 leading-relaxed">
                        Premium women's fashion item designed for elegance and comfort.
                        Crafted with high-quality materials for a luxurious feel.
                    </p>

                    {/* ✅ COLOR - dynamique depuis product.colors */}
                    <div className="mt-6 md:mt-8">
                        <h3 className="text-sm md:text-lg font-bold mb-2 md:mb-3">
                            Color <span className="text-red-500">*</span>
                            {selectedColorObj && (
                                <span className="ml-2 text-gray-400 font-normal text-xs md:text-sm">
                                    — {selectedColorObj.color}
                                </span>
                            )}
                        </h3>
                        <div className="flex gap-2 md:gap-3 flex-wrap">
                            {product.colors?.map((colorObj) => (
                                <button
                                    key={colorObj.color}
                                    onClick={() => handleColorSelect(colorObj)}
                                    className={`px-4 md:px-6 py-2 md:py-2.5 cursor-pointer rounded-lg md:rounded-xl border-2 transition font-medium text-sm md:text-base flex items-center gap-2 ${
                                        selectedColorObj?.color === colorObj.color
                                            ? "bg-pink-500 text-white border-pink-500"
                                            : "border-gray-700 text-gray-700 hover:bg-pink-200"
                                    }`}
                                >
                                    {/* Mini aperçu de la couleur */}
                                    <span 
                                        className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-white/50"
                                        style={{ 
                                            backgroundColor: colorObj.color.toLowerCase() === 'white' 
                                                ? '#f3f4f6' 
                                                : colorObj.color.toLowerCase() 
                                        }}
                                    />
                                    {colorObj.color}
                                </button>
                            )) || (
                                <span className="text-sm text-gray-400">No colors available</span>
                            )}
                        </div>
                    </div>

                    {/* ✅ SIZE - dynamique selon la couleur sélectionnée */}
                    <div className="mt-4 md:mt-6">
                        <h3 className="text-sm md:text-lg font-bold mb-2 md:mb-3">
                            Size <span className="text-red-500">*</span>
                        </h3>
                        <div className="flex gap-2 md:gap-3 flex-wrap">
                            {availableSizes.length > 0 ? (
                                availableSizes.map((size) => {
                                    const sizeData = selectedColorObj.sizes.find(s => s.label === size);
                                    const isOutOfStock = sizeData?.quantity === 0;
                                    return (
                                        <button
                                            key={size}
                                            onClick={() => !isOutOfStock && handleSizeSelect(size)}
                                            disabled={isOutOfStock}
                                            className={`border-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl transition font-medium text-sm md:text-base flex-1 md:flex-none relative ${
                                                selectedSize === size
                                                    ? "bg-pink-500 text-white border-pink-500"
                                                    : isOutOfStock
                                                        ? "border-gray-300 text-gray-300 cursor-not-allowed line-through"
                                                        : "border-gray-700 text-gray-700 hover:bg-pink-200 cursor-pointer"
                                            }`}
                                        >
                                            {size}
                                            {sizeData?.number && (
                                                <span className="block text-[10px] md:text-xs opacity-70 mt-0.5">
                                                    EU {sizeData.number}
                                                </span>
                                            )}
                                            {isOutOfStock && (
                                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                                                    Out
                                                </span>
                                            )}
                                        </button>
                                    );
                                })
                            ) : (
                                <span className="text-sm text-gray-400">Select a color first</span>
                            )}
                        </div>
                    </div>

                    {/* ✅ QUANTITY - limitée par le stock */}
                    <div className="mt-4 md:mt-6">
                        <h3 className="text-sm md:text-lg font-bold mb-2 md:mb-3">
                            Quantity
                            {selectedSize && (
                                <span className="ml-2 text-gray-400 font-normal text-xs md:text-sm">
                                    — {maxQuantity} in stock
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-3 md:gap-4">
                            <button
                                onClick={() => handleQuantityChange(-1)}
                                disabled={quantity <= 1}
                                className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center hover:bg-pink-500 cursor-pointer hover:text-white transition text-sm md:text-base disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                -
                            </button>
                            <span className="text-lg md:text-xl font-bold w-6 md:w-8 text-center">
                                {quantity}
                            </span>
                            <button
                                onClick={() => handleQuantityChange(1)}
                                disabled={quantity >= maxQuantity}
                                className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center hover:bg-pink-500 cursor-pointer hover:text-white transition text-sm md:text-base disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Add to Cart */}
                    <motion.button
                        onClick={handleAddToCart}
                        whileTap={{ scale: 0.97 }}
                        disabled={!selectedSize || !selectedColorObj}
                        className={`mt-6 md:mt-10 w-full cursor-pointer md:w-auto py-3.5 md:py-4 px-6 md:px-12 rounded-full font-medium text-base md:text-lg flex items-center justify-center gap-2 md:gap-3 transition ${
                            added
                                ? "bg-green-500 text-white"
                                : !selectedSize || !selectedColorObj
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-black text-white hover:bg-pink-500"
                        }`}
                    >
                        {added ? (
                            <>✓ Added</>
                        ) : (
                            <>
                                <FaShoppingCart size={16} />
                                Add To Cart — {(product.price * quantity).toLocaleString()} DA
                            </>
                        )}
                    </motion.button>

                    {/* Trust badges - mobile only */}
                    <div className="md:hidden mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
                        <span>✓ Secure</span>
                        <span>✓ Fast Delivery</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}