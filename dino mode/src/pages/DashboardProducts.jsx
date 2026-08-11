import { useState, useRef } from "react";
import DashboardSidebar from "../components/Dashboard/DashboardSidebar";
import { products as initialProducts } from "../data/products";
import { categories } from "../data/categories";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaImage, FaPalette, FaBox, FaUpload } from "react-icons/fa";
import toast from "react-hot-toast";

export default function DashboardProducts() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    oldPrice: "",
    category: categories[0]?.name || "Dresses",
    colors: [],
  });

  // Color modal state
  const [showColorModal, setShowColorModal] = useState(false);
  const [editingColorIndex, setEditingColorIndex] = useState(null);
  const [colorForm, setColorForm] = useState({
    color: "",
    image: "",
    sizes: [],
  });

  // Size modal state
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [editingSizeIndex, setEditingSizeIndex] = useState(null);
  const [sizeForm, setSizeForm] = useState({
    label: "",
    number: "",
    quantity: "",
  });

  // ✅ Ref pour upload image couleur
  const colorFileRef = useRef(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", price: "", oldPrice: "", category: categories[0]?.name || "", colors: [] });
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice || "",
      category: product.category,
      colors: product.colors || [],
    });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error("Please fill all fields");
      return;
    }
    if (form.colors.length === 0) {
      toast.error("Please add at least one color");
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
    };

    if (editing) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editing.id ? { ...p, ...payload } : p))
      );
      toast.success("Product updated");
    } else {
      const newProduct = {
        id: Date.now(),
        ...payload,
      };
      setProducts((prev) => [...prev, newProduct]);
      toast.success("Product added");
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (confirm("Delete this product?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    }
  };

  // ========== COLOR MANAGEMENT ==========

  const openAddColor = () => {
    setEditingColorIndex(null);
    setColorForm({ color: "", image: "", sizes: [] });
    setShowColorModal(true);
  };

  const openEditColor = (index) => {
    setEditingColorIndex(index);
    setColorForm({ ...form.colors[index] });
    setShowColorModal(true);
  };

  const saveColor = () => {
    if (!colorForm.color || !colorForm.image) {
      toast.error("Color name and image are required");
      return;
    }
    if (colorForm.sizes.length === 0) {
      toast.error("Please add at least one size with quantity");
      return;
    }

    const newColor = { ...colorForm };

    if (editingColorIndex !== null) {
      const updated = [...form.colors];
      updated[editingColorIndex] = newColor;
      setForm({ ...form, colors: updated });
    } else {
      setForm({ ...form, colors: [...form.colors, newColor] });
    }
    setShowColorModal(false);
  };

  const deleteColor = (index) => {
    setForm({ ...form, colors: form.colors.filter((_, i) => i !== index) });
  };

  // ✅ Upload image couleur → base64
  const handleColorImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large (max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setColorForm((prev) => ({ ...prev, image: reader.result }));
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
      number: s.number.toString(),
      quantity: s.quantity.toString(),
    });
    setShowSizeModal(true);
  };

  const saveSize = () => {
    if (!sizeForm.label || !sizeForm.number || sizeForm.quantity === "") {
      toast.error("Please fill all size fields");
      return;
    }

    const newSize = {
      label: sizeForm.label,
      number: Number(sizeForm.number),
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

  // ========== CALCUL STOCK TOTAL ==========
  const getTotalStock = (product) => {
    return product.colors?.reduce((total, color) => {
      return total + (color.sizes?.reduce((t, s) => t + (s.quantity || 0), 0) || 0);
    }, 0) || 0;
  };

  return (
    <div className="flex min-h-screen bg-pink-50">
      <DashboardSidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-serif">Products</h1>
          <button
            onClick={openAdd}
            className="bg-black text-white mt-2 cursor-pointer px-5 md:px-6 py-2.5 md:py-3 rounded-full flex items-center gap-2 hover:bg-pink-200 hover:text-black transition text-sm md:text-base w-full sm:w-auto justify-center"
          >
            <FaPlus size={14} /> Add Product
          </button>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm p-4 md:p-6">
          <div className="relative mb-4 md:mb-6">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search products..."
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
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Colors</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3">Price</th>
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
                    <td className="py-4 flex items-center gap-4">
                      <img
                        src={product.colors?.[0]?.image || product.image}
                        className="w-12 h-12 rounded-xl object-cover"
                        alt={product.name}
                      />
                      <div>
                        <span className="font-medium block">{product.name}</span>
                        {product.oldPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {product.oldPrice.toLocaleString()} DA
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 bg-pink-50 rounded-full text-xs">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {product.colors?.map((c, i) => (
                          <div key={i} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                            <img src={c.image} className="w-5 h-5 rounded-full object-cover border" alt={c.color} />
                            <span className="text-xs text-gray-600">{c.color}</span>
                            <span className="text-[10px] text-gray-400">({c.sizes?.length || 0}s)</span>
                          </div>
                        )) || <span className="text-xs text-gray-400">No colors</span>}
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        getTotalStock(product) > 10 
                          ? "bg-green-50 text-green-600" 
                          : getTotalStock(product) > 0 
                            ? "bg-yellow-50 text-yellow-600" 
                            : "bg-red-50 text-red-600"
                      }`}>
                        <FaBox className="inline mr-1" size={10} />
                        {getTotalStock(product)}
                      </span>
                    </td>
                    <td className="py-4 font-bold">{product.price.toLocaleString()} DA</td>
                    <td className="py-4 text-right">
                      <button onClick={() => openEdit(product)} className="p-2 text-blue-500 cursor-pointer hover:bg-blue-50 rounded-lg transition mr-1">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 cursor-pointer hover:bg-red-50 rounded-lg transition">
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
                  <img src={product.colors?.[0]?.image || product.image} className="w-14 h-14 rounded-xl object-cover" alt={product.name} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{product.name}</h3>
                    <span className="px-2 py-0.5 bg-pink-50 rounded-full text-xs text-gray-600 inline-block mt-1">{product.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm block">{product.price.toLocaleString()} DA</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getTotalStock(product) > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                      Stock: {getTotalStock(product)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {product.colors?.map((c, i) => (
                    <div key={i} className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border">
                      <img src={c.image} className="w-5 h-5 rounded-full object-cover" alt={c.color} />
                      <span className="text-xs text-gray-600">{c.color}</span>
                      <span className="text-[10px] text-gray-400">{c.sizes?.map(s => `${s.label}(${s.quantity})`).join(", ")}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => openEdit(product)} className="flex-1 py-2.5 text-blue-500 cursor-pointer bg-blue-50 rounded-xl text-sm font-medium flex items-center justify-center gap-1"><FaEdit size={12} /> Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="flex-1 py-2.5 text-red-500 cursor-pointer bg-red-50 rounded-xl text-sm font-medium flex items-center justify-center gap-1"><FaTrash size={12} /> Delete</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

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
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border p-3.5 sm:p-4 cursor-pointer rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white text-sm sm:text-base">
                  {categories.map((cat) => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
                </select>

                <div className="border rounded-xl p-3 sm:p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm flex items-center gap-2"><FaPalette className="text-pink-400" /> Colors & Sizes</h3>
                    <button type="button" onClick={openAddColor} className="text-xs sm:text-sm bg-black cursor-pointer text-white px-3 py-1.5 rounded-full hover:bg-pink-200 hover:text-black transition flex items-center gap-1"><FaPlus size={10} /> Add Color</button>
                  </div>
                  {form.colors.length === 0 && <p className="text-xs text-gray-400 text-center py-3">No colors added yet</p>}
                  <div className="space-y-2">
                    {form.colors.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-50 p-2.5 sm:p-3 rounded-xl">
                        <img src={c.image} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt={c.color} />
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

                <button type="submit" className="w-full bg-black cursor-pointer text-white py-3.5 sm:py-4 rounded-full hover:bg-pink-200 hover:text-black transition font-medium text-sm sm:text-base mt-2">{editing ? "Update Product" : "Add Product"}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== COLOR MODAL avec UPLOAD ========== */}
      <AnimatePresence>
        {showColorModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowColorModal(false)}>
            <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-md max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold">{editingColorIndex !== null ? "Edit Color" : "Add Color"}</h2>
                <button onClick={() => setShowColorModal(false)} className="p-2 hover:bg-gray-100 cursor-pointer rounded-full"><FaTimes /></button>
              </div>
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden" />

              <div className="space-y-3 sm:space-y-4">
                <input placeholder="Color name (e.g. Red, Black...)" value={colorForm.color} onChange={(e) => setColorForm({ ...colorForm, color: e.target.value })} className="w-full border p-3.5 sm:p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm sm:text-base" />

                {/* ✅ Upload image couleur */}
                <input ref={colorFileRef} type="file" accept="image/*" onChange={handleColorImageUpload} className="hidden" />
                
                {!colorForm.image ? (
                  <button
                    type="button"
                    onClick={() => colorFileRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-pink-400 hover:bg-pink-50 transition cursor-pointer"
                  >
                    <FaUpload size={24} className="text-gray-400" />
                    <span className="text-sm text-gray-500">Click to upload image</span>
                    <span className="text-xs text-gray-400">JPG, PNG, WEBP (max 5MB)</span>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={colorForm.image} className="w-full h-32 sm:h-40 object-cover" alt="Preview" />
                    <button
                      onClick={() => setColorForm({ ...colorForm, image: "" })}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                )}

                {/* Sizes Section */}
                <div className="border rounded-xl p-3 sm:p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm flex items-center gap-2"><FaBox className="text-pink-400" /> Sizes & Stock</h3>
                    <button type="button" onClick={openAddSize} className="text-xs bg-black text-white px-3 py-1.5 cursor-pointer rounded-full hover:bg-pink-200 hover:text-black transition flex items-center gap-1"><FaPlus size={10} /> Add Size</button>
                  </div>
                  {colorForm.sizes.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No sizes added yet</p>}
                  <div className="space-y-2">
                    {colorForm.sizes.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{s.label} <span className="text-gray-400 text-xs">(EU {s.number})</span></p>
                          <p className="text-xs text-gray-400">Qty: {s.quantity}</p>
                        </div>
                        <button type="button" onClick={() => openEditSize(i)} className="p-2 cursor-pointer text-blue-500 hover:bg-blue-50 rounded-lg"><FaEdit size={12} /></button>
                        <button type="button" onClick={() => deleteSize(i)} className="p-2 cursor-pointer text-red-500 hover:bg-red-50 rounded-lg"><FaTrash size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="button" onClick={saveColor} className="w-full bg-black text-white py-3.5 sm:py-4 cursor-pointer rounded-full hover:bg-pink-200 hover:text-black transition font-medium text-sm sm:text-base">{editingColorIndex !== null ? "Update Color" : "Add Color"}</button>
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
                <h2 className="text-lg sm:text-xl font-bold">{editingSizeIndex !== null ? "Edit Size" : "Add Size"}</h2>
                <button onClick={() => setShowSizeModal(false)} className="p-2 cursor-pointer hover:bg-gray-100 rounded-full"><FaTimes /></button>
              </div>
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden" />

              <div className="space-y-3 sm:space-y-4">
                <input placeholder="Size label (e.g. S, M, L, XL)" value={sizeForm.label} onChange={(e) => setSizeForm({ ...sizeForm, label: e.target.value })} className="w-full border p-3.5 sm:p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm sm:text-base uppercase" />
                <input type="number" placeholder="Size number (e.g. 38, 40, 42)" value={sizeForm.number} onChange={(e) => setSizeForm({ ...sizeForm, number: e.target.value })} className="w-full border p-3.5 sm:p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm sm:text-base" />
                <input type="number" placeholder="Quantity in stock" value={sizeForm.quantity} onChange={(e) => setSizeForm({ ...sizeForm, quantity: e.target.value })} className="w-full border p-3.5 sm:p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm sm:text-base" min="0" />
                <button type="button" onClick={saveSize} className="w-full bg-black text-white cursor-pointer py-3.5 sm:py-4 rounded-full hover:bg-pink-200 hover:text-black transition font-medium text-sm sm:text-base">{editingSizeIndex !== null ? "Update Size" : "Add Size"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}