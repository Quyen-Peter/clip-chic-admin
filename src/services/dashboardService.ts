const API_URL = "https://clipnchic-cnaeasa8eyftfqcg.southeastasia-01.azurewebsites.net";

export interface DailyOrderData {
  countOrder: number;
  totalSales: number;
  countOrderCancel: number;
}

export interface TopBlindbox {
  id: number;
  name: string;
  quantitySold: number;
  images: { id: number; name: string; address: string }[];
}

export interface TopProduct {
  id: number;
  name: string;
  quantitySold: number;
  images: { id: number; name: string; address: string }[];
}

export interface YearlySalesResponse {
  year: number;
  monthlySales: {
    month: number;
    ordersCount: number;
    salesTotal: number;
  }[];
}

export const fetchDailyOrder = async (token?: string): Promise<DailyOrderData> => {
  try {
    const res = await fetch(`${API_URL}/api/Order/DailyOrder`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("❌ Lỗi khi lấy dữ liệu DailyOrder:", err);
    throw err;
  }
};

export const fetchMonthlyOrder = async (token?: string) => {
  try {
    const res = await fetch(`${API_URL}/api/Order/MonthlyOrder`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("❌ Lỗi khi lấy dữ liệu MonthlyOrder:", err);
    throw err;
  }
};

export const fetchTopBlindboxes = async (token?: string): Promise<TopBlindbox[]> => {
  try {
    const res = await fetch(`${API_URL}/api/Order/sales/top-blindboxes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("❌ Lỗi khi lấy top blindbox:", err);
    throw err;
  }
};

export const fetchTopProducts = async (token?: string): Promise<TopProduct[]> => {
  try {
    const res = await fetch(`${API_URL}/api/Order/sales/top-products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("❌ Lỗi khi lấy top sản phẩm:", err);
    throw err;
  }
};


export const fetchYearlySalesSummary = async (
  year: number
): Promise<YearlySalesResponse> => {
  try {
    const res = await fetch(
      `${API_URL}/api/Order/YearlySalesSummary?year=${year}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("❌ Lỗi khi lấy dữ liệu doanh thu năm:", err);
    throw err;
  }
};