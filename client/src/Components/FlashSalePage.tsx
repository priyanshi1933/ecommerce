import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import UserNavbar from "./UserNavbar";
import FlashSaleTimer from "../Components/FlashSaleTimer";

const FlashSalePage = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [userJoinedIds, setUserJoinedIds] = useState<string[]>([]);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get("http://localhost:3000/active");
      setSales(res.data.data);

      if (token) {
        const profile = await axios.get(
          "http://localhost:3000/profile",
          config,
        );
        setUserJoinedIds(
          profile.data.data.joinedFlashSales.map((s: any) => s._id || s),
        );
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const processFlashPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const TOAST_ID = "flash-pay";
    try {
      toast.loading("Authorizing Flash Payment...", { id: TOAST_ID });

      await new Promise((r) => setTimeout(r, 1500));

      const res = await axios.post(
        "http://localhost:3000/buyFlash",
        {
          flashSaleId: selectedSale._id,
          paymentStatus: "Success",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.success) {
        toast.success("Order Placed Successfully! ⚡", { id: TOAST_ID });
        setShowModal(false);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Payment Failed", {
        id: TOAST_ID,
      });
    }
  };

  const handleAction = async (sale: any, isStarted: boolean) => {
    if (!token) return toast.error("Please login to participate");

    if (isStarted) {
      setSelectedSale(sale);
      setShowModal(true);
    } else {
      try {
        await axios.post(
          `http://localhost:3000/preJoin`,
          { flashSaleId: sale._id },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        toast.success("Successfully Registered! 🔔");
        fetchData();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Registration failed");
      }
    }
  };

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-danger"></div>
      </div>
    );

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Toaster position="bottom-right" />
      <UserNavbar searchTerm="" setSearchTerm={() => {}} />

      <div className="container py-5">
        <h2 className="fw-bold text-center text-danger mb-5">
          ⚡ LIVE FLASH SALES ⚡
        </h2>
        <div className="row g-4">
          {sales.map((sale) => {
            const isStarted = new Date() >= new Date(sale.startTime);
            const isJoined = userJoinedIds.includes(sale._id);
            const isSoldOut = sale.soldUnits >= sale.maxUnits;

            return (
              <div className="col-md-4" key={sale._id}>
                <div className="card border-0 shadow-sm rounded-0 h-100">
                  <img
                    src={`http://localhost:3000/uploads/${sale.productId?.image?.[0]}`}
                    className="card-img-top"
                    height="200"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h5 className="fw-bold">{sale.productId?.name}</h5>
                    <h4 className="text-danger fw-bold">${sale.salePrice}</h4>
                    <div className="mb-2">
                      <small className="text-muted d-block">
                        Units Sold: {sale.soldUnits}/{sale.maxUnits}
                      </small>
                      <div
                        className="progress rounded-0"
                        style={{ height: "5px" }}
                      >
                        <div
                          className="progress-bar bg-danger"
                          style={{
                            width: `${(sale.soldUnits / sale.maxUnits) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <FlashSaleTimer
                      startTime={sale.startTime}
                      endTime={sale.endTime}
                      onStart={fetchData}
                      onEnd={fetchData}
                    />

                    <button
                      className={`btn w-100 mt-3 rounded-0 fw-bold ${isStarted ? "btn-danger" : "btn-primary"}`}
                      disabled={isSoldOut || (isJoined && !isStarted)}
                      onClick={() => handleAction(sale, isStarted)}
                    >
                      {isSoldOut
                        ? "SOLD OUT"
                        : isStarted
                          ? "BUY NOW"
                          : isJoined
                            ? "✓ REGISTERED"
                            : "JOIN NOW"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-0 border-0">
              <div className="modal-header border-0">
                <h5 className="fw-bold text-danger">⚡ FLASH CHECKOUT</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={processFlashPayment}>
                <div className="modal-body py-4">
                  <p className="small text-muted mb-4">
                    You are purchasing{" "}
                    <strong>{selectedSale?.productId?.name}</strong> at the
                    special price of <strong>${selectedSale?.salePrice}</strong>
                    .
                  </p>
                  <div className="mb-3">
                    <label className="small fw-bold">CARD NUMBER</label>
                    <input
                      type="text"
                      className="form-control rounded-0 shadow-none"
                      placeholder="1234 5678 9101 1121"
                      required
                      maxLength={16}
                    />
                  </div>
                  <div className="row">
                    <div className="col-7">
                      <label className="small fw-bold">EXPIRY</label>
                      <input
                        type="text"
                        className="form-control rounded-0 shadow-none"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="col-5">
                      <label className="small fw-bold">CVC</label>
                      <input
                        type="password"
                        className="form-control rounded-0 shadow-none"
                        placeholder="123"
                        required
                        maxLength={3}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="submit"
                    className="btn btn-danger w-100 rounded-0 fw-bold py-2"
                  >
                    CONFIRM & PAY ${selectedSale?.salePrice}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashSalePage;
