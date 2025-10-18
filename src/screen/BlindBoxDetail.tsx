import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/ProductDetail.css";
import {
  fetchBlindBoxById,
  BlindBoxDetail,
  updateBlindBox,
} from "../services/blindBoxService";
import { fetchCollections, CollectionSummary } from "../services/collectionService";

const BlindBoxDetailScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [blindBox, setBlindBox] = React.useState<BlindBoxDetail | null>(null);
  const [collections, setCollections] = React.useState<CollectionSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    collectId: "",
    name: "",
    descript: "",
    price: "",
    stock: "",
    status: "",
  });

  const blindBoxId = React.useMemo(() => {
    if (!id) return null;
    const numeric = Number(id);
    return Number.isNaN(numeric) ? null : numeric;
  }, [id]);

  React.useEffect(() => {
    let isMounted = true;
    const loadCollections = async () => {
      try {
        const data = await fetchCollections();
        if (isMounted) {
          setCollections(data);
        }
        return data;
      } catch (err) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "Unable to load collections.";
          setError(message);
        }
        return [];
      }
    };

    const loadData = async () => {
      if (blindBoxId === null) {
        setError("Blindbox id is invalid or missing.");
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const [collectionsData, blindBoxData] = await Promise.all([
          loadCollections(),
          fetchBlindBoxById(blindBoxId),
        ]);

        if (!isMounted) return;
        setBlindBox(blindBoxData);
        setForm({
          collectId: String(
            blindBoxData.collectionId ?? collectionsData[0]?.id ?? ""
          ),
          name: blindBoxData.name,
          descript: blindBoxData.description,
          price: blindBoxData.price ? String(blindBoxData.price) : "",
          stock: blindBoxData.stock != null ? String(blindBoxData.stock) : "",
          status: blindBoxData.status ?? "active",
        });
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : "Unable to load blindbox.";
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
  }, [blindBoxId]);

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
    if (blindBoxId === null) {
      setError("Blindbox id is invalid.");
      return;
    }

    if (!form.name.trim()) {
      setSaveFeedback("Please enter a blindbox name.");
      return;
    }

    if (!form.collectId) {
      setSaveFeedback("Please select a collection.");
      return;
    }

    const priceValue = Number(form.price);
    if (Number.isNaN(priceValue) || priceValue < 0) {
      setSaveFeedback("Price must be a non-negative number.");
      return;
    }

    const stockValue = Number(form.stock);
    if (Number.isNaN(stockValue) || stockValue < 0) {
      setSaveFeedback("Stock must be a non-negative number.");
      return;
    }

    setIsSaving(true);
    setSaveFeedback(null);
    try {
      await updateBlindBox({
        id: blindBoxId,
        collectId: Number(form.collectId),
        name: form.name.trim(),
        descript: form.descript.trim(),
        price: priceValue,
        stock: stockValue,
        status: form.status,
      });
      setSaveFeedback("Blindbox updated successfully.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update blindbox.";
      setSaveFeedback(message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderImages = () => {
    if (!blindBox || blindBox.images.length === 0) {
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
        {blindBox.images.map((image) => (
          <div className="image-box" key={image.id}>
            <img
              src={image.url}
              alt={image.name ?? `blindbox-image-${image.id}`}
              className="preview-img"
            />
          </div>
        ))}
      </div>
    );
  };

  const formatPrice = (value: number) =>
    value > 0 ? `${value.toLocaleString("vi-VN")} VND` : "Updating";

  return (
    <form className="container-product-detail" onSubmit={handleSubmit}>
      <div className="bnt-container">
        <button
          type="button"
          onClick={() => navigate("/BlindBoxes")}
          className="bnt-back"
        >
          Back
        </button>
        <div className="bnt-edit-delete">
          <button className="edit-bnt" type="submit" disabled={isSaving || isLoading}>
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="field-message" style={{ marginTop: "20px" }}>
          Loading blindbox...
        </div>
      )}

      {error && (
        <div className="field-message error" style={{ marginTop: "20px" }}>
          {error}
        </div>
      )}

      {!isLoading && !error && blindBox && (
        <div className="content-container-product">
          <div>
            <p className="title-img-product">Blindbox images</p>
            {renderImages()}
          </div>

          <div className="right-txt-product">
            <p className="title-product">Blindbox name:</p>
            <input
              className="input-product-name"
              name="name"
              value={form.name}
              onChange={handleInputChange}
            />

            <p className="title-product">Collection:</p>
            <select
              name="collectId"
              value={form.collectId}
              onChange={handleInputChange}
              className="product-short-input-select"
            >
              <option value="">-- Select collection --</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>

            <p className="title-product">Collection description:</p>
            <textarea
              className="input-product-discription readonly-textarea"
              readOnly
              value={
                collections.find(
                  (collection) => String(collection.id) === form.collectId
                )?.descript ?? blindBox.collectionDescription ?? "Not provided"
              }
            />

            <p className="title-product">Description:</p>
            <textarea
              className="input-product-discription"
              name="descript"
              value={form.descript}
              onChange={handleInputChange}
            />

            <p className="title-product">Price:</p>
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
                Current: {formatPrice(blindBox.price)}
              </span>
            </div>

            <p className="title-product">Stock:</p>
            <input
              className="product-short-input"
              name="stock"
              value={form.stock}
              onChange={handleInputChange}
              type="number"
              min="0"
            />

            <p className="title-product">Status:</p>
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

export default BlindBoxDetailScreen;
