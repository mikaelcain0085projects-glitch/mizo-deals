"use client";

import Link from "next/link";
import AdminProductsBackButton from "../../../../components/AdminProductsBackButton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase-browser";
import imageCompression from "browser-image-compression";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const COLOR_OPTIONS = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Navy",
  "Grey",
  "Brown",
  "Pink",
  "Purple",
  "Orange",
];

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

type ProductImage = {
  url: string;
  publicId: string;
};

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const [customSize, setCustomSize] = useState("");
  const [customColor, setCustomColor] = useState("");

  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [isActive, setIsActive] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      const { data, error: categoryError } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id")
        .eq("is_active", true)
        .order("name");

      if (!categoryError && data) {
        setCategories(data);
      }

      setLoadingCategories(false);
    }

    loadCategories();
  }, [supabase]);

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleNameChange(value: string) {
    setName(value);

    if (!slug || slug === createSlug(name)) {
      setSlug(createSlug(value));
    }
  }

  function toggleSize(size: string) {
    setSelectedSizes((current) =>
      current.includes(size)
        ? current.filter((item) => item !== size)
        : [...current, size]
    );
  }

  function toggleColor(color: string) {
    setSelectedColors((current) =>
      current.includes(color)
        ? current.filter((item) => item !== color)
        : [...current, color]
    );
  }

  function addCustomSize() {
    const value = customSize.trim();

    if (!value) {
      return;
    }

    if (!selectedSizes.includes(value)) {
      setSelectedSizes((current) => [...current, value]);
    }

    setCustomSize("");
  }

  function addCustomColor() {
    const value = customColor.trim();

    if (!value) {
      return;
    }

    if (!selectedColors.includes(value)) {
      setSelectedColors((current) => [...current, value]);
    }

    setCustomColor("");
  }

  async function handleImageChange(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const files = Array.from(event.target.files ?? []);

  if (files.length === 0) {
    return;
  }

  const invalidFile = files.find(
    (file) => !file.type.startsWith("image/")
  );

  if (invalidFile) {
    setError("Only image files are allowed.");
    event.target.value = "";
    return;
  }

  const oversizedFile = files.find(
    (file) => file.size > 1.5 * 1024 * 1024
  );

  if (oversizedFile) {
    setError("Each image must be 1.5 MB or smaller.");
    event.target.value = "";
    return;
  }

  try {
    setError("");

    const optimizedFiles: File[] = [];

    for (const file of files) {
      if (file.size <= 800 * 1024) {
        optimizedFiles.push(file);
        continue;
      }

      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.8,
        useWebWorker: true,
        initialQuality: 0.85,
      });

      optimizedFiles.push(compressedFile);
    }

    setImageFiles(optimizedFiles);
  } catch (error) {
    console.error("Image compression error:", error);
    setError("Failed to optimize one or more images.");
    event.target.value = "";
  }
}

  async function uploadImages(): Promise<ProductImage[]> {
    const uploadedImages: ProductImage[] = [];

    for (const file of imageFiles) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/cloudinary-upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `Failed to upload ${file.name}.`
        );
      }

      uploadedImages.push({
        url: result.url,
        publicId: result.publicId,
      });
    }

    return uploadedImages;
  }

  async function deleteUploadedImages(images: ProductImage[]) {
    for (const image of images) {
      try {
        await fetch("/api/cloudinary-delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicId: image.publicId,
          }),
        });
      } catch (cleanupError) {
        console.error(
          "Cloudinary cleanup failed:",
          cleanupError
        );
      }
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter a product name.");
      return;
    }

    if (!slug.trim()) {
      setError("Please enter a product slug.");
      return;
    }

    if (!price || Number(price) < 0) {
      setError("Please enter a valid product price.");
      return;
    }

    if (salePrice && Number(salePrice) < 0) {
      setError("Please enter a valid sale price.");
      return;
    }

    if (
      salePrice &&
      Number(salePrice) >= Number(price)
    ) {
      setError(
        "Sale price must be lower than the regular price."
      );
      return;
    }

    if (!stock || Number(stock) < 0) {
      setError("Please enter a valid stock quantity.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    if (selectedSizes.length === 0) {
      setError("Please select at least one available size.");
      return;
    }

    if (selectedColors.length === 0) {
      setError("Please select at least one available colour.");
      return;
    }

    setSaving(true);

    // Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/admin/login");
      return;
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (
      profileError ||
      !profile ||
      profile.role !== "admin"
    ) {
      await supabase.auth.signOut();
      router.push("/admin/login");
      return;
    }

    let uploadedImages: ProductImage[] = [];

    try {
      // Upload selected images to Cloudinary
      if (imageFiles.length > 0) {
        uploadedImages = await uploadImages();
      }

      // Create product in Supabase
      const { error: insertError } = await supabase
        .from("products")
        .insert({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          price: Number(price),
          sale_price: salePrice
            ? Number(salePrice)
            : null,
          category_id: categoryId,
          stock: Number(stock),
          images: uploadedImages,
          sizes: selectedSizes,
          colors: selectedColors,
          is_active: isActive,
        });

      if (insertError) {
        // Remove Cloudinary images if product creation fails
        if (uploadedImages.length > 0) {
          await deleteUploadedImages(uploadedImages);
        }

        if (insertError.code === "23505") {
          setError(
            "A product with this slug already exists."
          );
        } else {
          setError(insertError.message);
        }

        setSaving(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (uploadError) {
      // Remove any images that were successfully uploaded
      if (uploadedImages.length > 0) {
        await deleteUploadedImages(uploadedImages);
      }

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload product images."
      );

      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <AdminProductsBackButton />

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Add Product
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Create a new product for the MIZO DEALS catalogue.
          </p>
        </div>
      </header>

      {/* Form */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Information */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Basic Information
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="text-sm text-white/70"
                >
                  Product Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    handleNameChange(event.target.value)
                  }
                  placeholder="Example: Mizo Premium Hoodie"
                  required
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/40"
                />
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="text-sm text-white/70"
                >
                  Product Slug
                </label>

                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    setSlug(createSlug(event.target.value))
                  }
                  placeholder="mizo-premium-hoodie"
                  required
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/40"
                />

                <p className="mt-2 text-xs text-white/30">
                  Used in the product URL.
                </p>
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="text-sm text-white/70"
                >
                  Category
                </label>

                <select
                  id="category"
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(event.target.value)
                  }
                  required
                  disabled={loadingCategories}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm outline-none focus:border-white/40"
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : "Select subcategory"}
                  </option>

                  {categories
                    .filter(
                      (category) => category.parent_id !== null
                    )
                    .sort((a, b) => {
                      if (a.parent_id === b.parent_id) {
                        return a.name.localeCompare(b.name);
                      }

                      return a.parent_id!.localeCompare(
                        b.parent_id!
                      );
                    })
                    .map((category) => {
                      const parent = categories.find(
                        (item) =>
                          item.id === category.parent_id
                      );

                      return (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {parent?.name ?? "Category"} →{" "}
                          {category.name}
                        </option>
                      );
                    })}
                </select>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="text-sm text-white/70"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe the product..."
                  rows={5}
                  className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/40"
                />
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Product Images
            </p>

            <p className="mt-2 text-sm text-white/40">
              Select one or more product images. Images will be
              uploaded securely to Cloudinary.
            </p>

           <div className="mt-6">
  <label
    htmlFor="product-images"
    className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-6 py-10 text-center transition hover:border-white/40 hover:bg-white/[0.05]"
  >
    <span className="text-sm font-medium text-orange-600">
      SELECT PRODUCT IMAGES
    </span>

    <span className="mt-2 text-xs text-white/40">
      JPG, PNG, WEBP or other image formats · Maximum 1.5 MB each
    </span>

    <span className="mt-4 rounded-full border border-white/15 px-5 py-2 text-xs font-semibold tracking-[0.12em] text-orange-600">
      CHOOSE FILES
    </span>

    <input
      id="product-images"
      type="file"
      accept="image/*"
      multiple
      onChange={handleImageChange}
      className="hidden"
    />
  </label>

  {error && (
    <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {error}
    </div>
  )}

  {imageFiles.length > 0 && (
    <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
        Selected Images
      </p>

      <div className="mt-3 space-y-2">
        {imageFiles.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <p className="min-w-0 truncate text-sm text-white/70">
              {file.name}
            </p>

            <p className="shrink-0 text-xs text-white/30">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ))}
      </div>
    </div>
  )}
