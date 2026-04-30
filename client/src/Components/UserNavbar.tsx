import  { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const UserNavbar = ({ searchTerm, setSearchTerm }: NavbarProps) => {
  const userName = localStorage.getItem("name") || "User";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const res = await axios.get("http://localhost:3000/getCart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const count = res.data.data.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
        setCartCount(count);
      } catch (error) { console.error(error); }
    };
    if (token) fetchCartCount();
    window.addEventListener("cartUpdated", fetchCartCount);
    return () => window.removeEventListener("cartUpdated", fetchCartCount);
  }, [token]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg bg-white sticky-top border-bottom py-3">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4" to="/userDashboard" style={{ color: "#3e2723" }}>
          E<span style={{ color: "#8d6e63" }}>SHOP</span>
        </Link>

        <div className="mx-lg-5 flex-grow-1 d-none d-md-block">
          <div className="position-relative w-75 mx-auto">
            <input 
              type="text" 
              className="form-control border-0 bg-light rounded-pill px-4 py-2" 
              placeholder="Search modern essentials..."
              style={{ fontSize: "0.9rem" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted">🔍</span>
          </div>
        </div>
        <div className="d-flex align-items-center gap-4">
          <Link 
            to="/userDashboard" 
            className={`text-decoration-none small fw-bold ${isActive('/userDashboard') ? 'text-dark' : 'text-muted'}`}
            style={{ letterSpacing: '0.5px' }}
          >
            SHOP
          </Link>
          
          <Link 
            to="/orderHistory" 
            className={`text-decoration-none small fw-bold ${isActive('/orderHistory') ? 'text-dark' : 'text-muted'}`}
            style={{ letterSpacing: '0.5px' }}
          >
            ORDERS
          </Link>
          <Link to="/cart" className="position-relative text-dark">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger border border-white" style={{ fontSize: '0.55rem' }}>
                {cartCount}
              </span>
            )}
          </Link>

          <div className="d-flex align-items-center border-start ps-4 ms-2">
            <div className="me-3 text-end d-none d-sm-block">
              <span className="d-block fw-bold small text-dark" style={{ lineHeight: '1' }}>{userName}</span>
              <button onClick={handleLogout} className="btn btn-link p-0 text-danger text-decoration-none" style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>
                LOGOUT
              </button>
            </div>
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
              style={{ width: "38px", height: "38px", backgroundColor: "#3e2723" }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;




