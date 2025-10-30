import { useEffect, useState } from "react";
import {
  fetchCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  Collection,
} from "../services/OrtherService";
import "../css/Orther.css";
import {
  fetchShips,
  createShip,
  updateShip,
  deleteShip,
  Ship,
} from "../services/OrtherService";

const Orther = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
  });
  const [editing, setEditing] = useState<Collection | null>(null);

  const [ships, setShips] = useState<Ship[]>([]);
  const [newShip, setNewShip] = useState({ name: "", price: 0 });
  const [editingShip, setEditingShip] = useState<Ship | null>(null);

  const loadCollections = async () => {
    try {
      const data = await fetchCollections();
      setCollections(data);
    } catch (err) {
      console.error("Không thể tải collections:", err);
    }
  };

  const loadShips = async () => {
    try {
      const data = await fetchShips();
      setShips(data);
    } catch (err) {
      console.error("Không thể tải danh sách ship:", err);
    }
  };

  useEffect(() => {
    loadCollections();
    loadShips();
  }, []);

  const handleCreate = async () => {
    if (!newCollection.name.trim()) return alert("Nhập tên Collection!");
    await createCollection(newCollection);
    setNewCollection({ name: "", description: "" });
    loadCollections();
  };

  const handleUpdate = async () => {
    if (!editing) return;
    await updateCollection(editing);
    setEditing(null);
    loadCollections();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      await deleteCollection(id);
      loadCollections();
    }
  };

  const handleCreateShip = async () => {
    if (!newShip.name.trim()) return alert("Nhập tên phương thức vận chuyển!");
    await createShip(newShip);
    setNewShip({ name: "", price: 0 });
    loadShips();
  };

  const handleUpdateShip = async () => {
    if (!editingShip) return;
    await updateShip(editingShip);
    setEditingShip(null);
    loadShips();
  };

  const handleDeleteShip = async (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa phương thức này?")) {
      await deleteShip(id);
      loadShips();
    }
  };

  return (
    <div className="orther-container">
      <h2 className="page-title">Quản lý Collection</h2>

      {/* Form thêm mới */}
      <div className="collection-form card">
        <h3>Thêm Collection mới</h3>
        <div className="form-group">
          <input
            type="text"
            placeholder="Tên Collection"
            value={newCollection.name}
            onChange={(e) =>
              setNewCollection({ ...newCollection, name: e.target.value })
            }
          />
          <textarea
            placeholder="Mô tả"
            value={newCollection.description}
            onChange={(e) =>
              setNewCollection({
                ...newCollection,
                description: e.target.value,
              })
            }
          />
        </div>
        <button className="btn-add" onClick={handleCreate}>
          + Thêm mới
        </button>
      </div>

      {/* Form chỉnh sửa */}
      {editing && (
        <div className="collection-edit card">
          <h3>Chỉnh sửa Collection</h3>
          <input
            type="text"
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
          />
          <textarea
            value={editing.descript}
            onChange={(e) =>
              setEditing({ ...editing, descript: e.target.value })
            }
          />
          <div className="edit-actions">
            <button className="btn-save" onClick={handleUpdate}>
              💾 Lưu
            </button>
            <button className="btn-cancel" onClick={() => setEditing(null)}>
              ✖ Hủy
            </button>
          </div>
        </div>
      )}

      {/* Danh sách */}
      <div className="card">
        <h3>Danh sách Collection</h3>
        <table className="collection-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Mô tả</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((col) => (
              <tr key={col.id}>
                <td>{col.id}</td>
                <td>{col.name}</td>
                <td>{col.descript || "—"}</td>
                <td>
                  <button className="btn-edit" onClick={() => setEditing(col)}>
                    Sửa
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(col.id!)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr />
      <div className="card">
        <h3>Quản lý phương thức giao hàng</h3>

        {/* Form thêm mới */}
        <div className="collection-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Tên phương thức giao hàng"
              value={newShip.name}
              onChange={(e) => setNewShip({ ...newShip, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Giá (VND)"
              value={newShip.price}
              onChange={(e) =>
                setNewShip({ ...newShip, price: Number(e.target.value) })
              }
            />
          </div>
          <button className="btn-add" onClick={handleCreateShip}>
            + Thêm mới
          </button>
        </div>

        {/* Form chỉnh sửa */}
        {editingShip && (
          <div className="collection-edit card">
            <h4>Chỉnh sửa phương thức giao hàng</h4>
            <input
              type="text"
              value={editingShip.name}
              onChange={(e) =>
                setEditingShip({ ...editingShip, name: e.target.value })
              }
            />
            <input
              type="number"
              value={editingShip.price}
              onChange={(e) =>
                setEditingShip({
                  ...editingShip,
                  price: Number(e.target.value),
                })
              }
            />
            <div className="edit-actions">
              <button className="btn-save" onClick={handleUpdateShip}>
                💾 Lưu
              </button>
              <button
                className="btn-cancel"
                onClick={() => setEditingShip(null)}
              >
                ✖ Hủy
              </button>
            </div>
          </div>
        )}

        {/* Danh sách */}
        <table className="collection-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Giá (VND)</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {ships.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
                <td>{s.price.toLocaleString("vi-VN")}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => setEditingShip(s)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteShip(s.id!)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orther;
