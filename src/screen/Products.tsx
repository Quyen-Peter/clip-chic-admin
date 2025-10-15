import React from "react";
import "../css/Product.css";
import edit from "../asesst/pencil.png";
import trast from "../asesst/bin.png";
import { useNavigate } from "react-router-dom";
import plus from "../asesst/plus.png";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch("/hairclips.json")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.hairClips);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  return (
    <div className="container">
      <div className="header">
        <div className="header-flex">
          <h2>KẸP TÓC CÓ SẴN</h2>
          <button className="add-more-bnt" onClick={() => navigate("/CreateProduct")}>
            <h2>Thêm kẹp tóc</h2>
          </button>
        </div>

        <div className="header-product">
          <p>Danh sách các kẹp tóc có sẵn trong hệ thống</p>
          <p className="header-product-show">
            Hiển thị 1–7 trong số {products.length} sản phẩm{" "}
          </p>
        </div>
      </div>

      <div className="product-list">
        <div className="product-header">
          <span className="product-header-image">Ảnh</span>
          <span className="product-header-name">Tên sản phẩm</span>
          <span className="product-header-price">Giá</span>
          <span className="product-header-quantity">Số lượng</span>
          <span className="product-header-action">Hoạt động</span>
        </div>
        {products.map((product) => (
          <div className="product-item" key={product.id}>
            <span className="product-image">
              <img src={product.image} alt={product.name} />
            </span>
            <span className="product-name">
              {product.name}
              <span className="product-description">
                {" "}
                {product.description}
              </span>
            </span>
            <span className="product-price">
              {product.price.toLocaleString()} VND
            </span>
            <span className="product-quantity">{product.stock}</span>
            <span className="product-action">
              <button
                className="edit-button"
                onClick={() => navigate(`/ProductDetail/${product.id}`)}
              >
                <img src={edit} />
              </button>

              <button className="delete-button">
                <img src={trast} />
              </button>
            </span>
          </div>
        ))}
      </div>

      <div className="header">
        <div className="header-flex">
          <h2>Bộ sưu tập Blindbox</h2>
          <button className="add-more-bnt">
            <h2>Thêm bộ sưu tập Blindbox</h2>
          </button>
        </div>
        <div className="header-product">
          <p>Danh sách các Bộ sưu tập Blindbox trong hệ thống</p>
          <p className="header-product-show">
            Hiển thị 1–7 trong số {products.length} sản phẩm{" "}
          </p>
        </div>
      </div>

      <div className="product-list">
        <div className="product-header">
          <span className="product-header-image">Ảnh</span>
          <span className="product-header-name">Tên sản phẩm</span>
          <span className="product-header-price">Giá</span>
          <span className="product-header-quantity">Số lượng</span>
          <span className="product-header-action">Hoạt động</span>
        </div>
        {products.map((product) => (
          <div className="product-item" key={product.id}>
            <span className="product-image">
              <img src={product.image} alt={product.name} />
            </span>
            <span className="product-name-blindbox">{product.name}</span>
            <span className="product-price">
              {product.price.toLocaleString()} VND
            </span>
            <span className="product-quantity">{product.stock}</span>
            <span className="product-action">
              <button
                className="edit-button"
                onClick={() => navigate(`/ProductDetail/${product.id}`)}
              >
                <img src={edit} />
              </button>

              <button className="delete-button">
                <img src={trast} />
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
