import  { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import UserNavbar from "./UserNavbar";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/details/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(res.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId, token]);




  if (loading) return (
    <div className="vh-100 d-flex justify-content-center align-items-center">
      <div className="spinner-border text-dark" role="status"></div>
    </div>
  );

  if (!order) return <div className="text-center py-5">Order not found.</div>;

  return (
    <div className="min-vh-100 bg-white">
      <UserNavbar searchTerm="" setSearchTerm={() => {}} />
      
      <div className="container py-5">
        <button onClick={() => navigate(-1)} className="btn btn-sm btn-link text-dark text-decoration-none mb-4 p-0 fw-bold">
          &larr; BACK TO HISTORY
        </button>

        <div className="row g-5">
          <div className="col-lg-8">
            <div className="border p-4 shadow-sm rounded-0">
              <h5 className="fw-bold mb-4" style={{ color: "#3e2723" }}>ITEMS IN THIS ORDER</h5>
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom">
                  <div className="d-flex gap-3 align-items-center">
                    <div style={{ width: "80px", height: "100px", backgroundColor: "#f8f9fa" }} className="border">
                     
                      <img 
                        src={`http://localhost:3000/uploads/${item.productId?.image?.[0]}`} 
                        className="w-100 h-100 object-fit-cover" 
                        alt={item.name} 
                      />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1" style={{ color: "#3e2723" }}>{item.name}</h6>
                      <p className="text-muted small mb-0">Quantity: {item.quantity}</p>
                      <p className="text-muted small mb-0">Unit Price: ${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="fw-bold m-0" style={{ color: "#3e2723" }}>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              
              <div className="d-flex justify-content-between mt-4">
                <span className="h5 fw-bold">TOTAL PAID</span>
                <span className="h5 fw-bold" style={{ color: "#3e2723" }}>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="p-4 border shadow-sm mb-4 rounded-0" style={{ backgroundColor: "#fdfaf9" }}>
              <h5 className="fw-bold mb-3" style={{ color: "#3e2723" }}>ORDER SUMMARY</h5>
              <div className="mb-3">
                <small className="text-muted d-block uppercase tracking-widest" style={{fontSize: '0.65rem'}}>ORDER ID</small>
                <span className="fw-bold small">#{order._id.toUpperCase()}</span>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block uppercase tracking-widest" style={{fontSize: '0.65rem'}}>PAYMENT STATUS</small>
                <span className="badge bg-success rounded-0">{order.paymentStatus}</span>
              </div>
              <div className="mb-0">
                <small className="text-muted d-block uppercase tracking-widest" style={{fontSize: '0.65rem'}}>CURRENT STATUS</small>
                <span className="badge rounded-0" style={{ backgroundColor: "#3e2723", color: "white" }}>{order.status}</span>
              </div>
            </div>

            <div className="p-4 border shadow-sm rounded-0">
              <h5 className="fw-bold mb-4" style={{ color: "#3e2723" }}>TRACKING TIMELINE</h5>
              <div className="ps-3 border-start ms-2">
                {order.statusTimeline.map((step: any, i: number) => (
                  <div key={i} className="mb-4 position-relative">
                    <div 
                      className="position-absolute" 
                      style={{ 
                        left: "-23px", 
                        top: "4px", 
                        width: "12px", 
                        height: "12px", 
                        borderRadius: "50%", 
                        backgroundColor: "#3e2723",
                        border: "2px solid white"
                      }}
                    ></div>
                    <p className="fw-bold mb-0 small text-uppercase">{step.status}</p>
                    <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                      {new Date(step.updatedAt).toLocaleString()}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
