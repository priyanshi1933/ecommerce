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
  const [qty, setQty] = useState(1); // Quantity state
  const [now, setNow] = useState(new Date());

  const token = localStorage.getItem("token");
  const THEME_BROWN = "#3e2723";

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const incrementQty = () => {
    const maxAvailable = selectedSale.maxUnits - selectedSale.soldUnits;
    if (qty < maxAvailable) {
      setQty(qty + 1);
    } else {
      toast.error(`Only ${maxAvailable} units remaining!`, { id: "qty-limit" });
    }
  };

  const decrementQty = () => {
    if (qty > 1) {
      setQty(qty - 1);
    }
  };

  const processFlashPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const TOAST_ID = "flash-pay";
    try {
      toast.loading("Processing Flash Payment...", { id: TOAST_ID });
      await new Promise((r) => setTimeout(r, 1000));

      const res = await axios.post(
        "http://localhost:3000/buyFlash",
        {
          flashSaleId: selectedSale._id,
          paymentStatus: "Success",
          quantity: qty,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        toast.success("Purchase Successful! ⚡", { id: TOAST_ID });
        setShowModal(false);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Payment Failed", {
        id: TOAST_ID,
      });
    }
  };

  const handleAction = (sale: any, isStarted: boolean) => {
    if (!token) return toast.error("Please login to participate");
    if (isStarted) {
      setSelectedSale(sale);
      setQty(1); // Reset to 1 when opening modal
      setShowModal(true);
    } else {
      joinSale(sale._id);
    }
  };

  const joinSale = async (id: string) => {
    try {
      await axios.post(
        `http://localhost:3000/preJoin`,
        { flashSaleId: id },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Successfully Registered! 🔔");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-white">
        <div className="spinner-border" style={{ color: THEME_BROWN }}></div>
      </div>
    );

  return (
    <div className="min-vh-100 bg-white">
      <Toaster position="bottom-right" />
      <UserNavbar searchTerm="" setSearchTerm={() => {}} />

      <div className="container py-5">
        <header className="text-center mb-5">
          <h2
            className="fw-bold text-uppercase"
            style={{ color: THEME_BROWN, letterSpacing: "2px" }}
          >
            ⚡ Exclusive Flash Drops
          </h2>
          <p className="text-muted">
            High-speed checkout. Limited time availability.
          </p>
        </header>

        <div className="row g-4">
          {sales.map((sale) => {
            const isStarted = now >= new Date(sale.startTime);
            const isJoined = userJoinedIds.includes(sale._id);
            const isSoldOut = sale.soldUnits >= sale.maxUnits;
            const remaining = sale.maxUnits - sale.soldUnits;

            return (
              <div className="col-md-4" key={sale._id}>
                <div className="card border-0 rounded-0 h-100 shadow-sm transition-all bg-white overflow-hidden">
                  <div
                    className="position-relative"
                    style={{ height: "280px" }}
                  >
                    <img
                      src={`http://localhost:3000/uploads/${
                        sale.productId?.variants?.findIndex(
                          (v: any) =>
                            v._id === (sale.variantId?._id || sale.variantId),
                        ) !== -1
                          ? sale.productId.image[
                              sale.productId.variants.findIndex(
                                (v: any) =>
                                  v._id ===
                                  (sale.variantId?._id || sale.variantId),
                              )
                            ]
                          : sale.productId?.image[0] 
                      }`}
                      className="w-100 h-100 object-fit-cover"
                      alt="product"
                    />

                    {isStarted && !isSoldOut && (
                      <div
                        className="position-absolute top-0 start-0 m-3 px-2 py-1 bg-danger text-white fw-bold"
                        style={{ fontSize: "0.6rem" }}
                      >
                        LIVE
                      </div>
                    )}
                  </div>

                  <div className="card-body p-4 text-center d-flex flex-column">
                    <h5 className="fw-bold mb-2 text-dark">
                      {sale.productId?.name}
                    </h5>

                    <div className="mb-2">
                      <small
                        className="text-uppercase text-muted fw-bold"
                        style={{ fontSize: "0.6rem" }}
                      >
                        {
                          sale.productId?.variants?.find(
                            (v: any) =>
                              v._id === (sale.variantId?._id || sale.variantId),
                          )?.color
                        }{" "}
                        /
                        {
                          sale.productId?.variants?.find(
                            (v: any) =>
                              v._id === (sale.variantId?._id || sale.variantId),
                          )?.size
                        }
                      </small>
                    </div>

                    <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                      <span
                        className="h4 fw-bold m-0"
                        style={{ color: THEME_BROWN }}
                      >
                        ${sale.salePrice}
                      </span>
                      <span className="text-muted text-decoration-line-through small">
                        $
                        {sale.productId?.variants?.find(
                          (v: any) =>
                            v._id === (sale.variantId?._id || sale.variantId),
                        )?.price }
                      </span>
                    </div>

                    <div
                      className="mb-4 mx-auto w-100"
                      style={{ maxWidth: "220px" }}
                    >
                      <div
                        className="progress rounded-0 mb-1"
                        style={{ height: "3px", backgroundColor: "#eee" }}
                      >
                        <div
                          className="progress-bar"
                          style={{
                            width: `${(sale.soldUnits / sale.maxUnits) * 100}%`,
                            backgroundColor: isSoldOut
                              ? "#d32f2f"
                              : THEME_BROWN,
                          }}
                        ></div>
                      </div>
                      <div
                        className="d-flex justify-content-between"
                        style={{ fontSize: "0.65rem" }}
                      >
                        <span className="text-muted text-uppercase tracking-tighter">
                          Availability
                        </span>
                        <span className="fw-bold">
                          {isSoldOut ? "0" : sale.maxUnits - sale.soldUnits}{" "}
                          LEFT
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <FlashSaleTimer
                        startTime={sale.startTime}
                        endTime={sale.endTime}
                      />
                      <button
                        className="btn w-100 mt-4 rounded-0 py-2 fw-bold text-uppercase text-white border-0 shadow-none"
                        style={{
                          backgroundColor: isSoldOut ? "#d32f2f" : THEME_BROWN,
                          letterSpacing: "1px",
                          fontSize: "0.8rem",
                        }}
                        disabled={isSoldOut || (isJoined && !isStarted)}
                        onClick={() => handleAction(sale, isStarted)}
                      >
                        {isSoldOut
                          ? "Sold Out"
                          : isStarted
                            ? "Purchase Now"
                            : isJoined
                              ? "✓ Registered"
                              : "Register Now"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Brown Mock Payment Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-0 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5
                  className="fw-bold text-uppercase"
                  style={{ color: THEME_BROWN }}
                >
                  Brown Mock Checkout
                </h5>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={processFlashPayment}>
                <div className="modal-body py-4">
                  <div
                    className="p-3 mb-4 border"
                    style={{
                      backgroundColor: "#fdfaf9",
                      borderColor: "#efebe9",
                    }}
                  >
                    <p className="small mb-1 text-muted">
                      Item: {selectedSale?.productId?.name}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <h4
                        className="fw-bold m-0"
                        style={{ color: THEME_BROWN }}
                      >
                        Total: ${(selectedSale?.salePrice * qty).toFixed(2)}
                      </h4>

                      {/* Fixed Quantity Control */}
                      <div className="d-flex align-items-center border bg-white">
                        <button
                          type="button"
                          className="btn btn-sm shadow-none px-3 py-1 border-end rounded-0"
                          onClick={decrementQty}
                        >
                          -
                        </button>
                        <span className="px-3 fw-bold">{qty}</span>
                        <button
                          type="button"
                          className="btn btn-sm shadow-none px-3 py-1 border-start rounded-0"
                          onClick={incrementQty}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="small fw-bold mb-1 text-muted text-uppercase">
                      Payment Details
                    </label>
                    <input
                      type="text"
                      className="form-control rounded-0 shadow-none border-1 mb-2 py-2"
                      style={{ borderColor: "#efebe9" }}
                      placeholder="Card Number"
                      required
                    />
                    <div className="row g-2">
                      <div className="col-6">
                        <input
                          type="text"
                          className="form-control rounded-0 shadow-none border-1 py-2"
                          style={{ borderColor: "#efebe9" }}
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div className="col-6">
                        <input
                          type="password"
                          className="form-control rounded-0 shadow-none border-1 py-2"
                          style={{ borderColor: "#efebe9" }}
                          placeholder="CVC"
                          required
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button
                    type="submit"
                    className="btn w-100 rounded-0 fw-bold py-3 text-white border-0"
                    style={{ backgroundColor: THEME_BROWN }}
                  >
                    CONFIRM & PAY ${(selectedSale?.salePrice * qty).toFixed(2)}
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
