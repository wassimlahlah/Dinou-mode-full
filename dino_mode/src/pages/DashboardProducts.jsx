import { useState, useEffect, useRef } from "react";
import DashboardSidebar from "../components/Dashboard/DashboardSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaPalette, FaBox, FaUpload, FaExclamationTriangle } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useShop } from "../context/ShopContext";

const AVAILABLE_COLORS = [
    { name: "RED", hex: "#EF4444" }, { name: "BLUE", hex: "#3B82F6" },
    { name: "GREEN", hex: "#22C55E" }, { name: "BLACK", hex: "#000000" },
    { name: "WHITE", hex: "#F3F4F6" }, { name: "YELLOW", hex: "#EAB308" },
    { name: "PINK", hex: "#EC4899" }, { name: "PURPLE", hex: "#A855F7" },
    { name: "ORANGE", hex: "#F97316" }, { name: "GRAY", hex: "#6B7280" },
    { name: "BROWN", hex: "#92400E" }, { name: "BEIGE", hex: "#D4C5B0" },
    { name: "NAVY", hex: "#1E3A5F" }, { name: "BURGUNDY", hex: "#800020" },
    { name: "TEAL", hex: "#008080" }, { name: "CREAM", hex: "#FFFDD0" },
    { name: "GOLD", hex: "#FFD700" }, { name: "SILVER", hex: "#C0C0C0" },
    { name: "KHAKI", hex: "#F0E68C" }, { name: "OLIVE", hex: "#808000" },
];

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"];

// ← Backend ProductSerializer returns: id, name, price, oldPrice, productsInfo
// ← NO "category" field! So we need to handle this.
const adaptProduct = (p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    oldPrice: p.oldPrice,
    // ← Backend does NOT return category in ProductSerializer
    // We can't get category from GET, so we'll store it as null/undefined
    category: p.category ?? null,
    categoryName: p.category_name ?? "",
    colors: p.productsInfo?.map((info) => ({
        id: info.id,
        color: info.color,
        image: info.image || "",
        sizes: info.sizesQte?.map((sq) => ({
            id: sq.id,
            label: sq.size,
            number: sq.eqSize ?? null,
            quantity: sq.qte,
        })) || [],
    })) || [],
});

