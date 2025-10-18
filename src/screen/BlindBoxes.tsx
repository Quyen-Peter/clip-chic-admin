import React from "react";
import "../css/BlindBox.css";
import editIcon from "../asesst/pencil.png";
import { useNavigate } from "react-router-dom";
import {
  fetchBlindBoxes,
  BlindBoxListItem,
} from "../services/blindBoxService";

const BlindBoxes = () => {
  const navigate = useNavigate();
  const [blindBoxes, setBlindBoxes] = React.useState<BlindBoxListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    const loadBlindBoxes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchBlindBoxes();
        if (isMounted) {
          setBlindBoxes(data);
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err instanceof Error
              ? err.message
              : "Unable to load blind boxes.";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadBlindBoxes();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatPrice = (value: number) =>
    value > 0 ? `${value.toLocaleString("vi-VN")} VND` : "Updating";

  return (
    <div className="blindbox-container">
      <div className="blindbox-header">
        <h2>Blindbox Catalog</h2>
        <button
          className="blindbox-add-button"
          onClick={() => navigate("/CreateBlindBox")}
        >
          <h2>Create blindbox</h2>
        </button>
      </div>

      <div className="blindbox-subheader">
        <p>Blindboxes currently available in the system</p>
        <p>Showing {blindBoxes.length} blindboxes</p>
      </div>

      <div className="blindbox-list">
        <div className="blindbox-header-row">
          <span>Image</span>
          <span>Blindbox</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Actions</span>
        </div>

        {isLoading && (
          <div className="blindbox-feedback">Loading blindboxes...</div>
        )}
        {error && <div className="blindbox-feedback error">{error}</div>}

        {blindBoxes.map((blindBox) => (
          <div className="blindbox-row" key={blindBox.id}>
            <span className="blindbox-image">
              {blindBox.image ? (
                <img src={blindBox.image} alt={blindBox.name} />
              ) : (
                <span className="no-image">No image</span>
              )}
            </span>
            <span className="blindbox-name">
              {blindBox.name}
              <span>
                {blindBox.collectionName
                  ? `Collection: ${blindBox.collectionName}`
                  : ""}
                {blindBox.collectionName && blindBox.description ? " · " : ""}
                {blindBox.description || "No description"}
              </span>
              {blindBox.status && (
                <span
                  className={`blindbox-status status-${blindBox.status.toLowerCase()}`}
                >
                  {blindBox.status}
                </span>
              )}
            </span>
            <span className="blindbox-price">
              {formatPrice(blindBox.price)}
            </span>
            <span className="blindbox-stock">{blindBox.stock}</span>
            <span className="blindbox-actions">
              <button
                className="edit-button"
                onClick={() => navigate(`/BlindBoxDetail/${blindBox.id}`)}
              >
                <img src={editIcon} alt="Edit" />
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlindBoxes;
