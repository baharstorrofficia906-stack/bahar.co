import { useState, useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useUploadImages, Product } from "@workspace/api-client-react";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, UploadCloud, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLanguage } from "@/hooks/use-language";
import { PlaneLoader } from "@/components/ui/PlaneLoader";

export default function ManageProducts() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { data: products, isLoading } = useGetProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const uploadImages = useUploadImages();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm<any>();
  const imageUrl = watch("imageUrl");

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      reset(product);
      const existing: string[] = [];
      if (product.imageUrl) existing.push(product.imageUrl);
      if (Array.isArray(product.images)) existing.push(...product.images);
      setUploadedImages(existing);
    } else {
      setEditingId(null);
      reset({ stock: 10, featured: false, category: "Dates" });
      setUploadedImages([]);
    }
    setAiPrompt("");
    setAiError("");
    setShowAiPanel(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
    setUploadedImages([]);
    setAiPrompt("");
    setAiError("");
    setShowAiPanel(false);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/admin/ai/generate-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: aiPrompt }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "AI generation failed");
      }
      const { product } = await res.json();
      if (product.name) setValue("name", product.name);
      if (product.nameAr) setValue("nameAr", product.nameAr);
      if (product.category) setValue("category", product.category);
      if (product.price) setValue("price", product.price);
      if (product.originalPrice) setValue("originalPrice", product.originalPrice);
      if (product.stock) setValue("stock", product.stock);
      if (product.description) setValue("description", product.description);
      if (typeof product.featured === "boolean") setValue("featured", product.featured);
      setShowAiPanel(false);
    } catch (err: any) {
      setAiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const res = await uploadImages.mutateAsync({ data: { images: Array.from(files) } });
      const newUrls = res.urls ?? [];
      setUploadedImages(prev => {
        const combined = [...prev, ...newUrls];
        if (combined.length > 0) setValue("imageUrl", combined[0]);
        return combined;
      });
    } catch (err) {
      alert("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      setValue("imageUrl", next[0] ?? "");
      return next;
    });
  };

  const onSubmit = (data: any) => {
    const [primary, ...rest] = uploadedImages;
    const formattedData = {
      ...data,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      stock: Number(data.stock),
      imageUrl: primary ?? data.imageUrl ?? undefined,
      images: rest.length > 0 ? rest : [],
    };

    if (editingId) {
      updateProduct.mutate(
        { id: editingId, data: formattedData },
        { onSuccess: () => { queryClient.invalidateQueries(); closeModal(); } }
      );
    } else {
      createProduct.mutate(
        { data: formattedData },
        { onSuccess: () => { queryClient.invalidateQueries(); closeModal(); } }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(t.admin.products.deleteConfirm)) {
      deleteProduct.mutate({ id }, { onSuccess: () => queryClient.invalidateQueries() });
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary font-serif">{t.admin.products.title}</h1>
        <button onClick={() => openModal()} className="btn-gold px-4 py-2 flex items-center gap-2 text-sm rounded-lg">
          <Plus size={16} /> {t.admin.products.addProduct}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-background text-sm text-muted-foreground uppercase">
            <tr>
              <th className="px-6 py-4 font-semibold">{t.admin.products.images}</th>
              <th className="px-6 py-4 font-semibold">{t.admin.products.name}</th>
              <th className="px-6 py-4 font-semibold">{t.admin.products.category}</th>
              <th className="px-6 py-4 font-semibold">{t.admin.products.price}</th>
              <th className="px-6 py-4 font-semibold">{t.admin.products.stock}</th>
              <th className="px-6 py-4 font-semibold text-right">{t.admin.products.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-8"><PlaneLoader text="Loading products..." /></td></tr>
            ) : products?.map(p => {
              const allImgs = [
                ...(p.imageUrl ? [p.imageUrl] : []),
                ...(Array.isArray(p.images) ? p.images : []),
              ];
              return (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-6 py-3">
                    <div className="flex gap-1">
                      {allImgs.slice(0, 3).map((img, i) => (
                        <div key={i} className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                          <img src={img} className="w-full h-full object-cover" alt="" />
                        </div>
                      ))}
                      {allImgs.length === 0 && (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <ImageIcon size={14} className="text-muted-foreground" />
                        </div>
                      )}
                      {allImgs.length > 3 && (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          +{allImgs.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 font-semibold">{p.name}</td>
                  <td className="px-6 py-3">{p.category}</td>
                  <td className="px-6 py-3 font-bold">EGP {p.price.toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock > 10 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl my-auto p-6 md:p-8 relative shadow-2xl">
            <button onClick={closeModal} className="absolute top-6 right-6 text-muted-foreground hover:text-secondary"><X size={24}/></button>
            <h2 className="text-2xl font-serif font-bold text-secondary mb-6">{editingId ? t.admin.products.editProduct : t.admin.products.newProduct}</h2>

            {/* AI Assistant Panel */}
            <div className="mb-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-amber-50/50 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAiPanel(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-secondary text-sm">AI Product Assistant</p>
                    <p className="text-xs text-muted-foreground">Describe the product and AI will fill all fields automatically</p>
                  </div>
                </div>
                {showAiPanel ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
              </button>

              {showAiPanel && (
                <div className="px-5 pb-5 space-y-3 border-t border-primary/10">
                  <div className="pt-4">
                    <textarea
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      rows={3}
                      placeholder='e.g. "Premium Ajwa dates from Medina, 500g box, price 180 EGP, limited stock of 25"'
                      className="w-full border border-border rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-primary/50 outline-none bg-white"
                      onKeyDown={e => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAiGenerate();
                      }}
                    />
                    {aiError && <p className="text-xs text-destructive mt-1">{aiError}</p>}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Tip: You can edit the generated fields before saving</p>
                    <button
                      type="button"
                      onClick={handleAiGenerate}
                      disabled={isAiLoading || !aiPrompt.trim()}
                      className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isAiLoading ? (
                        <><Loader2 size={14} className="animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles size={14} /> Generate Fields</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">{t.admin.products.nameEN}</label>
                  <input {...register("name", { required: true })} className="w-full border rounded-lg p-3" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">{t.admin.products.nameAR}</label>
                  <input {...register("nameAr")} className="w-full border rounded-lg p-3" dir="rtl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">{t.admin.products.priceEGP}</label>
                  <input type="number" {...register("price", { required: true })} className="w-full border rounded-lg p-3" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">{t.admin.products.originalPrice}</label>
                  <input type="number" {...register("originalPrice")} className="w-full border rounded-lg p-3" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">{t.admin.products.category}</label>
                  <select {...register("category")} className="w-full border rounded-lg p-3">
                    <option value="Dates">Dates</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Perfumes">Perfumes</option>
                    <option value="Incense">Incense</option>
                    <option value="Gifts">Gifts</option>
                    <option value="Electrical Devices">Electrical Devices</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Bags">Bags</option>
                    <option value="Abayas">Abayas (عبايات نسائي)</option>
                    <option value="Ecoway">Ecoway Products</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">{t.admin.products.stockQuantity}</label>
                  <input type="number" {...register("stock", { required: true })} className="w-full border rounded-lg p-3" />
                </div>
              </div>

              {/* Multi-image Upload */}
              <div className="space-y-3">
                <label className="text-sm font-semibold">{t.admin.products.productImages}</label>

                <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${isUploading ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary hover:bg-primary/5"}`}>
                  <UploadCloud className={`w-8 h-8 mb-2 ${isUploading ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                  <span className="text-sm font-semibold text-secondary">
                    {isUploading ? t.admin.products.uploading : t.admin.products.uploadPhotos}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">{t.admin.products.uploadHint}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,image/webp,image/gif,image/bmp,image/tiff,.heic,.heif"
                    onChange={handleFilesUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>

                <input
                  {...register("imageUrl")}
                  placeholder={t.admin.products.orPasteUrl}
                  className="w-full border rounded-lg p-2 text-sm"
                  onBlur={(e) => {
                    const url = e.target.value.trim();
                    if (url && !uploadedImages.includes(url)) {
                      setUploadedImages(prev => [url, ...prev.filter(u => u !== uploadedImages[0])]);
                    }
                  }}
                />

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {uploadedImages.map((url, i) => (
                      <div key={url + i} className={`relative group rounded-lg overflow-hidden border-2 ${i === 0 ? "border-primary" : "border-transparent"}`}>
                        <img src={url} alt="" className="w-full aspect-square object-cover" />
                        {i === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[9px] font-bold text-center py-0.5">
                            {t.admin.products.mainImageLabel}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {uploadedImages.length > 1 && (
                  <p className="text-xs text-muted-foreground">{t.admin.products.multipleImagesHint}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">{t.admin.products.description}</label>
                <textarea {...register("description")} rows={3} className="w-full border rounded-lg p-3" />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured" {...register("featured")} className="w-4 h-4" />
                <label htmlFor="featured" className="font-semibold">{t.admin.products.featured}</label>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={closeModal} className="px-6 py-3 font-semibold text-muted-foreground hover:bg-muted rounded-xl transition-colors">{t.admin.products.cancel}</button>
                <button
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending || isUploading}
                  className="btn-secondary bg-secondary text-white px-8 py-3 rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-50"
                >
                  {editingId ? t.admin.products.saveChanges : t.admin.products.createProduct}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