export default function DashboardProducts() {
    const { categories } = useShop();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: "",
        price: "",
        oldPrice: "",
        category: "",
        colors: [],
    });

    const [showColorModal, setShowColorModal] = useState(false);
    const [editingColorIndex, setEditingColorIndex] = useState(null);
    const [colorForm, setColorForm] = useState({
        color: "",
        image: "",
        imageFile: null,
        sizes: [],
    });

    const [showSizeModal, setShowSizeModal] = useState(false);
    const [editingSizeIndex, setEditingSizeIndex] = useState(null);
    const [sizeForm, setSizeForm] = useState({
        label: "",
        number: "",
        quantity: "",
    });

    const [pendingOperations, setPendingOperations] = useState([]);

    const colorFileRef = useRef(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const prodRes = await api.get("/products_method/0/0/");
            if (prodRes.data?.status === "success") {
                const prods = (prodRes.data.data || []).map(adaptProduct);
                setProducts(prods);
            } else {
                throw new Error(prodRes.data?.message || "Invalid response");
            }
        } catch (err) {
            console.error("Fetch products error:", err);
            setError(err.message || "Failed to load products");
            toast.error(err.response?.data?.message || "Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const filtered = products.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => {
        setEditing(null);
        setPendingOperations([]);
        setIsSubmitting(false);
        const firstCatId = categories[0]?.id?.toString() || "";
        setForm({
            name: "",
            price: "",
            oldPrice: "",
            category: firstCatId,
            colors: [],
        });
        setShowModal(true);
    };

    const openEdit = (product) => {
        setEditing(product);
        setPendingOperations([]);
        setIsSubmitting(false);

        // ← Backend ProductSerializer does NOT return "category"
        // So product.category will be null/undefined
        // We default to first category since we can't know the real one
        let catId = product.category;

        if (!catId) {
            catId = categories[0]?.id?.toString() || "";
        } else {
            catId = catId.toString();
        }

        setForm({
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice || "",
            category: catId,
            colors: product.colors || [],
        });
        setShowModal(true);
    };

    const openDeleteModal = (product) => {
        setDeleteTarget(product);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            // ← FIX: Use products_method (not category_method!)
            await api.delete(`/products_method/0/${deleteTarget.id}/`);
            toast.success("Product deleted");
            fetchProducts();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to delete product");
        } finally {
            setShowDeleteModal(false);
            setDeleteTarget(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteTarget(null);
    };

    // ========== SAVE PRODUCT ==========
    const handleSave = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        const cleanNumber = (val) => {
            if (!val) return 0;
            return parseFloat(val.toString().replace(/\s/g, "").replace(",", ".")) || 0;
        };

        const priceNum = cleanNumber(form.price);
        const oldPriceNum = cleanNumber(form.oldPrice);
        const categoryNum = form.category ? Number(form.category) : null;

        if (!form.name || priceNum <= 0 || !form.category || form.category === "") {
            toast.error("Please fill name, price and select a category");
            return;
        }

        if (form.colors.length === 0) {
            toast.error("Please add at least one color");
            return;
        }

        setIsSubmitting(true);

        try {
            if (editing) {
                // ← PUT: Update product basic info
                // Backend uses ProductSerializerUpdate with partial=True
                // Fields: name, price, oldPrice, category
                const payload = {
                    name: form.name,
                    price: priceNum,
                    oldPrice: oldPriceNum || 0,
                    category: categoryNum,
                };

                await api.put(`/products_method/0/${editing.id}/`, payload);

                // Execute pending color/size operations
                for (const op of pendingOperations) {
                    await executePendingOperation(op, editing.id);
                }

                toast.success("Product updated");
            } else {
                // ← POST: Create new product
                // Backend ProductSerializerPush expects:
                // { name, price, oldPrice, category, productsInfo: [{color, image, sizesQte: [{size, qte}]}] }
                // Note: "image" is read_only - images uploaded separately via FILES
                const formData = new FormData();

                const productsInfo = form.colors.map((c) => ({
                    color: c.color,
                    sizesQte: c.sizes.map((s) => ({
                        size: s.label,
                        qte: s.quantity,
                    })),
                }));

                const jsonPayload = {
                    name: form.name,
                    price: priceNum,
                    oldPrice: oldPriceNum || 0,
                    category: categoryNum,
                    productsInfo: productsInfo,
                };

                formData.append("json", JSON.stringify(jsonPayload));

                // Upload images separately - key = color name
                form.colors.forEach((c) => {
                    if (c.imageFile) {
                        formData.append(c.color, c.imageFile);
                    }
                });

                // URL: /products_method/<category_id>/<product_id>/
                // For POST: category_id = actual category, product_id = 0
                await api.post(`/products_method/${categoryNum}/0/`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                toast.success("Product added");
            }
            setShowModal(false);
            setPendingOperations([]);
            fetchProducts();
        } catch (err) {
            console.error("Save error:", err);
            console.error("Response data:", err.response?.data);
            const msg = err.response?.data?.message 
                || err.response?.data?.error 
                || (err.response?.data && JSON.stringify(err.response.data))
                || "Something went wrong";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const executePendingOperation = async (op, productId) => {
        try {
            if (op.type === "add_color") {
                // POST /update_coor_image/0/0/<product_id>/
                const formData = new FormData();
                const jsonPayload = {
                    info: [{
                        color: op.data.color,
                        sizesQte: op.data.sizes.map((s) => ({
                            size: s.label,
                            qte: s.quantity,
                        })),
                    }],
                };
                formData.append("json", JSON.stringify(jsonPayload));
                if (op.data.imageFile) {
                    formData.append(op.data.color, op.data.imageFile);
                }
                await api.post(`/update_coor_image/0/0/${productId}/`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

            } else if (op.type === "edit_color") {
                // PUT /update_coor_image/<productColorImage_id>/<new_color>/0/
                const formData = new FormData();
                if (op.data.imageFile) {
                    formData.append("image", op.data.imageFile);
                }
                await api.put(`/update_coor_image/${op.data.id}/${op.data.color}/0/`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

            } else if (op.type === "delete_color") {
                // DELETE /update_coor_image/<productColorImage_id>/0/0/
                await api.delete(`/update_coor_image/${op.data.id}/0/0/`);

            } else if (op.type === "add_size") {
                // POST /update_qte/0/<productColor_id>/
                const payload = {
                    info: op.data.sizes.map((s) => ({
                        size: s.label,
                        qte: s.quantity,
                    })),
                };
                await api.post(`/update_qte/0/${op.data.colorId}/`, payload);

            } else if (op.type === "edit_size") {
                // PUT /update_qte/<product_size_id>/<productColor_id>/
                const payload = {
                    size: op.data.label,
                    qte: op.data.quantity,
                };
                await api.put(`/update_qte/${op.data.id}/${op.data.colorId}/`, payload);

            } else if (op.type === "delete_size") {
                // DELETE /update_qte/<product_size_id>/<productColor_id>/
                await api.delete(`/update_qte/${op.data.id}/${op.data.colorId}/`);
            }
        } catch (err) {
            console.error(`Operation ${op.type} failed:`, err);
            toast.error(`Failed to ${op.type.replace("_", " ")}`);
            throw err;
        }
    };

    // ========== COLOR MANAGEMENT ==========
    const openAddColor = () => {
        setEditingColorIndex(null);
        setColorForm({ color: "", image: "", imageFile: null, sizes: [] });
        setShowColorModal(true);
    };

    const openEditColor = (index) => {
        setEditingColorIndex(index);
        const c = form.colors[index];
        setColorForm({
            color: c.color,
            image: c.image,
            imageFile: null,
            sizes: c.sizes || [],
        });
        setShowColorModal(true);
    };

    const saveColor = () => {
        if (!colorForm.color) {
            toast.error("Color name is required");
            return;
        }
        if (!colorForm.image && !colorForm.imageFile) {
            toast.error("Color image is required");
            return;
        }
        if (colorForm.sizes.length === 0) {
            toast.error("Please add at least one size");
            return;
        }

        const existingId = editingColorIndex !== null
            ? form.colors[editingColorIndex]?.id
            : null;

        const newColor = {
            ...(existingId ? { id: existingId } : {}),
            color: colorForm.color,
            image: colorForm.image,
            imageFile: colorForm.imageFile,
            sizes: colorForm.sizes,
        };

        if (editing) {
            if (editingColorIndex !== null) {
                const originalColor = form.colors[editingColorIndex];
                const ops = [];

                if (originalColor.color !== colorForm.color || colorForm.imageFile) {
                    ops.push({
                        type: "edit_color",
                        data: {
                            id: originalColor.id,
                            color: colorForm.color,
                            imageFile: colorForm.imageFile,
                        },
                    });
                }

                const originalSizes = originalColor.sizes || [];
                const newSizes = colorForm.sizes;

                originalSizes.forEach((origSize) => {
                    if (!newSizes.find((s) => s.id === origSize.id)) {
                        ops.push({
                            type: "delete_size",
                            data: {
                                id: origSize.id,
                                colorId: originalColor.id,
                            },
                        });
                    }
                });

                newSizes.forEach((newSize) => {
                    const origSize = originalSizes.find((s) => s.id === newSize.id);
                    if (!origSize) {
                        ops.push({
                            type: "add_size",
                            data: {
                                colorId: originalColor.id,
                                sizes: [newSize],
                            },
                        });
                    } else if (
                        origSize.label !== newSize.label ||
                        origSize.quantity !== newSize.quantity
                    ) {
                        ops.push({
                            type: "edit_size",
                            data: {
                                id: origSize.id,
                                colorId: originalColor.id,
                                label: newSize.label,
                                quantity: newSize.quantity,
                            },
                        });
                    }
                });

                setPendingOperations((prev) => [...prev, ...ops]);

                const updated = [...form.colors];
                updated[editingColorIndex] = newColor;
                setForm({ ...form, colors: updated });
            } else {
                setPendingOperations((prev) => [
                    ...prev,
                    { type: "add_color", data: newColor },
                ]);
                setForm({ ...form, colors: [...form.colors, newColor] });
            }
        } else {
            if (editingColorIndex !== null) {
                const updated = [...form.colors];
                updated[editingColorIndex] = newColor;
                setForm({ ...form, colors: updated });
            } else {
                setForm({ ...form, colors: [...form.colors, newColor] });
            }
        }

        setShowColorModal(false);
    };

    const deleteColor = (index) => {
        const colorToDelete = form.colors[index];

        if (editing && colorToDelete.id) {
            setPendingOperations((prev) => [
                ...prev,
                { type: "delete_color", data: { id: colorToDelete.id } },
            ]);
        }

        setForm({ ...form, colors: form.colors.filter((_, i) => i !== index) });
    };

    const handleColorImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            e.target.value = "";
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image too large (max 5MB)");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setColorForm((prev) => ({
                ...prev,
                image: reader.result,
                imageFile: file,
            }));
        };
        reader.onerror = () => {
            toast.error("Failed to read image");
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    // ========== SIZE MANAGEMENT ==========
    const openAddSize = () => {
        setEditingSizeIndex(null);
        setSizeForm({ label: "", number: "", quantity: "" });
        setShowSizeModal(true);
    };

    const openEditSize = (index) => {
        setEditingSizeIndex(index);
        const s = colorForm.sizes[index];
        setSizeForm({
            label: s.label,
            number: s.number?.toString() || "",
            quantity: s.quantity.toString(),
        });
        setShowSizeModal(true);
    };

    const saveSize = () => {
        if (!sizeForm.label || sizeForm.quantity === "") {
            toast.error("Please fill all size fields");
            return;
        }

        const existingId = editingSizeIndex !== null
            ? colorForm.sizes[editingSizeIndex]?.id
            : null;

        const newSize = {
            ...(existingId ? { id: existingId } : {}),
            label: sizeForm.label,
            number: sizeForm.number ? Number(sizeForm.number) : null,
            quantity: Number(sizeForm.quantity),
        };

        if (editingSizeIndex !== null) {
            const updated = [...colorForm.sizes];
            updated[editingSizeIndex] = newSize;
            setColorForm({ ...colorForm, sizes: updated });
        } else {
            setColorForm({ ...colorForm, sizes: [...colorForm.sizes, newSize] });
        }
        setShowSizeModal(false);
    };

    const deleteSize = (index) => {
        setColorForm({ ...colorForm, sizes: colorForm.sizes.filter((_, i) => i !== index) });
    };

    // ========== HELPERS ==========
    const getTotalStock = (product) => {
        return product.colors?.reduce((total, color) => {
            return total + (color.sizes?.reduce((t, s) => t + (s.quantity || 0), 0) || 0);
        }, 0) || 0;
    };

    const getCategoryName = (catId) => {
        const cat = categories.find((c) => c.id === Number(catId) || c.id === catId);
        return cat?.name || catId || "No Category";
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-pink-50 mt-2">
                <DashboardSidebar />
                <main className="flex-1 p-10 flex items-center justify-center">
                    <p className="text-gray-500 text-lg">Chargement...</p>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-pink-50 mt-2">
                <DashboardSidebar />
                <main className="flex-1 p-10 flex items-center justify-center">
                    <div className="text-center">
                        <FaExclamationTriangle className="text-red-400 text-5xl mx-auto mb-4" />
                        <p className="text-gray-600 text-lg mb-4">{error}</p>
                        <button
                            onClick={fetchProducts}
                            className="bg-black text-white px-6 py-3 rounded-full hover:bg-pink-500 transition"
                        >
                            Réessayer
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-pink-50 mt-2">
            <DashboardSidebar />
            <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-x-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-4xl font-serif">Produits</h1>
                    <button
                        onClick={openAdd}
                        className="bg-black text-white mt-2 cursor-pointer px-5 md:px-6 py-2.5 md:py-3 rounded-full flex items-center gap-2 hover:bg-pink-200 hover:text-black transition text-sm md:text-base w-full sm:w-auto justify-center"
                    >
                        <FaPlus size={14} /> Ajouter un produit
                    </button>
                </div>

                <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm p-4 md:p-6">
                    <div className="relative mb-4 md:mb-6">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            placeholder="Rechercher des produits..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border p-3 md:p-4 pl-11 md:pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm md:text-base"
                        />
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-400 text-sm border-b">
                                    <th className="pb-3">Produit</th>
                                    <th className="pb-3">Catégorie</th>
                                    <th className="pb-3">Couleurs</th>
                                    <th className="pb-3">Stock</th>
                                    <th className="pb-3">Prix</th>
                                    <th className="pb-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((product) => (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="border-b last:border-0 hover:bg-gray-50 transition"
                                    >
                                        <td className="py-4">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={product.colors?.[0]?.image || "/placeholder.png"}
                                                    className="w-12 h-12 rounded-xl object-cover"
                                                    alt={product.name}
                                                    onError={(e) => { e.target.src = "/placeholder.png"; }}
                                                />
                                                <div>
                                                    <p className="font-medium text-sm">{product.name}</p>
                                                    <p className="text-xs text-gray-400">ID: {product.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="px-2 py-1 bg-pink-50 rounded-full text-xs text-gray-600">
                                                {getCategoryName(product.category)}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex gap-1.5 flex-wrap">
                                                {product.colors?.map((c, i) => (
                                                    <div key={i} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                                                        <img
                                                            src={c.image || "/placeholder.png"}
                                                            className="w-5 h-5 rounded-full object-cover border"
                                                            alt={c.color}
                                                            onError={(e) => { e.target.src = "/placeholder.png"; }}
                                                        />
                                                        <span className="text-xs text-gray-600">{c.color}</span>
                                                        <span className="text-[10px] text-gray-400">({c.sizes?.length || 0}s)</span>
                                                    </div>
                                                )) || <span className="text-xs text-gray-400">Pas de couleurs</span>}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getTotalStock(product) > 10
                                                ? "bg-green-50 text-green-600"
                                                : getTotalStock(product) > 0
                                                    ? "bg-yellow-50 text-yellow-600"
                                                    : "bg-red-50 text-red-600"
                                                }`}>
                                                <FaBox className="inline mr-1" size={10} />
                                                {getTotalStock(product)}
                                            </span>
                                        </td>
                                        <td className="py-4 font-bold">{product.price?.toLocaleString()} DA</td>
                                        <td className="py-4 text-right">
                                            <button onClick={() => openEdit(product)} className="p-2 text-blue-500 cursor-pointer hover:bg-blue-50 rounded-lg transition mr-1">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => openDeleteModal(product)} className="p-2 text-red-500 cursor-pointer hover:bg-red-50 rounded-lg transition">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                        {filtered.map((product) => (
                            <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={product.colors?.[0]?.image || "/placeholder.png"}
                                        className="w-14 h-14 rounded-xl object-cover"
                                        alt={product.name}
                                        onError={(e) => { e.target.src = "/placeholder.png"; }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-sm truncate">{product.name}</h3>
                                        <span className="px-2 py-0.5 bg-pink-50 rounded-full text-xs text-gray-600 inline-block mt-1">{getCategoryName(product.category)}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-sm block">{product.price?.toLocaleString()} DA</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getTotalStock(product) > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                                            Stock: {getTotalStock(product)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1.5 flex-wrap">
                                    {product.colors?.map((c, i) => (
                                        <div key={i} className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border">
                                            <img
                                                src={c.image || "/placeholder.png"}
                                                className="w-5 h-5 rounded-full object-cover"
                                                alt={c.color}
                                                onError={(e) => { e.target.src = "/placeholder.png"; }}
                                            />
                                            <span className="text-xs text-gray-600">{c.color}</span>
                                            <span className="text-[10px] text-gray-400">{c.sizes?.map(s => `${s.label}(${s.quantity})`).join(", ")}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button onClick={() => openEdit(product)} className="flex-1 py-2.5 text-blue-500 cursor-pointer bg-blue-50 rounded-xl text-sm font-medium flex items-center justify-center gap-1"><FaEdit size={12} /> Modifier</button>
                                    <button onClick={() => openDeleteModal(product)} className="flex-1 py-2.5 text-red-500 cursor-pointer bg-red-50 rounded-xl text-sm font-medium flex items-center justify-center gap-1"><FaTrash size={12} /> Supprimer</button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            {/* ========== DELETE CONFIRMATION MODAL ========== */}
            <AnimatePresence>
                {showDeleteModal && deleteTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
                        onClick={cancelDelete}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm text-center shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaExclamationTriangle className="text-red-500 text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Supprimer le produit?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Êtes-vous sûr de vouloir supprimer <span className="font-semibold text-gray-700">"{deleteTarget.name}"</span>? Cette action ne peut être annulée.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={cancelDelete} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition cursor-pointer">Annuler </button>
                                <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition cursor-pointer shadow-lg shadow-red-200">Supprimer</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========== MAIN PRODUCT MODAL ========== */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowModal(false)}>
                        <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-5 sm:mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold">{editing ? "Edit Product" : "Add Product"}</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 cursor-pointer rounded-full"><FaTimes /></button>
                            </div>
                            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden" />

                            <form onSubmit={handleSave} className="space-y-3 sm:space-y-4">
                                <input placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border p-3.5 sm:p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm sm:text-base" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" placeholder="Price (DA)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border p-3.5 sm:p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm sm:text-base" />
                                    <input type="number" placeholder="Old Price (optional)" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} className="w-full border p-3.5 sm:p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm sm:text-base" />
                                </div>

                                <select 
                                    value={form.category} 
                                    onChange={(e) => setForm({ ...form, category: e.target.value })} 
                                    className="w-full border p-3.5 sm:p-4 cursor-pointer rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white text-sm sm:text-base"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>

                                <div className="border rounded-xl p-3 sm:p-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-sm flex items-center gap-2"><FaPalette className="text-pink-400" />Couleurs et tailles</h3>
                                        <button type="button" onClick={openAddColor} className="text-xs sm:text-sm bg-black cursor-pointer text-white px-3 py-1.5 rounded-full hover:bg-pink-200 hover:text-black transition flex items-center gap-1"><FaPlus size={10} /> Ajouter une couleur</button>
                                    </div>
                                    {form.colors.length === 0 && <p className="text-xs text-gray-400 text-center py-3">Aucune couleur ajoutée pour l'instant</p>}
                                    <div className="space-y-2">
                                        {form.colors.map((c, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-gray-50 p-2.5 sm:p-3 rounded-xl">
                                                <img
                                                    src={c.image || "/placeholder.png"}
                                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                                    alt={c.color}
                                                    onError={(e) => { e.target.src = "/placeholder.png"; }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm">{c.color}</p>
                                                    <p className="text-xs text-gray-400 truncate">{c.sizes?.map(s => `${s.label}(${s.quantity})`).join(", ") || "No sizes"}</p>
                                                </div>
                                                <button type="button" onClick={() => openEditColor(i)} className="p-2 text-blue-500 cursor-pointer hover:bg-blue-50 rounded-lg"><FaEdit size={14} /></button>
                                                <button type="button" onClick={() => deleteColor(i)} className="p-2 text-red-500 cursor-pointer hover:bg-red-50 rounded-lg"><FaTrash size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {editing && pendingOperations.length > 0 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                                        <p className="text-xs text-yellow-700 font-medium">
                                            {pendingOperations.length} en attente de changement{pendingOperations.length > 1 ? 's' : ''} sera sauvegardé lors de la mise à jour
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-3.5 sm:py-4 rounded-full font-medium text-sm sm:text-base mt-2 transition cursor-pointer
                                        ${isSubmitting
                                            ? "bg-gray-400 text-white cursor-not-allowed"
                                            : "bg-black text-white hover:bg-pink-200 hover:text-black"
                                        }`}
                                >
                                    {isSubmitting
                                        ? (editing ? "Mise à jour..." : "Ajout...")
                                        : (editing ? "Mettre à jour le produit" : "Ajouter un produit")
                                    }
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========== COLOR MODAL ========== */}
            <AnimatePresence>
                {showColorModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowColorModal(false)}>
                        <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-md max-h-[85vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-5 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-bold">{editingColorIndex !== null ? "Modifier la couleur" : "Ajouter une couleur"}</h2>
                                <button onClick={() => setShowColorModal(false)} className="p-2 hover:bg-gray-100 cursor-pointer rounded-full"><FaTimes /></button>
                            </div>
                            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden" />

                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Sélectionner une couleur</label>
                                    <div className="flex gap-2 flex-wrap justify-center">
                                        {AVAILABLE_COLORS.map((c) => (
                                            <button
                                                key={c.name}
                                                type="button"
                                                onClick={() => setColorForm({ ...colorForm, color: c.name })}
                                                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 transition-all duration-200 ${colorForm.color === c.name
                                                    ? "border-black scale-110 ring-2 ring-pink-300 ring-offset-2"
                                                    : "border-gray-200 hover:border-gray-400 hover:scale-105"
                                                    }`}
                                                style={{
                                                    backgroundColor: c.hex,
                                                    boxShadow: c.name === "White" ? "inset 0 0 0 1px #e5e7eb" : "none"
                                                }}
                                                title={c.name}
                                            />
                                        ))}
                                    </div>
                                    {colorForm.color && (
                                        <p className="text-sm text-gray-600 mt-3 text-center">
                                            Selected: <span className="font-semibold text-pink-500">{colorForm.color}</span>
                                        </p>
                                    )}
                                </div>

                                <input ref={colorFileRef} type="file" accept="image/*" onChange={handleColorImageUpload} className="hidden" />

                                {!colorForm.image ? (
                                    <button
                                        type="button"
                                        onClick={() => colorFileRef.current?.click()}
                                        className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-pink-400 hover:bg-pink-50 transition cursor-pointer"
                                    >
                                        <FaUpload size={24} className="text-gray-400" />
                                        <span className="text-sm text-gray-500">Cliquez pour télécharger l'image</span>
                                        <span className="text-xs text-gray-400">JPG, PNG, WEBP (max 5MB)</span>
                                    </button>
                                ) : (
                                    <div className="relative rounded-xl overflow-hidden">
                                        <img src={colorForm.image} className="w-full h-32 sm:h-40 object-cover" alt="Preview" />
                                        <button
                                            onClick={() => setColorForm({ ...colorForm, image: "", imageFile: null })}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                        >
                                            <FaTimes size={12} />
                                        </button>
                                    </div>
                                )}

                                <div className="border rounded-xl p-3 sm:p-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-sm flex items-center gap-2"><FaBox className="text-pink-400" /> Tailles et stocks</h3>
                                        <button type="button" onClick={openAddSize} className="text-xs bg-black text-white px-3 py-1.5 cursor-pointer rounded-full hover:bg-pink-200 hover:text-black transition flex items-center gap-1"><FaPlus size={10} /> Ajouter une taille</button>
                                    </div>
                                    {colorForm.sizes.length === 0 && <p className="text-xs text-gray-400 text-center py-2">Aucune taille ajoutée pour le moment</p>}
                                    <div className="space-y-2">
                                        {colorForm.sizes.map((s, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm">{s.label}</p>
                                                    <p className="text-xs text-gray-400">Qty: {s.quantity}</p>
                                                </div>
                                                <button type="button" onClick={() => openEditSize(i)} className="p-2 cursor-pointer text-blue-500 hover:bg-blue-50 rounded-lg"><FaEdit size={12} /></button>
                                                <button type="button" onClick={() => deleteSize(i)} className="p-2 cursor-pointer text-red-500 hover:bg-red-50 rounded-lg"><FaTrash size={12} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button type="button" onClick={saveColor} className="w-full bg-black text-white py-3.5 sm:py-4 cursor-pointer rounded-full hover:bg-pink-200 hover:text-black transition font-medium text-sm sm:text-base">{editingColorIndex !== null ? "Mettre à jour la couleur" : "Ajouter une couleur"}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========== SIZE MODAL ========== */}
            <AnimatePresence>
                {showSizeModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowSizeModal(false)}>
                        <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-sm">
                            <div className="flex justify-between items-center mb-5 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-bold">{editingSizeIndex !== null ? "Modifier la taille" : "Ajouter une taille"}</h2>
                                <button onClick={() => setShowSizeModal(false)} className="p-2 cursor-pointer hover:bg-gray-100 rounded-full"><FaTimes /></button>
                            </div>
                            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden" />

                            <div className="space-y-3 sm:space-y-4">
                                <select
                                    value={sizeForm.label}
                                    onChange={(e) => setSizeForm({ ...sizeForm, label: e.target.value })}
                                    className="w-full border p-3.5 sm:p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm sm:text-base bg-white"
                                >
                                    <option value="">Sélectionner une taille</option>
                                    {AVAILABLE_SIZES.map((size) => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                                <input type="number" placeholder="Quantité en stock" value={sizeForm.quantity} onChange={(e) => setSizeForm({ ...sizeForm, quantity: e.target.value })} className="w-full border p-3.5 sm:p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm sm:text-base" min="0" />
                                <button type="button" onClick={saveSize} className="w-full bg-black text-white cursor-pointer py-3.5 sm:py-4 rounded-full hover:bg-pink-200 hover:text-black transition font-medium text-sm sm:text-base">{editingSizeIndex !== null ? "Mettre à jour la taille" : "Ajouter une taille "}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
