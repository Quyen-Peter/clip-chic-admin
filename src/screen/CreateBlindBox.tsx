import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/ProductDetail.css";
import editIcon from "../asesst/pencil.png";
import trashIcon from "../asesst/bin.png";
import { createBlindBox } from "../services/blindBoxService";
import { fetchCollections, CollectionSummary } from "../services/collectionService";

type FeedbackState =
  | { type: "success" | "error"; message: string }
  | null;

type ImageSlot = {
  file: File | null;
  preview: string | null;
};

const IMAGE_LIMIT = 5;

const initialImages = (): ImageSlot[] =>
  Array.from({ length: IMAGE_LIMIT }, () => ({ file: null, preview: null }));

const CreateBlindBox = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = React.useState<CollectionSummary[]>([]);
  const [images, setImages] = React.useState<ImageSlot[]>(initialImages);
  const [isLoadingCollections, setIsLoadingCollections] = React.useState(false);
  const [collectionsError, setCollectionsError] = React.useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<FeedbackState>(null);
  const previewUrlsRef = React.useRef<string[]>([]);

  const [form, setForm] = React.useState({
    collectId: "",
    name: "",
    descript: "",
    price: "",
    stock: "",
    status: "active",
  });

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
          setForm((prev) => ({
            ...prev,
            collectId: prev.collectId || String(data[0].id),
          }));
        }
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : "Unable to load collections.";
        setCollectionsError(message);
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

  React.useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange =
    (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;

      setImages((prev) => {
        const next = [...prev];
        const previous = next[index];
        if (previous?.preview) {
          URL.revokeObjectURL(previous.preview);
          previewUrlsRef.current = previewUrlsRef.current.filter(
            (url) => url !== previous.preview
          );
        }

        if (file) {
          const preview = URL.createObjectURL(file);
          previewUrlsRef.current.push(preview);
          next[index] = { file, preview };
        } else {
          next[index] = { file: null, preview: null };
        }

        return next;
      });

      event.target.value = "";
    };

  const handleRemoveImage = (index: number) => () => {
    setImages((prev) => {
      const next = [...prev];
      const previous = next[index];
      if (previous?.preview) {
        URL.revokeObjectURL(previous.preview);
        previewUrlsRef.current = previewUrlsRef.current.filter(
          (url) => url !== previous.preview
        );
      }
      next[index] = { file: null, preview: null };
      return next;
    });
  };

  const resetForm = () => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];
    setImages(initialImages());
    setForm({
      collectId: collections[0] ? String(collections[0].id) : "",
      name: "",
      descript: "",
      price: "",
      stock: "",
      status: "active",
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.collectId) {
      setFeedback({
        type: "error",
        message: "Please select a collection.",
      });
      return;
    }

    if (!form.name.trim()) {
      setFeedback({
        type: "error",
        message: "Please enter a blindbox name.",
      });
      return;
    }

    const priceValue = Number(form.price);
    if (!form.price || Number.isNaN(priceValue) || priceValue < 0) {
      setFeedback({
        type: "error",
        message: "Price must be a non-negative number.",
      });
      return;
    }

    const stockValue = Number(form.stock);
    if (!form.stock || Number.isNaN(stockValue) || stockValue < 0) {
      setFeedback({
        type: "error",
        message: "Stock must be a non-negative number.",
      });
      return;
    }

    const selectedImages = images
      .filter((slot) => slot.file)
      .map((slot) => slot.file as File);

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await createBlindBox({
        collectId: Number(form.collectId),
        name: form.name.trim(),
        descript: form.descript.trim(),
        price: priceValue,
        stock: stockValue,
        status: form.status,
        images: selectedImages,
      });
      setFeedback({
        type: "success",
        message: "Blindbox created successfully.",
      });
      resetForm();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create blindbox.";
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
          onClick={() => navigate("/BlindBoxes")}
          className="bnt-back"
        >
          Thoát
        </button>
        <div className="bnt-edit-delete">
          <button className="edit-bnt" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "lưu"}
          </button>
        </div>
      </div>

      <div className="content-container-product">
        <div>
          <p className="title-img-product">Ảnh sản phẩm</p>
          <div className="image-grid">
            {images.map((slot, index) => (
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
            ))}
          </div>
        </div>

        <div className="right-txt-product">
          <p className="title-product">Thể loại:</p>
          {collections.length > 0 ? (
            <select
              name="collectId"
              value={form.collectId}
              onChange={handleInputChange}
              className="product-short-input-select"
            >
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          ) : (
            <div
              className={`field-message${
                collectionsError ? " error" : ""
              }`}
            >
              {isLoadingCollections
                ? "Loading collections..."
                : collectionsError ?? "No collections available."}
            </div>
          )}

          <p className="title-product">Tên sản phẩm:</p>
          <input
            name="name"
            value={form.name}
            onChange={handleInputChange}
            type="text"
            className="input-product-name"
            placeholder="Enter blindbox name"
          />

          <p className="title-product">mô tả:</p>
          <textarea
            name="descript"
            rows={5}
            className="input-product-discription"
            value={form.descript}
            onChange={handleInputChange}
            placeholder="Describe the blindbox"
          />

          <p className="title-product">Giá:</p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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

          <p className="title-product">Số lượng:</p>
          <input
            name="stock"
            type="number"
            className="product-short-input"
            value={form.stock}
            onChange={handleInputChange}
            min="0"
            placeholder="0"
          />

          <p className="title-product">Trạng thái:</p>
          <select
            name="status"
            value={form.status}
            onChange={handleInputChange}
            className="product-short-input-select"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>

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

export default CreateBlindBox;
