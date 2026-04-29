import React from "react";
import { useNavigate, Link } from "react-router-dom";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("name") || "Admin";
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm py-3 sticky-top"
      style={{ backgroundColor: "#ffffff", borderBottom: "3px solid #5d4037" }}
    >
      <div className="container">
        <Link
          className="navbar-brand d-flex align-items-center"
          to="/adminDashboard"
        >
          <span
            className="fw-bolder fs-4 tracking-tight"
            style={{ color: "#3e2723" }}
          >
            ADMIN<span style={{ color: "#8d6e63" }}>DASHBOARD</span>
          </span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="adminNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link
                className="nav-link fw-bold px-3 text-dark text-uppercase small tracking-widest"
                to="/adminDashboard"
              >
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link fw-bold px-3 text-dark text-uppercase small tracking-widest"
                to="/addProduct"
              >
                Add Product
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link fw-bold px-3 text-dark text-uppercase small tracking-widest"
                to="/displayProduct"
              >
                Display Product
              </Link>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            <div
              className="d-flex align-items-center p-2 pe-3 rounded-pill border"
              style={{ backgroundColor: "#efebe9", borderColor: "#d7ccc8" }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: "#5d4037",
                  fontSize: "0.8rem",
                }}
              >
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="ms-2">
                <span
                  className="d-block fw-bold text-dark"
                  style={{ fontSize: "0.8rem", lineHeight: "1" }}
                >
                  {adminName}
                </span>
                <span
                  style={{
                    color: "#8d6e63",
                    fontSize: "0.65rem",
                    fontWeight: "800",
                    textTransform: "uppercase",
                  }}
                >
                  ADMIN
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn ms-3 fw-bold rounded-1 px-4 text-white shadow-sm transition-all"
              style={{
                backgroundColor: "#3e2723",
                border: "none",
                fontSize: "0.85rem",
              }}
            >
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
