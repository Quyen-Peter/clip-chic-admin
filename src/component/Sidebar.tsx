import background from "../asesst/backgroundNavbar.png";
import "../css/Sidebar.css";
import { NavLink, useLocation } from "react-router-dom";
import icon from "../asesst/IconRightDown.png";

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: "/Dashboard", label: "Trang chủ" },
    { path: "/Orders", label: "Đơn hàng" },
    { path: "/Products", label: "Sản phẩm" },
    { path: "/BlindBoxes", label: "Blindboxes" },
    { path: "/Customers", label: "Thiết kế" },
    { path: "/Voucher", label: "Promotion / Voucher" },
    { path: "/User", label: "Người dùng" },
    { path: "/Orther", label: "Khác" }
  ];

  return (
    <div className="sidebar-container">
      <img src={background} className="background-sidebar" />
      <div className="sidebar-link-container">
        {menuItems.map((item, index) => (
          <div key={index} className="sidebar-item">
            <img 
              src={icon} 
              className={`sidebar-icon ${location.pathname === item.path ? 'active' : ''}`} 
            />
            <NavLink 
              to={item.path} 
              className={({isActive}) => "sidebar-link" + (isActive ? " active" : "")}
            >
              {item.label}
            </NavLink>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
