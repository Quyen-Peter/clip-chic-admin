const API_URL = "https://clipnchic-cnaeasa8eyftfqcg.southeastasia-01.azurewebsites.net";

export interface Collection {
  id?: number;
  name: string;
  descript?: string;
  products?: any[];
  blindboxes?: any[];
}

export interface Ship {
  id?: number;
  name: string;
  price: number;
}

// ✅ Lấy tất cả Collection
export const fetchCollections = async (): Promise<Collection[]> => {
  try {
    const res = await fetch(`${API_URL}/Collection/GetAll`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách Collection:", err);
    throw err;
  }
};

// ✅ Lấy theo ID
export const fetchCollectionById = async (id: number): Promise<Collection> => {
  try {
    const res = await fetch(`${API_URL}/Collection/GetById/${id}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("❌ Lỗi khi lấy Collection theo ID:", err);
    throw err;
  }
};

// ✅ Tạo mới Collection
export const createCollection = async (data: Collection): Promise<void> => {
  try {
    const res = await fetch(`${API_URL}/Collection/Create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error("❌ Lỗi khi tạo Collection:", err);
    throw err;
  }
};

// ✅ Cập nhật Collection
export const updateCollection = async (data: Collection): Promise<void> => {
  try {
    const res = await fetch(`${API_URL}/Collection/Update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật Collection:", err);
    throw err;
  }
};

// ✅ Xóa Collection theo ID
export const deleteCollection = async (id: number): Promise<void> => {
  try {
    const res = await fetch(`${API_URL}/Collection/Delete/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error("❌ Lỗi khi xóa Collection:", err);
    throw err;
  }
};



// Lấy danh sách phương thức giao hàng
export const fetchShips = async (): Promise<Ship[]> => {
  try {
    const res = await fetch(`${API_URL}/Ship/GetAll`, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách Ship:", err);
    throw err;
  }
};

// Lấy chi tiết theo ID
export const fetchShipById = async (id: number): Promise<Ship> => {
  try {
    const res = await fetch(`${API_URL}/Ship/GetById/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("❌ Lỗi khi lấy Ship theo ID:", err);
    throw err;
  }
};

// ✅ Thêm mới
export const createShip = async (data: Ship): Promise<void> => {
  try {
    const res = await fetch(`${API_URL}/Ship/Create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error("❌ Lỗi khi tạo Ship:", err);
    throw err;
  }
};

//Cập nhật
export const updateShip = async (data: Ship): Promise<void> => {
  try {
    const res = await fetch(`${API_URL}/Ship/Update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật Ship:", err);
    throw err;
  }
};

// Xóa
export const deleteShip = async (id: number): Promise<void> => {
  try {
    const res = await fetch(`${API_URL}/Ship/Delete/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error("❌ Lỗi khi xóa Ship:", err);
    throw err;
  }
};