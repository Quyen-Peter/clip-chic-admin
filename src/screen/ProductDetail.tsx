import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/ProductDetail.css";
import {
  fetchProductById,
  ProductDetail as ProductDetailType,
  updateProduct,
  UpdateProductPayload,
} from "../services/productService";
import { fetchCollections, CollectionSummary } from "../services/collectionService";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = React.useState<ProductDetailType | null>(null);
  const [collections, setCollections] = React.useState<CollectionSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    collectId: "",
    title: "",
    descript: "",
    price: "",
    stock: "",
    status: "",
    createDate: "",
  });

  const targetId = React.useMemo(() => {
    if (!id) return null;
    const numeric = Number(id);
    return Number.isNaN(numeric) ? null : numeric;
  }, [id]);

  const loadCollections = React.useCallback(async () => {
    try {
      const data = await fetchCollections();
      setCollections(data);
      return data;
    } catch (err) {
      setCollections([]);
      const message =
        err instanceof Error ? err.message : "Unable to load collections.";
      setError(message);
      return [];
    }
  }, []);

  React.useEffect(() => {
    if (targetId === null) {
      setError("Product id is invalid or missing.");
      return;
    }

    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [collectionsData, productData] = await Promise.all([
          loadCollections(),
          fetchProductById(targetId),
        ]);
        if (!isMounted) return;
        setProduct(productData);
        setForm({
          collectId: String(
            productData.collectionId ?? collectionsData[0]?.id ?? ""
          ),
          title: productData.title,
          descript: productData.description,
          price: productData.price ? String(productData.price) : "",
          stock: productData.stock != null ? String(productData.stock) : "",
          status: productData.status ?? "active",
          createDate: productData.createDate
            ? productData.createDate.split("T")[0]
            : "",
        });
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : "Unable to load product.";
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [targetId, loadCollections]);

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (targetId === null) {
      setError("Product id is invalid.");
      return;
    }

    if (!form.title.trim()) {
      setSaveFeedback("Please enter a product name.");
      return;
    }

    if (!form.collectId) {
      setSaveFeedback("Please select a collection.");
      return;
    }

    const priceValue = form.price ? Number(form.price) : null;
    if (form.price && Number.isNaN(priceValue)) {
      setSaveFeedback("Price must be a valid number.");
      return;
    }

    const stockValue = form.stock ? Number(form.stock) : null;
    if (form.stock && Number.isNaN(stockValue)) {
      setSaveFeedback("Stock must be a valid number.");
      return;
    }

    let createDateIso: string | undefined;
    if (form.createDate) {
      const parsed = new Date(form.createDate);
      if (Number.isNaN(parsed.getTime())) {
        setSaveFeedback("Create date is invalid.");
        return;
      }
      createDateIso = parsed.toISOString();
    }

    const payload: UpdateProductPayload = {
      id: targetId,
      collectId: Number(form.collectId),
      title: form.title.trim(),
      descript: form.descript.trim(),
      price: priceValue,
      stock: stockValue,
      status: form.status,
      createDate: createDateIso ?? null,
    };

    setIsSaving(true);
    setSaveFeedback(null);
    try {
      await updateProduct(payload);
      setSaveFeedback("Product updated successfully.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update product.";
      setSaveFeedback(message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (value: number) =>
    value > 0 ? `${value.toLocaleString("vi-VN")} VND` : "Updating";

  const renderImages = () => {
    if (!product) return null;

    if (product.images.length === 0) {
      return (
        <div className="image-grid">
          <div className="image-box">
            <span className="placeholder">No image</span>
          </div>
        </div>
      );
    }

    return (
      <div className="image-grid">
        {product.images.map((image) => (
          <div className="image-box" key={image.id}>
            <img
              src={image.url}
              alt={image.name ?? `product-image-${image.id}`}
              className="preview-img"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <form className="container-product-detail" onSubmit={handleSubmit}>
      <div className="bnt-container">
        <button type="button" onClick={() => navigate("/Products")} className="bnt-back">
          Thoát
        </button>
        <div className="bnt-edit-delete">
          <button className="edit-bnt" type="submit" disabled={isSaving || isLoading}>
            {isSaving ? "Saving..." : "Tạo"}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="field-message" style={{ marginTop: "20px" }}>
          Loading product...
        </div>
      )}

      {error && (
        <div className="field-message error" style={{ marginTop: "20px" }}>
          {error}
        </div>
      )}

      {!isLoading && !error && product && (
        <div className="content-container-product">
          <div>
            <p className="title-img-product">Ảnh sản phẩm</p>
            {renderImages()}
          </div>

          <div className="right-txt-product">
            <p className="title-product">Tên sản phẩm:</p>
            <input
              className="input-product-name"
              name="title"
              value={form.title}
              onChange={handleInputChange}
            />

            <p className="title-product">Thể loại:</p>
            <select
              name="collectId"
              value={form.collectId}
              onChange={handleInputChange}
              className="product-short-input-select"
            >
              <option value="">-- Chọn thể loại --</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>

            <p className="title-product">Mô tả thể loại:</p>
            <textarea
              className="input-product-discription "
              readOnly
              value={
                collections.find(
                  (collection) => String(collection.id) === form.collectId
                )?.descript ?? product.collectionDescription ?? "Not provided"
              }
            />

            <p className="title-product">Mô tả sản phẩm:</p>
            <textarea
              className="input-product-discription readonly-textarea"
              name="descript"
              value={form.descript}
              onChange={handleInputChange}
            />

            <p className="title-product">Giá:</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                className="product-short-input"
                name="price"
                value={form.price}
                onChange={handleInputChange}
                type="number"
                min="0"
                step="0.01"
              />
              <p className="title-product">VND</p>
              <span className="product-feedback">
                Hiện hành: {formatPrice(product.price)}
              </span>
            </div>

            <p className="title-product">Số lượng kho:</p>
            <input
              className="product-short-input"
              name="stock"
              value={form.stock}
              onChange={handleInputChange}
              type="number"
              min="0"
            />

            <p className="title-product">trạng thái:</p>
            <select
              className="product-short-input-select"
              name="status"
              value={form.status}
              onChange={handleInputChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>

            <p className="title-product">Ngày tạo:</p>
            <input
              className="product-short-input"
              name="createDate"
              value={form.createDate}
              onChange={handleInputChange}
              type="date"
            />

            {saveFeedback && (
              <p
                className={`submit-feedback ${
                  saveFeedback.includes("successfully") ? "success" : "error"
                }`}
              >
                {saveFeedback}
              </p>
            )}
          </div>
        </div>
      )}
    </form>
  );
};

export default ProductDetail;
