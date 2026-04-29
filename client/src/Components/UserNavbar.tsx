import React from 'react'
import { useNavigate, Link } from "react-router-dom";
interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const UserNavbar = ({ searchTerm, setSearchTerm }: NavbarProps) => {
  const userName = localStorage.getItem("name") || "Guest";
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white sticky-top py-3 border-bottom shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bolder fs-3" to="/userDashboard" style={{ color: "#3e2723", letterSpacing: "1px" }}>
          E<span style={{ color: "#8d6e63" }}>SHOP</span>
        </Link>

        <div className="collapse navbar-collapse d-flex justify-content-between">
          <div className="mx-auto d-flex col-lg-5 mt-3 mt-lg-0">
            <div className="input-group">
              <input 
                type="text" 
                className="form-control rounded-start-pill bg-light border-0 px-4" 
                placeholder="Search products..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <span className="input-group-text bg-light border-0 rounded-end-pill text-muted px-3">🔍</span>
            </div>
          </div>

          <div className="d-flex align-items-center ms-auto">
            <div className="text-end me-2 d-none d-sm-block">
              <small className="d-block text-muted" style={{ fontSize: "0.7rem" }}>USER</small>
              <span className="fw-bold text-dark" style={{ fontSize: "0.85rem" }}>{userName}</span>
            </div>
            <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3 shadow-sm"
                 style={{ width: "40px", height: "40px", backgroundColor: "#5d4037" }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <button onClick={handleLogout} className="btn btn-sm btn-outline-danger rounded-pill fw-bold px-3">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default UserNavbar;
