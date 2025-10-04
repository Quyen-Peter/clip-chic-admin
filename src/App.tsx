import React from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "../src/routes/AppRouter";
import Header from "../src/component/Header";
import Sidebar from "../src/component/Sidebar";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="header-container">
          <Header />
        </div>
        
        <div className="main-layout">
          <div className="sidebar">
            <Sidebar />
          </div>

          <div className="content">
            <AppRouter />
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
