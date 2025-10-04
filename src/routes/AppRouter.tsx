import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../screen/Dashboard";
import Orders from "../screen/Orders";   
import Products from "../screen/Products";
import Customers from "../screen/Customers";
import Shipping from "../screen/Shipping";
import User from "../screen/User";
import Voucher from "../screen/Voucher";
import ProductDetail from "../screen/ProductDetail";

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/Dashboard" replace />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/Orders" element={<Orders />} />
            <Route path="/Products" element={<Products />} />
            <Route path="/Customers" element={<Customers />} />
            <Route path="/Voucher" element={<Voucher />} />
            <Route path="/User" element={<User />} />
            <Route path="/Shipping" element={<Shipping />} />
            <Route path="/ProductDetail/:id" element={<ProductDetail />} />
        </Routes>
    )
}

export default AppRouter;