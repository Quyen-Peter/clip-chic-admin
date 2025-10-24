import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../screen/Dashboard";
import Orders from "../screen/Orders";   
import Products from "../screen/Products";
import Customers from "../screen/Customers";
import Orther from "../screen/Orther";
import User from "../screen/User";
import Voucher from "../screen/Voucher";
import ProductDetail from "../screen/ProductDetail";
import OrderDetail from "../screen/OrderDetail";
import CreateProduct from "../screen/CreateProduct";
import BlindBoxes from "../screen/BlindBoxes";
import BlindBoxDetail from "../screen/BlindBoxDetail";
import CreateBlindBox from "../screen/CreateBlindBox";

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
            <Route path="/Orther" element={<Orther />} />
            <Route path="/ProductDetail/:id" element={<ProductDetail />} />
            <Route path="/BlindBoxes" element={<BlindBoxes />} />
            <Route path="/BlindBoxDetail/:id" element={<BlindBoxDetail />} />
            <Route path="/CreateBlindBox" element={<CreateBlindBox />} />
            <Route path="/OrderDetail/:id" element={<OrderDetail />} />
            <Route path="/CreateProduct" element={<CreateProduct />} />
        </Routes>
    )
}

export default AppRouter;