</div>
</div>


          {/* Pricing & Stock */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Pricing & Stock
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <div>
                <label
                  htmlFor="price"
                  className="text-sm text-white/70"
                >
                  Regular Price
                </label>

                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) =>
                    setPrice(event.target.value)
                  }
                  placeholder="799"
                  required
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/40"
                />
              </div>

              <div>
                <label
                  htmlFor="salePrice"
                  className="text-sm text-white/70"
                >
                  Sale Price
                </label>

                <input
                  id="salePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={salePrice}
                  onChange={(event) =>
                    setSalePrice(event.target.value)
                  }
                  placeholder="699"
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/40"
                />

                <p className="mt-2 text-xs text-white/30">
                  Leave empty if there is no sale.
                </p>
              </div>

              <div>
                <label
                  htmlFor="stock"
                  className="text-sm text-white/70"
                >
                  Stock Quantity
                </label>

                <input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={stock}
                  onChange={(event) =>
                    setStock(event.target.value)
                  }
                  placeholder="25"
                  required
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/40"
                />
              </div>
            </div>
          </div>

          {/* Sizes */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Available Sizes
            </p>

            <p className="mt-2 text-sm text-white/40">
              Select only the sizes available for this product.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {SIZE_OPTIONS.map((size) => {
                const selected =
                  selectedSizes.includes(size);

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`rounded-full border px-5 py-2.5 text-sm transition ${
                      selected
                        ? "border-white bg-white text-black"
                        : "border-white/15 text-white/60 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={customSize}
                onChange={(event) =>
                  setCustomSize(event.target.value)
                }
                placeholder="Custom size, e.g. One Size"
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/40"
              />

              <button
                type="button"
                onClick={addCustomSize}
                className="rounded-xl border border-white/20 px-6 py-3 text-xs font-semibold tracking-[0.15em] transition hover:bg-white hover:text-black"
              >
                ADD SIZE
              </button>
            </div>
          </div>

          {/* Colours */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Available Colours
            </p>

            <p className="mt-2 text-sm text-white/40">
              Select only the colours available for this product.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {COLOR_OPTIONS.map((color) => {
                const selected =
                  selectedColors.includes(color);

                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleColor(color)}
                    className={`rounded-full border px-5 py-2.5 text-sm transition ${
                      selected
                        ? "border-white bg-white text-black"
                        : "border-white/15 text-white/60 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={customColor}
                onChange={(event) =>
                  setCustomColor(event.target.value)
                }
                placeholder="Custom colour, e.g. Maroon"
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/40"
              />

              <button
                type="button"
                onClick={addCustomColor}
                className="rounded-xl border border-white/20 px-6 py-3 text-xs font-semibold tracking-[0.15em] transition hover:bg-white hover:text-black"
              >
                ADD COLOUR
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
            <label className="flex cursor-pointer items-center gap-4">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) =>
                  setIsActive(event.target.checked)
                }
                className="h-5 w-5 accent-white"
              />

              <div>
                <p className="text-sm font-medium">
                  Product Active
                </p>

                <p className="mt-1 text-xs text-white/40">
                  Active products are visible in the store.
                </p>
              </div>
            </label>
          </div>

          
          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/products"
              className="rounded-full border border-white/15 px-7 py-3 text-center text-xs font-semibold tracking-[0.15em] transition hover:bg-white hover:text-black"
            >
              CANCEL
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-white px-7 py-3 text-xs font-semibold tracking-[0.15em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "UPLOADING & SAVING..." : "SAVE PRODUCT"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}