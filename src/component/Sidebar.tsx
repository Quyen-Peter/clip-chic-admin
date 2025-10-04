import background from "../asesst/backgroundNavbar.png";
import "../css/Sidebar.css";
import { NavLink, useLocation } from "react-router-dom";
import icon from "../asesst/IconRightDown.png";

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: "/Dashboard", label: "Dashboard" },
    { path: "/Orders", label: "Orders" },
    { path: "/Products", label: "Products" },
    { path: "/Customers", label: "Customers" },
    { path: "/Voucher", label: "Promotion / Voucher" },
    { path: "/User", label: "User" },
    { path: "/Shipping", label: "Shipping & Payment" }
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
