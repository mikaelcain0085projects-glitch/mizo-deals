"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "../../../../../lib/supabase-browser";
import AdminProductsBackButton from "../../../../../components/AdminProductsBackButton";

const SIZE_OPTIONS = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
];

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
};

type ProductImage = {
  url: string;
  publicId: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  category_id: string | null;
  stock: number;
  images: unknown;
  sizes: unknown;
  colors: unknown;
  is_active: boolean;
};

function normalizeImages(value: unknown): ProductImage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((image) => {
      if (
        typeof image === "object" &&
        image !== null &&
        "url" in image &&
        "publicId" in image &&
        typeof image.url === "string" &&
        typeof image.publicId === "string"
      ) {
        return {
          url: image.url,
          publicId: image.publicId,
        };
      }

      // Backwards compatibility if an old image was stored
      // as a plain URL string.
      if (typeof image === "string") {
        return {
          url: image,
          publicId: "",
        };
      }

      return null;
    })
    .filter((image): image is ProductImage => image !== null);
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const productId = String(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const [customSize, setCustomSize] = useState("");
  const [customColor, setCustomColor] = useState("");

  const [images, setImages] = useState<ProductImage[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<ProductImage[]>([]);

  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setError("");

      // Check login
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/admin/login");
        return;
      }

      // Check admin role
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

      // Load categories
      const {
        data: categoryData,
        error: categoryError,
      } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (categoryError) {
        setError(categoryError.message);
        setLoading(false);
        return;
      }

      setCategories(categoryData ?? []);

      // Load product
      const {
        data: productData,
        error: productError,
      } = await supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          description,
          price,
          sale_price,
          category_id,
          stock,
          images,
          sizes,
          colors,
          is_active
        `)
        .eq("id", productId)
        .maybeSingle();

      if (productError) {
        setError(productError.message);
        setLoading(false);
        return;
      }

      if (!productData) {
        setError("Product not found.");
        setLoading(false);
        return;
      }

      const loadedProduct = productData as Product;

      setProduct(loadedProduct);

      setName(loadedProduct.name);
      setSlug(loadedProduct.slug);
      setDescription(loadedProduct.description ?? "");
      setPrice(String(loadedProduct.price));
      setSalePrice(
        loadedProduct.sale_price !== null
          ? String(loadedProduct.sale_price)
          : ""
      );
      setStock(String(loadedProduct.stock));
      setCategoryId(loadedProduct.category_id ?? "");
      setIsActive(loadedProduct.is_active);

      setImages(normalizeImages(loadedProduct.images));

      setSelectedSizes(
        Array.isArray(loadedProduct.sizes)
          ? loadedProduct.sizes.map(String)
          : []
      );

      setSelectedColors(
        Array.isArray(loadedProduct.colors)
          ? loadedProduct.colors.map(String)
          : []
      );

      setLoading(false);
    }

    loadData();
  }, [productId, router, supabase]);

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
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

  function handleNewImageSelection(
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
      (file) => file.size > 10 * 1024 * 1024
    );

    if (oversizedFile) {
      setError("Each image must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }

    setError("");

    setNewImageFiles((current) => [...current, ...files]);

    event.target.value = "";
  }

  function removeNewImage(index: number) {
    setNewImageFiles((current) =>
      current.filter((_, imageIndex) => imageIndex !== index)
    );
  }

  function removeExistingImage(index: number) {
    const image = images[index];

    if (!image) {
      return;
    }

    setImages((current) =>
      current.filter((_, imageIndex) => imageIndex !== index)
    );

    setRemovedImages((current) => [...current, image]);
  }

  async function uploadNewImages(): Promise<ProductImage[]> {
    const uploadedImages: ProductImage[] = [];

    for (const file of newImageFiles) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/cloudinary-upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Failed to upload ${file.name}.`
        );
      }

      uploadedImages.push({
        url: result.url,
        publicId: result.publicId,
      });
    }

    return uploadedImages;
  }

  async function deleteCloudinaryImage(
    image: ProductImage
  ) {
    if (!image.publicId) {
      return true;
    }

    const response = await fetch(
      "/api/cloudinary-delete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicId: image.publicId,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
          `Failed to delete Cloudinary image.`
      );
    }

    return true;
  }

  async function cleanupUploadedImages(
    uploadedImages: ProductImage[]
  ) {
    for (const image of uploadedImages) {
      try {
        await deleteCloudinaryImage(image);
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
      setError(
        "Please select at least one available size."
      );
      return;
    }

    if (selectedColors.length === 0) {
      setError(
        "Please select at least one available colour."
      );
      return;
    }

    setSaving(true);

    // Verify admin again before updating
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
      // Upload any newly selected images first.
      if (newImageFiles.length > 0) {
        uploadedImages = await uploadNewImages();
      }

      const finalImages = [
        ...images,
        ...uploadedImages,
      ];

      // Update product in Supabase.
      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          price: Number(price),
          sale_price: salePrice
            ? Number(salePrice)
            : null,
          category_id: categoryId,
          stock: Number(stock),
          images: finalImages,
          sizes: selectedSizes,
          colors: selectedColors,
          is_active: isActive,
        })
        .eq("id", productId);

      if (updateError) {
        // Product update failed, so remove any new
        // Cloudinary images that were just uploaded.
        if (uploadedImages.length > 0) {
          await cleanupUploadedImages(uploadedImages);
        }

        if (updateError.code === "23505") {
          setError(
            "A product with this slug already exists."
          );
        } else {
          setError(updateError.message);
        }

        setSaving(false);
        return;
      }

      // The database now no longer references removed images.
      // Delete those old Cloudinary assets.
      for (const image of removedImages) {
        if (!image.publicId) {
          continue;
        }

        try {
          await deleteCloudinaryImage(image);
        } catch (deleteError) {
          console.error(
            "Cloudinary image deletion failed:",
            deleteError
          );
        }
      }

      router.push("/admin/products");
      router.refresh();
    } catch (submitError) {
      // If uploading failed halfway through, clean up
      // every image that was successfully uploaded.
      if (uploadedImages.length > 0) {
        await cleanupUploadedImages(uploadedImages);
      }

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save product changes."
      );

      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
            MIZO DEALS
          </p>

          <p className="mt-5 text-sm text-white/50">
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  if (error && !product) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
            PRODUCT ERROR
          </p>

          <p className="mt-4 text-sm text-white/60">
            {error}
          </p>

          <Link
            href="/admin/products"
            className="mt-8 inline-flex rounded-full border border-white/20 px-6 py-3 text-xs font-semibold tracking-[0.15em] transition hover:bg-white hover:text-black"
          >
            BACK TO PRODUCTS
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <AdminProductsBackButton />

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Edit Product
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Update product information, images, stock,
            sizes, and colours.
          </p>
        </div>
      </header>

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
                    setName(event.target.value)
                  }
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
                  required
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/40"
                />
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
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm outline-none focus:border-white/40"
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
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
              Manage images stored on Cloudinary.
              Maximum 10 MB per image.
            </p>

            {/* Existing Images */}
            {images.length > 0 ? (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                  Current Images
                </p>

                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {images.map((image, index) => (
                    <div
                      key={`${image.url}-${index}`}
                      className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
                    >
                      <div className="aspect-square overflow-hidden bg-white/5">
                        <img
                          src={image.url}
                          alt={`${name} image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeExistingImage(index)
                        }
                        disabled={saving}
                        className="absolute right-2 top-2 rounded-full border border-red-300/30 bg-black/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-300 backdrop-blur-sm transition hover:bg-red-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        REMOVE
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-8 text-center">
                <p className="text-sm text-white/40">
                  No product images added yet.
                </p>
              </div>
            )}

            {/* Add New Images */}
            <div className="mt-6">
              <label
                htmlFor="new-product-images"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-6 py-10 text-center transition hover:border-white/40 hover:bg-white/[0.05]"
              >
                <span className="text-sm text-orange-500 font-medium">
                  ADD PRODUCT IMAGES
                </span>

                <span className="mt-2 text-xs text-white/40">
                  JPG, PNG, WEBP or other image formats
                </span>

                <span className="mt-1 text-xs text-white/30">
                  Maximum 10 MB each
                </span>

                <span className="mt-4 rounded-full border border-white/15 px-5 py-2 text-xs text-orange-500 font-semibold tracking-[0.12em]">
                  CHOOSE FILES
                </span>

                <input
                  id="new-product-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleNewImageSelection}
                  className="hidden"
                />
              </label>
            </div>

            {/* New Images Waiting for Save */}
            {newImageFiles.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                  New Images
                </p>

                <div className="mt-3 space-y-2">
                  {newImageFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${file.size}-${index}`}
                      className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white/70">
                          {file.name}
                        </p>

                        <p className="mt-1 text-xs text-white/30">
                          {(
                            file.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeNewImage(index)
                        }
                        disabled={saving}
                        className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-red-300 transition hover:text-red-200 disabled:opacity-50"
                      >
                        REMOVE
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {removedImages.length > 0 && (
              <p className="mt-4 text-xs text-yellow-300/70">
                {removedImages.length} image
                {removedImages.length === 1 ? "" : "s"}{" "}
                marked for deletion. Changes take effect
                when you save.
              </p>
            )}
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
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/40"
                />

                <p className="mt-2 text-xs text-white/30">
                  Leave empty for no sale price.
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
              Select only the sizes available for this
              product.
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

            {selectedSizes.length > 0 && (
              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.12em] text-white/30">
                  Selected
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedSizes.map((size) => (
                    <span
                      key={size}
                      className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colours */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Available Colours
            </p>

            <p className="mt-2 text-sm text-white/40">
              Select only the colours available for this
              product.
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

            {selectedColors.length > 0 && (
              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.12em] text-white/30">
                  Selected
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedColors.map((color) => (
                    <span
                      key={color}
                      className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
                  Active products are visible in the
                  store.
                </p>
              </div>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm leading-6 text-red-300">
              {error}
            </div>
          )}

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
              className="rounded-full bg-orange-500 px-7 py-3 text-xs  font-semibold tracking-[0.15em] text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "UPLOADING & SAVING..."
                : "SAVE CHANGES"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}