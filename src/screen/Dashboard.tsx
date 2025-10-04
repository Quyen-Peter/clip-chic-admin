import { get } from "http";
import { useEffect, useState } from "react";

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    salesCount: number;
  }
  
  interface Order {
    id: string;
    customer: string;
    date: string;
    total: number;
    products: { productId: string; quantity: number }[];
  }
  
  interface Customer {
    id: string;
    name: string;
    orders: number;
  }
  
  interface DashboardData {
    products: Product[];
    orders: Order[];
    customers: Customer[];
  }

const Dashboard = () =>{
    const [data, setData] = useState<any>(null);

    useEffect(() => {
      fetch("/dashboad.json") 
        .then((res) => res.json())
        .then((result) => setData(result))
        .catch((err) => console.error("Fetch error:", err));
    }, []);


    const getDayRang = (date: Date) =>{
        const start = new Date(data);
        start.setHours( 0, 0, 0, 0);
        const end = new Date(data);
        end.setHours(23, 59, 59, 999);
        return{start, end};
    }

    const now = new Date();
    const {start: startToday, end: endToday} = getDayRang(now);

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1 );
    const {start: startYesterday, end: endYesterday} = getDayRang(yesterday);

    // const todayOrder = data.orders.filter((o) =>{
    //     const d = new Date(o.data);
    //     return d >= startToday && d <= endToday;
    // });


    return(
        <div>
            <div>
                <div>
                    
                </div>
            </div>
        </div>
    )
}

export default Dashboard;