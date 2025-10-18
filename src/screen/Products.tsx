import React from "react";
import "../css/Product.css";
import edit from "../asesst/pencil.png";
import trast from "../asesst/bin.png";
import { useNavigate } from "react-router-dom";
import { fetchProducts, ProductListItem } from "../services/productService";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = React.useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProducts();
        if (isMounted) {
          setProducts(data);
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "Unable to load products.";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatPrice = (value: number) =>
    value > 0 ? `${value.toLocaleString("vi-VN")} VND` : "Updating";

  const formatCreatedDate = (value?: string) => {
    if (!value) return "Updating";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Updating";
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="container">
      <div className="header">
        <div className="header-flex">
          <h2>Product Catalog</h2>
          <button
            className="add-more-bnt"
            onClick={() => navigate("/CreateProduct")}
          >
            <h2>Add product</h2>
          </button>
        </div>

        <div className="header-product">
          <p>Products currently available in the system</p>
          <p className="header-product-show">
            Showing {products.length} products
          </p>
        </div>
      </div>

      <div className="product-list">
        <div className="product-header">
          <span className="product-header-image">Image</span>
          <span className="product-header-name">Product</span>
          <span className="product-header-price">Price</span>
          <span className="product-header-quantity">Stock</span>
          <span className="product-header-action">Actions</span>
        </div>
        {isLoading && (
          <div className="product-feedback">Loading products...</div>
        )}
        {error && <div className="product-feedback error">{error}</div>}
        {products.map((product) => (
          <div className="product-item" key={product.id}>
            <span className="product-image">
              {product.image ? (
                <img src={product.image} alt={product.title} />
              ) : (
                <span className="product-no-image">No image</span>
              )}
            </span>
            <span className="product-name">
              {product.title}
              <span className="product-description">
                {product.collectionName ? `Collection: ${product.collectionName}` : ""}
                {product.collectionName && product.description ? " · " : ""}
                {product.description || "No description"}
              </span>
              {product.status && (
                <span className={`product-status status-${product.status.toLowerCase()}`}>
                  {product.status}
                </span>
              )}
              <span className="product-meta">
                Created: {formatCreatedDate(product.createDate)}
              </span>
            </span>
            <span className="product-price">
              {formatPrice(product.price)}
            </span>
            <span className="product-quantity">{product.stock}</span>
            <span className="product-action">
              <button
                className="edit-button"
                onClick={() => navigate(`/ProductDetail/${product.id}`)}
              >
                <img src={edit} alt="Edit" />
              </button>

              <button className="delete-button">
                <img src={trast} alt="Delete" />
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
