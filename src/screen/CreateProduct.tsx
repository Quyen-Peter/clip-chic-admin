import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../css/ProductDetail.css";
import React, { useEffect, useState } from "react";
import editIcon from "../asesst/pencil.png";
import trashIcon from "../asesst/bin.png";

const CreateProduct = () =>{
   const { id } = useParams();
  const navigator = useNavigate();
  const [image1, setImage1] = React.useState<string | undefined>(undefined);
  const [image2, setImage2] = React.useState<string | undefined>(undefined);
  const [image3, setImage3] = React.useState<string | undefined>(undefined);
  const [image4, setImage4] = React.useState<string | undefined>(undefined);
  const [image5, setImage5] = React.useState<string | undefined>(undefined);
  const [colors, setColors] = useState<{ id: number; name: string }[]>([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    const data = [
      { id: 1, name: "Vàng" },
      { id: 2, name: "Đỏ" },
      { id: 3, name: "trắng" },
    ];
    setColors(data);
  }, []);

  const handleChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage1(URL.createObjectURL(file));
    }
  };

  const handleRemove1 = () => {
    setImage1("");
  };

  const handleChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage2(URL.createObjectURL(file));
    }
  };

  const handleRemove2 = () => {
    setImage2("");
  };

  const handleChange3 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage3(URL.createObjectURL(file));
    }
  };

  const handleRemove3 = () => {
    setImage3("");
  };

  const handleChange4 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage4(URL.createObjectURL(file));
    }
  };

  const handleRemove4 = () => {
    setImage4("");
  };

  const handleChange5 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage5(URL.createObjectURL(file));
    }
  };

  const handleRemove5 = () => {
    setImage5("");
  };

  return (
    <div className="container-product-detail">
      <div className="bnt-container">
        <button onClick={() => navigator("/Products")} className="bnt-back">Trở lại</button>
        <div className="bnt-edit-delete">
          <button className="edit-bnt">Xác nhận</button>
        </div>
      </div>

      <div className="content-container-product">
        <div>
          <p className="title-img-product">Ảnh sản phẩm</p>
          <div className="container-img">
            <div className="image-box">
              {!image1 && <span className="placeholder">Chưa có ảnh</span>}

              {image1 && (
                <img src={image1} alt="preview" className="preview-img" />
              )}

              <div className="overlay">
                <label className="btn-icon">
                  <img src={editIcon} alt="edit" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange1}
                    hidden
                  />
                </label>
                <button className="btn-icon" onClick={handleRemove1}>
                  <img src={trashIcon} alt="delete" />
                </button>
              </div>
            </div>
            <div className="image-box">
              {!image2 && <span className="placeholder">Chưa có ảnh</span>}

              {image2 && (
                <img src={image2} alt="preview" className="preview-img" />
              )}

              <div className="overlay">
                <label className="btn-icon">
                  <img src={editIcon} alt="edit" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange2}
                    hidden
                  />
                </label>
                <button className="btn-icon" onClick={handleRemove2}>
                  <img src={trashIcon} alt="delete" />
                </button>
              </div>
            </div>
          </div>

          <div className="container-img">
            <div className="image-box">
              {!image3 && <span className="placeholder">Chưa có ảnh</span>}

              {image3 && (
                <img src={image3} alt="preview" className="preview-img" />
              )}

              <div className="overlay">
                <label className="btn-icon">
                  <img src={editIcon} alt="edit" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange3}
                    hidden
                  />
                </label>
                <button className="btn-icon" onClick={handleRemove3}>
                  <img src={trashIcon} alt="delete" />
                </button>
              </div>
            </div>
            <div className="image-box">
              {!image4 && <span className="placeholder">Chưa có ảnh</span>}

              {image4 && (
                <img src={image4} alt="preview" className="preview-img" />
              )}

              <div className="overlay">
                <label className="btn-icon">
                  <img src={editIcon} alt="edit" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange4}
                    hidden
                  />
                </label>
                <button className="btn-icon" onClick={handleRemove4}>
                  <img src={trashIcon} alt="delete" />
                </button>
              </div>
            </div>
          </div>

          <div className="container-img">
            <div className="image-box">
              {!image5 && <span className="placeholder">Chưa có ảnh</span>}

              {image5 && (
                <img src={image5} alt="preview" className="preview-img" />
              )}

              <div className="overlay">
                <label className="btn-icon">
                  <img src={editIcon} alt="edit" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange5}
                    hidden
                  />
                </label>
                <button className="btn-icon" onClick={handleRemove5}>
                  <img src={trashIcon} alt="delete" />
                </button>
              </div>
            </div>
            <div className="image-box">
              {/* {!image && <span className="placeholder">Chưa có ảnh</span>}

              {image && (
                <img src={image} alt="preview" className="preview-img" />
              )}

              <div className="overlay">
                <label className="btn-icon">
                  <img src={editIcon} alt="edit" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    hidden
                  />
                </label>
                <button className="btn-icon" onClick={handleRemove}>
                  <img src={trashIcon} alt="delete" />
                </button>
              </div> */}
            </div>
          </div>
        </div>

        <div className="right-txt-product">
          <p className="title-product">Product name:</p>
          <input type="text" className="input-product-name" />

          <p className="title-product">Description:</p>
          <textarea rows={5} className="input-product-discription" />
          
          <p className="title-product">Dimensions:</p>
          <input type="text" className="product-short-input" />

          <p className="title-product">Color:</p>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="product-short-input-select"
          >
            <option value="">-- Select color --</option>
            {colors.map((color) => (
              <option key={color.id} value={color.name}>
                {color.name}
              </option>
            ))}
          </select>

          <p className="title-product">Price:</p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input type="number" className="product-short-input" />
            <p className="title-product">VND</p>
          </div>

          <p className="title-product">Availability:</p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button>-</button>
            <span>10</span>
            <button>+</button>
            <p className="title-product">in stock</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateProduct;