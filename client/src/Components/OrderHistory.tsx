import { useState, useEffect } from "react";
import axios from "axios";
import UserNavbar from "./UserNavbar";
import { Link } from "react-router-dom";

const OrderHistory = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:3000/getOrder", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="vh-100 d-flex justify-content-center align-items-center">
      <div className="spinner-border text-dark" role="status"></div>
    </div>
  );

  return (
    <div className="min-vh-100 bg-white">
      <UserNavbar searchTerm="" setSearchTerm={() => {}} />

      <div className="container py-5">
        <h2 className="fw-bold mb-5" style={{ color: "#3e2723", letterSpacing: "1px" }}>
          PURCHASE HISTORY
        </h2>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-5 border rounded-0 bg-light">
            <p className="text-muted mb-4">You haven't placed any orders yet.</p>
            <Link to="/userDashboard" className="btn btn-dark rounded-0 px-5 fw-bold">
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table border align-middle">
              <thead style={{ backgroundColor: "#fdfaf9" }}>
                <tr>
                  <th className="py-3 px-4 border-0">ORDER ID</th>
                  <th className="py-3 border-0">DATE</th>
                  <th className="py-3 border-0">TOTAL</th>
                  <th className="py-3 border-0">STATUS</th>
                  <th className="py-3 px-4 border-0 text-end">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 py-4 fw-bold small text-uppercase">
                      #{order._id.slice(-8)}
                    </td>
                    <td className="text-muted small">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="fw-bold" style={{ color: "#3e2723" }}>
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td>
                      <span 
                        className="badge rounded-0 px-3 py-2 text-uppercase" 
                        style={{ 
                          backgroundColor: order.status === "Delivered" ? "#e8f5e9" : "#efebe9", 
                          color: order.status === "Delivered" ? "#2e7d32" : "#8d6e63",
                          fontSize: "0.65rem" 
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 text-end">
                      <Link 
                        to={`/orderDetails/${order._id}`}
                        className="btn btn-sm btn-outline-dark rounded-0 fw-bold px-3"
                        style={{ fontSize: "0.7rem" }}
                      >
                        VIEW DETAILS
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
