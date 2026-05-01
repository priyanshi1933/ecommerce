import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import AdminNavbar from "./AdminNavbar";

const Dashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:3000/admin/allOrders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orderData = res.data.data;
      setOrders(orderData);

      const revenue = orderData.reduce(
        (acc: number, curr: any) =>
          curr.paymentStatus === "Success" ? acc + curr.totalAmount : acc,
        0,
      );

      setStats({
        totalRevenue: revenue,
        totalOrders: orderData.length,
        totalUsers: new Set(orderData.map((o: any) => o.userId?._id)).size,
      });

      setLoading(false);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await toast.promise(
        axios.patch(
          `http://localhost:3000/admin/updateStatus/${orderId}`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        {
          loading: "Updating...",
          success: "Status Updated!",
          error: "Failed to update",
        },
      );
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border"></div>
      </div>
    );

  return (
    <>
     <AdminNavbar />
    <div className="min-vh-100 bg-light p-4">
      <Toaster position="top-right" />
     
      <div className="container">
        <div className="row g-4 mb-5 ">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 rounded-0 text-center">
              <small className="text-muted fw-bold">TOTAL REVENUE</small>
              <h2 className="fw-bold mb-0">${stats.totalRevenue.toFixed(2)}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 rounded-0 text-center bg-dark text-white">
              <small className="text-white-50 fw-bold">TOTAL ORDERS</small>
              <h2 className="fw-bold mb-0">{stats.totalOrders}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 rounded-0 text-center">
              <small className="text-muted fw-bold">UNIQUE CUSTOMERS</small>
              <h2 className="fw-bold mb-0">{stats.totalUsers}</h2>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-0">
          <div className="card-header bg-white border-0 py-3">
            <h5 className="fw-bold m-0">Recent Orders</h5>
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="bg-light">
                <tr className="small text-muted">
                  <th className="ps-4">CUSTOMER</th>
                  <th>ORDERED PRODUCTS</th> 
                  <th>TOTAL</th>
                  <th>PAYMENT</th>
                  <th>STATUS</th>
                  <th className="pe-4">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="ps-4">
                      <div className="fw-bold small">
                        {order.userId?.name || "Guest"}
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {order.userId?.email}
                      </div>
                    </td>

                    <td>
                      {order.items.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="d-flex align-items-center gap-2 mb-2"
                        >
                          <img
                            src={`http://localhost:3000/uploads/${item.image}`}
                            alt={item.name}
                            style={{
                              width: "35px",
                              height: "45px",
                              objectFit: "cover",
                            }}
                            className="border"
                            onError={(e) => {
                              e.currentTarget.src = "https://placeholder.com";
                            }}
                          />
                          <div>
                            <div
                              className="fw-bold small"
                              style={{ lineHeight: "1" }}
                            >
                              {item.name}
                            </div>
                            <small
                              className="text-muted"
                              style={{ fontSize: "0.65rem" }}
                            >
                              {item.color} / {item.size} (x{item.quantity})
                            </small>
                          </div>
                        </div>
                      ))}
                    </td>

                    <td className="fw-bold">${order.totalAmount.toFixed(2)}</td>
                    <td>
                      <span
                        className={`badge rounded-0 ${order.paymentStatus === "Success" ? "bg-success" : "bg-warning text-dark"}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border rounded-0">
                        {order.status}
                      </span>
                    </td>
                    <td className="pe-4">
                      <select
                        className="form-select form-select-sm rounded-0 border-dark"
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateStatus(order._id, e.target.value)
                        }
                      >
                        <option value="Placed">Placed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;
