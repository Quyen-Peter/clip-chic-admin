import React from "react";
import { useLocation } from "react-router-dom";
import "../css/Design.css";
import Product3DViewer from "../component/Product3DViewer";
import { fetchCustomProducts, ProductListItem } from "../services/productService";
import {
  CharmAsset,
  filterDesignableProducts,
  fetchCharmAssets,
  fetchProductSceneConfig,
  ProductSceneConfig,
} from "../services/designService";

type FilterOption = "all" | "public" | "private";

const Design = () => {
  const location = useLocation();
  const initialSelectedProductId =
    (location.state as { selectedProductId?: number } | undefined)
      ?.selectedProductId ?? null;
  const hasAppliedInitialSelection = React.useRef(false);

  const [products, setProducts] = React.useState<ProductListItem[]>([]);
  const [filter, setFilter] = React.useState<FilterOption>("all");
  const [search, setSearch] = React.useState<string>("");
  const [selectedProductId, setSelectedProductId] = React.useState<number | null>(null);
  const [sceneConfig, setSceneConfig] = React.useState<ProductSceneConfig | null>(null);
  const [loadingProducts, setLoadingProducts] = React.useState<boolean>(false);
  const [loadingScene, setLoadingScene] = React.useState<boolean>(false);
  const [loadingCharms, setLoadingCharms] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sceneError, setSceneError] = React.useState<string | null>(null);
  const [charmAssets, setCharmAssets] = React.useState<CharmAsset[]>([]);
  const [showDetails, setShowDetails] = React.useState<boolean>(false);

  const normalizePath = (value?: string | null) =>
    (value ?? "").trim().toLowerCase();

  const findCharmAsset = (modelPath: string): CharmAsset | undefined => {
    const target = normalizePath(modelPath);
    if (!target) return undefined;

    return charmAssets.find((asset) => {
      const assetPath = normalizePath(asset.modelUrl);
      if (assetPath && assetPath === target) return true;

      const targetName = target.split("/").pop();
      const assetName = assetPath.split("/").pop();
      return targetName && assetName && targetName === assetName;
    });
  };

  React.useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      setError(null);
      try {
        const data = await fetchCustomProducts();
        setProducts(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Không thể tải danh sách custom product.";
        setError(message);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  React.useEffect(() => {
    const loadCharms = async () => {
      setLoadingCharms(true);
      try {
        const data = await fetchCharmAssets();
        setCharmAssets(data);
      } catch (err) {
        console.error("Cannot load charms", err);
      } finally {
        setLoadingCharms(false);
      }
    };
    loadCharms();
  }, []);

  const designableProducts = React.useMemo(
    () => filterDesignableProducts(products),
    [products]
  );

  const filteredProducts = React.useMemo(
    () =>
      designableProducts.filter((product) => {
        const matchStatus =
          filter === "all"
            ? true
            : product.status?.toLowerCase() === filter;
        const matchSearch = product.title
          .toLowerCase()
          .includes(search.trim().toLowerCase());
        return matchStatus && matchSearch;
      }),
    [designableProducts, filter, search]
  );

  const loadScene = React.useCallback(
    async (product: ProductListItem) => {
      setSelectedProductId(product.id);
      setSceneConfig(null);

      if (!product.modelUrl) {
        setSceneError("Sản phẩm không có cấu hình 3D.");
        return;
      }

      setSceneError(null);
      setLoadingScene(true);
      try {
        const config = await fetchProductSceneConfig(product.modelUrl);
        setSceneConfig(config);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Không tải được cấu hình 3D.";
        setSceneError(message);
      } finally {
        setLoadingScene(false);
      }
    },
    []
  );

  React.useEffect(() => {
    if (filteredProducts.length === 0) {
      setSelectedProductId(null);
      setSceneConfig(null);
      return;
    }

    // Apply incoming selection once (from navigation state)
    if (!hasAppliedInitialSelection.current && initialSelectedProductId) {
      const match = filteredProducts.find((p) => p.id === initialSelectedProductId);
      if (match) {
        hasAppliedInitialSelection.current = true;
        loadScene(match);
        return;
      }
      hasAppliedInitialSelection.current = true;
    }

    if (!selectedProductId || !filteredProducts.some((p) => p.id === selectedProductId)) {
      loadScene(filteredProducts[0]);
    }
  }, [filteredProducts, loadScene, selectedProductId, initialSelectedProductId]);

  const selectedProduct =
    filteredProducts.find((product) => product.id === selectedProductId) ??
    filteredProducts[0] ??
    null;

  const formatPrice = (value: number) =>
    value > 0 ? `${value.toLocaleString("vi-VN")} VND` : "Đang cập nhật";

  return (
    <div className="design-page">
      <div className="design-header">
        <div>
          <p className="design-eyebrow">Thiết kế</p>
          <h2 className="design-title">Trình xem sản phẩm 3D</h2>
          <p className="design-subtitle">
            Kiểm tra nhanh các thiết kế ở trạng thái public hoặc private với cấu hình 3D đính kèm.
          </p>
        </div>
        <div className="design-actions">
          <div className="design-search">
            <input
              type="search"
              placeholder="Tìm theo tên sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="design-search-icon">⌕</span>
          </div>
          <div className="design-filters">
            {(["all", "public", "private"] as FilterOption[]).map((option) => (
              <button
                key={option}
                className={`design-filter ${filter === option ? "active" : ""}`}
                onClick={() => setFilter(option)}
              >
                {option === "all" ? "Tất cả" : option === "public" ? "Public" : "Private"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="design-alert design-alert-error">{error}</div>}

      <div className="design-content">
        <div className="design-list">
          {loadingProducts && <div className="design-empty">Đang tải sản phẩm...</div>}

          {!loadingProducts && filteredProducts.length === 0 && (
            <div className="design-empty">
              Không tìm thấy sản phẩm phù hợp (public/private) có cấu hình 3D.
            </div>
          )}

          {!loadingProducts &&
            filteredProducts.map((product) => (
              <button
                key={product.id}
                className={`design-card ${
                  selectedProductId === product.id ? "active" : ""
                }`}
                onClick={() => loadScene(product)}
              >
                <div className="design-card-thumb">
                  {product.image ? (
                    <img src={product.image} alt={product.title} />
                  ) : (
                    <span className="design-thumb-fallback">No image</span>
                  )}
                </div>
                <div className="design-card-body">
                  <p className="design-card-title">{product.title}</p>
                  <p className="design-card-meta">
                    {product.status ?? "N/A"} • {formatPrice(product.price)}
                  </p>
                </div>
              </button>
            ))}
        </div>

        <div className="design-viewer-panel">
          {selectedProduct ? (
            <>
              <div className="design-viewer-header">
                <div>
                  <p className="design-eyebrow small">
                    {selectedProduct.status?.toUpperCase() ?? ""}
                  </p>
                  <h3 className="design-viewer-title">{selectedProduct.title}</h3>
                  <p className="design-meta">
                    {formatPrice(selectedProduct.price)} •{" "}
                    {selectedProduct.collectionName ?? "Không thuộc bộ sưu tập"}
                  </p>
                </div>
                <button
                  className="design-detail-btn"
                  type="button"
                  onClick={() => setShowDetails(true)}
                  disabled={!sceneConfig}
                >
                  Xem cấu hình
                </button>
              </div>

              <div className="design-canvas-wrapper">
                {loadingScene && <div className="design-empty">Đang tải cấu hình 3D...</div>}
                {sceneError && !loadingScene && (
                  <div className="design-alert">{sceneError}</div>
                )}
                {sceneConfig && !loadingScene && !sceneError && (
                  <Product3DViewer
                    baseModel={sceneConfig.baseModel}
                    charms={sceneConfig.charms}
                    backgroundColor="#0c1020"
                  />
                )}
              </div>

              <div className="design-description">
                {selectedProduct.description || "Không có mô tả cho sản phẩm này."}
              </div>
            </>
          ) : (
            <div className="design-empty">Chọn một sản phẩm để xem mô hình 3D.</div>
          )}
        </div>
      </div>

      {showDetails && sceneConfig && (
        <div className="design-modal-overlay" onClick={() => setShowDetails(false)}>
          <div
            className="design-modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="design-modal-header">
              <div>
                <p className="design-eyebrow small">Chi tiết cấu hình</p>
                <h4 className="design-modal-title">{selectedProduct?.title}</h4>
              </div>
              <button
                className="design-close"
                type="button"
                onClick={() => setShowDetails(false)}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div className="design-modal-body">
              <div className="design-modal-section">
                <p className="design-modal-label">Base model</p>
                <div className="design-modal-row">
                  <div className="design-avatar">
                    {selectedProduct?.image ? (
                      <img src={selectedProduct.image} alt={selectedProduct.title} />
                    ) : (
                      <span className="design-avatar-fallback">
                        {selectedProduct?.title?.charAt(0).toUpperCase() ?? "B"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="design-modal-value">{selectedProduct?.title}</p>
                    <p className="design-modal-subvalue">
                      Màu: <strong>{sceneConfig.baseModelColor}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="design-modal-section">
                <p className="design-modal-label">
                  Charms ({sceneConfig.charms.length})
                  {loadingCharms && <span className="design-chip muted">Đang tải danh sách charm...</span>}
                </p>
                {sceneConfig.charms.length === 0 ? (
                  <p className="design-modal-empty">Không có charm nào.</p>
                ) : (
                  <ul className="design-modal-list">
                    {sceneConfig.charms.map((charm, idx) => {
                      const matchedCharm = findCharmAsset(charm.modelPath);
                      const charmLabel =
                        matchedCharm?.name ||
                        charm.id ||
                        charm.modelPath.split("/").pop() ||
                        `Charm ${idx + 1}`;
                      return (
                      <li key={charm.id} className="design-modal-list-item">
                        <div className="design-modal-row">
                          <div className="design-avatar small">
                            {matchedCharm?.imageUrl ? (
                              <img src={matchedCharm.imageUrl} alt={charmLabel} />
                            ) : (
                              <span className="design-avatar-fallback">
                                {charmLabel.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="design-modal-value">{charmLabel}</p>
                            <p className="design-modal-subvalue">
                              Pos: {charm.position.join(", ")} • Rot:{" "}
                              {charm.rotation.join(", ")} • Scale: {charm.scale.join(", ")}
                            </p>
                          </div>
                        </div>
                        <span className="design-chip">ID: {charm.id}</span>
                      </li>
                    );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Design;
