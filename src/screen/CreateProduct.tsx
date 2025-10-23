import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/ProductDetail.css";
import editIcon from "../asesst/pencil.png";
import trashIcon from "../asesst/bin.png";
import { createProduct } from "../services/productService";
import {
  fetchCollections,
  CollectionSummary,
} from "../services/collectionService";

type FeedbackState = { type: "success" | "error"; message: string } | null;

type ImageSlot = {
  file: File | null;
  preview: string | null;
};

const IMAGE_SLOT_COUNT = 5;

const createInitialImageSlots = (): ImageSlot[] =>
  Array.from({ length: IMAGE_SLOT_COUNT }, () => ({
    file: null,
    preview: null,
  }));

const getInitialFormState = (defaultCollectId?: number) => ({
  collectId: defaultCollectId ? String(defaultCollectId) : "",
  title: "",
  descript: "",
  price: "",
  stock: 0,
  createDate: new Date().toISOString().slice(0, 10),
  status: "active",
});

const CreateProduct = () => {
  const navigate = useNavigate();
  const previewUrlsRef = React.useRef<string[]>([]);

  const [images, setImages] = React.useState<ImageSlot[]>(
    createInitialImageSlots
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<FeedbackState>(null);
  const [collections, setCollections] = React.useState<CollectionSummary[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = React.useState(false);
  const [collectionsError, setCollectionsError] = React.useState<string | null>(
    null
  );
  const [form, setForm] = React.useState(() => getInitialFormState());

  const registerPreview = React.useCallback((url: string) => {
    previewUrlsRef.current.push(url);
  }, []);

  const revokePreview = React.useCallback((url: string | null) => {
    if (!url) return;
    URL.revokeObjectURL(url);
    previewUrlsRef.current = previewUrlsRef.current.filter(
      (value) => value !== url
    );
  }, []);

  React.useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const loadCollections = async () => {
      setIsLoadingCollections(true);
      setCollectionsError(null);
      try {
        const data = await fetchCollections();
        if (!isMounted) return;
        setCollections(data);
        if (data.length > 0) {
          setForm((prev) =>
            prev.collectId ? prev : { ...prev, collectId: String(data[0].id) }
          );
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "Unable to load collections.";
          setCollectionsError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoadingCollections(false);
        }
      }
    };

    loadCollections();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileChange =
    (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;

      setImages((prev) => {
        const next = [...prev];
        const previous = next[index];
        if (previous?.preview) {
          revokePreview(previous.preview);
        }

        if (file) {
          const preview = URL.createObjectURL(file);
          registerPreview(preview);
          next[index] = { file, preview };
        } else {
          next[index] = { file: null, preview: null };
        }

        return next;
      });

      // Allow selecting the same file again
      event.target.value = "";
    };

  const handleRemoveImage = (index: number) => () => {
    setImages((prev) => {
      const next = [...prev];
      const previous = next[index];
      if (previous?.preview) {
        revokePreview(previous.preview);
      }
      next[index] = { file: null, preview: null };
      return next;
    });
  };

  const resetImages = React.useCallback(() => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];
    setImages(createInitialImageSlots());
  }, []);

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const adjustStock = (delta: number) => {
    setForm((prev) => ({
      ...prev,
      stock: Math.max(0, prev.stock + delta),
    }));
  };

  const handleStockChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setForm((prev) => ({
      ...prev,
      stock: Number.isNaN(value) ? 0 : Math.max(0, value),
    }));
  };

  const resetForm = React.useCallback(() => {
    setForm(() => getInitialFormState(collections[0]?.id));
    resetImages();
  }, [collections, resetImages]);

  const renderImageSlot = (index: number) => {
    const slot = images[index];

    return (
      <div className="image-box" key={`image-slot-${index}`}>
        {!slot.preview && <span className="placeholder">No image</span>}

        {slot.preview && (
          <img
            src={slot.preview}
            alt={`preview-${index + 1}`}
            className="preview-img"
          />
        )}

        <div className="overlay">
          <label className="btn-icon">
            <img src={editIcon} alt="edit" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange(index)}
              hidden
            />
          </label>
          <button
            className="btn-icon"
            type="button"
            onClick={handleRemoveImage(index)}
          >
            <img src={trashIcon} alt="delete" />
          </button>
        </div>
      </div>
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!form.collectId.trim()) {
      setFeedback({
        type: "error",
        message: "Please choose a collection.",
      });
      return;
    }

    const collectIdValue = Number(form.collectId);
    if (Number.isNaN(collectIdValue) || collectIdValue <= 0) {
      setFeedback({
        type: "error",
        message: "Collection selection is invalid.",
      });
      return;
    }

    if (!form.title.trim()) {
      setFeedback({ type: "error", message: "Please enter a product title." });
      return;
    }

    const priceValue = form.price ? Number(form.price) : null;
    if (form.price && Number.isNaN(priceValue)) {
      setFeedback({ type: "error", message: "Price must be a valid number." });
      return;
    }

    let createDateIso: string | undefined;
    if (form.createDate) {
      const parsed = new Date(form.createDate);
      if (Number.isNaN(parsed.getTime())) {
        setFeedback({ type: "error", message: "Create date is invalid." });
        return;
      }
      createDateIso = parsed.toISOString();
    }

    const selectedImages = images
      .filter((slot) => slot.file)
      .map((slot) => slot.file as File);

    if (selectedImages.length === 0) {
      setFeedback({
        type: "error",
        message: "Please upload at least one product image.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const product = await createProduct({
        collectId: collectIdValue,
        title: form.title.trim(),
        descript: form.descript.trim(),
        price: priceValue,
        stock: form.stock,
        createDate: createDateIso,
        status: form.status,
        images: selectedImages,
      });

      setFeedback({
        type: "success",
        message: `Product "${product.title}" created successfully.`,
      });
      resetForm();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create product.";
      setFeedback({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="container-product-detail" onSubmit={handleSubmit}>
      <div className="bnt-container">
        <button
          type="button"
          onClick={() => navigate("/Products")}
          className="bnt-back"
        >
          Thoát
        </button>
        <div className="bnt-edit-delete">
          <button type="submit" className="edit-bnt" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="content-container-product">
        <div>
          <p className="title-img-product">Ảnh sản phẩm</p>
          <div className="container-img">
            {[0, 1, 2].map((index) => renderImageSlot(index))}
          </div>
          <div className="container-img">
            {[3, 4].map((index) => renderImageSlot(index))}
            <div className="image-box" />
          </div>
        </div>

        <div className="right-txt-product" style={{marginTop: "20px"}}>
          <p className="title-product" style={{marginBottom: "20px"}}>Thể loại:</p>
          {collections.length > 0 ? (
            <select
              name="collectId"
              value={form.collectId}
              onChange={handleInputChange}
              className="product-short-input-select"
              style={{marginBottom: "20px"}}
            >
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          ) : (
            <div className={`field-message${collectionsError ? " error" : ""}`}>
              {isLoadingCollections
                ? "Loading collections..."
                : collectionsError ?? "No collections available."}
            </div>
          )}

          <p className="title-product" style={{marginBottom: "20px"}}>Tên sản phẩm:</p>
          <input
            name="title"
            value={form.title}
            onChange={handleInputChange}
            type="text"
            className="input-product-name"
            placeholder="Enter product name"
            style={{marginBottom: "20px"}}
          />

          <p className="title-product" style={{marginBottom: "20px"}}>mô tả:</p>
          <textarea
            name="descript"
            rows={5}
            className="input-product-discription"
            value={form.descript}
            onChange={handleInputChange}
            placeholder="Describe the product"
            style={{marginBottom: "20px"}}
          />

          <p className="title-product" style={{marginBottom: "20px"}}>Ngày tạo:</p>
          <input
            name="createDate"
            type="date"
            className="product-short-input"
            value={form.createDate}
            onChange={handleInputChange}
            style={{marginBottom: "20px"}}
          />

          <p className="title-product" style={{marginBottom: "20px"}}>Trạng thái:</p>
          <select
            name="status"
            value={form.status}
            onChange={handleInputChange}
            className="product-short-input-select"
            style={{marginBottom: "20px"}}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <p className="title-product" style={{marginBottom: "20px"}}>Price:</p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }} >
            <input
              name="price"
              type="number"
              className="product-short-input"
              value={form.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="0"
            />
            <p className="title-product">VND</p>
          </div>

          <p className="title-product" style={{marginBottom: "20px"}}>Số lượng:</p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" , }}>
            <button
              type="button"
              onClick={() => adjustStock(-1)}
              style={{
                width: "40px",
                height: "30px",
                backgroundColor: "#ffffff",
              }}
              className="change-stock"
            >
              -
            </button>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={handleStockChange}
              className="product-short-input"
              style={{ width: "80px", textAlign: "center" }}
            />
            <button
              type="button"
              onClick={() => adjustStock(1)}
              className="change-stock"
              style={{
                width: "40px",
                height: "30px",
                backgroundColor: "#ffffff",
              }}
            >
              +
            </button>
            <p className="title-product">Sản phẩm</p>
          </div>

          {feedback && (
            <p className={`submit-feedback ${feedback.type}`}>
              {feedback.message}
            </p>
          )}
        </div>
      </div>
    </form>
  );
};

export default CreateProduct;
