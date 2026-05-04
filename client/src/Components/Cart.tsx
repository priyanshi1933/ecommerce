import { useState, useEffect } from "react";
import axios from "axios";
import UserNavbar from "./UserNavbar";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const [cart, setCart] = useState<any>(null);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardData, setCardData] = useState({ number: "", expiry: "", cvc: "" });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartAndSales();
  }, []);

  const fetchCartAndSales = async () => {
    try {
      const [cartRes, saleRes] = await Promise.all([
        axios.get("http://localhost:3000/getCart", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3000/active"),
      ]);
      setCart(cartRes.data.data);
      setFlashSales(saleRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const getActiveSale = (productId: string, variantId: string) => {
    const now = new Date(); // Get current time
    return flashSales.find((sale) => {
      const sProdId =
        typeof sale.productId === "object"
          ? sale.productId._id
          : sale.productId;
      const sVarId =
        typeof sale.variantId === "object"
          ? sale.variantId._id
          : sale.variantId;

      const startTime = new Date(sale.startTime);
      const endTime = new Date(sale.endTime);

      // Check if Product matches AND time is currently valid
      return (
        sProdId === productId &&
        sVarId === variantId &&
        now >= startTime &&
        now <= endTime
      );
    });
  };

  const updateQuantity = async (
    productId: string,
    variantId: string,
    quantity: number,
  ) => {
    if (quantity < 1) return;
    try {
      const res = await axios.put(
        "http://localhost:3000/updateCart",
        { productId, variantId, quantity },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCart(res.data.data);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const removeItem = async (productId: string, variantId: string) => {
    try {
      const res = await axios.delete(
        `http://localhost:3000/removeCart/${productId}/${variantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setCart(res.data.data);
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Removed from cart");
    } catch (error) {
      toast.error("Failed to remove");
    }
  };

  const calculateTotal = () => {
    return (
      cart?.items?.reduce((acc: number, item: any) => {
        const activeSale = getActiveSale(item.productId?._id, item.variantId);
        const variant = item.productId?.variants?.find(
          (v: any) => v._id === item.variantId,
        );
        const price = activeSale ? activeSale.salePrice : variant?.price || 0;
        return acc + price * item.quantity;
      }, 0) || 0
    );
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cardData.number.length < 16 || cardData.cvc.length < 3) {
      toast.error("Invalid card details (Mock)");
      return;
    }
    setShowPaymentModal(false);
    await processFinalOrder();
  };

  const processFinalOrder = async () => {
    const TOAST_ID = "payment-process";
    try {
      setLoading(true);
      toast.loading("Placing order...", { id: TOAST_ID });
      const res = await axios.post(
        "http://localhost:3000/addOrder",
        { idempotencyKey: `ord-${Date.now()}`, paymentStatus: "Success" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        toast.success("Order Successful! 🎉", { id: TOAST_ID });
        window.dispatchEvent(new Event("cartUpdated"));
        setTimeout(() => navigate("/orderHistory"), 2000);
      }
    } catch (error: any) {
      toast.error("Order Failed", { id: TOAST_ID });
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-dark"></div>
      </div>
    );

  return (
    <div className="min-vh-100 bg-light">
      <UserNavbar searchTerm="" setSearchTerm={() => {}} />
      <Toaster position="top-center" />

      <div className="container py-5">
        <h2 className="fw-bold mb-4">Your Shopping Cart</h2>
        <div className="row">
          <div className="col-lg-8">
            {cart?.items?.length > 0 ? (
              cart.items.map((item: any) => {
                const activeSale = getActiveSale(
                  item.productId?._id,
                  item.variantId,
                );
                const variant = item.productId?.variants?.find(
                  (v: any) => v._id === item.variantId,
                );

            const imageSource = item.selectedImage || item.productId?.image[0];

                return (
                  <div
                    key={item.variantId}
                    className="card rounded-0 border-0 shadow-sm mb-3"
                  >
                    <div className="card-body p-3">
                      <div className="d-flex gap-3">
                        <img
                          src={`http://localhost:3000/uploads/${imageSource}`}
                          style={{
                            width: "110px",
                            height: "140px",
                            objectFit: "cover",
                          }}
                          alt=""
                        />
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <h6 className="fw-bold m-0">
                              {item.productId.name}
                            </h6>
                            <button
                              className="btn btn-sm text-danger shadow-none"
                              onClick={() =>
                                removeItem(item.productId._id, item.variantId)
                              }
                            >
                              Remove
                            </button>
                          </div>
                          <p className="text-muted small mb-2">
                            {variant?.color} / {variant?.size}
                          </p>
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="input-group input-group-sm"
                              style={{ width: "100px" }}
                            >
                              <button
                                className="btn btn-outline-dark"
                                onClick={() =>
                                  updateQuantity(
                                    item.productId._id,
                                    item.variantId,
                                    item.quantity - 1,
                                  )
                                }
                              >
                                -
                              </button>
                              <span className="input-group-text bg-white">
                                {item.quantity}
                              </span>
                              <button
                                className="btn btn-outline-dark"
                                onClick={() =>
                                  updateQuantity(
                                    item.productId._id,
                                    item.variantId,
                                    item.quantity + 1,
                                  )
                                }
                              >
                                +
                              </button>
                            </div>
                            <div className="ms-auto text-end">
                              {activeSale ? (
                                <>
                                  <div className="text-decoration-line-through text-muted small">
                                    $
                                    {(variant.price * item.quantity).toFixed(2)}
                                  </div>
                                  <div className="fw-bold text-danger h5 mb-0">
                                    $
                                    {(
                                      activeSale.salePrice * item.quantity
                                    ).toFixed(2)}
                                  </div>
                                  <small
                                    className="text-danger fw-bold"
                                    style={{ fontSize: "0.7rem" }}
                                  >
                                    ⚡ LIVE FLASH DEAL
                                  </small>
                                </>
                              ) : (
                                /* This will show if there is NO sale, or if the sale is UPCOMING but not yet started */
                                <div className="fw-bold h5 mb-0">
                                  $
                                  {(
                                    (variant?.price || 0) * item.quantity
                                  ).toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-5 bg-white">
                Your cart is empty.
              </div>
            )}
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-0 p-3">
              <h5 className="fw-bold mb-4">Summary</h5>
              <div className="d-flex justify-content-between mb-4">
                <span className="h5 fw-bold">Total</span>
                <span className="h5 fw-bold">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
              <button
                className="btn btn-dark w-100 py-3 rounded-0 fw-bold"
                disabled={!cart?.items?.length}
                onClick={() => setShowPaymentModal(true)}
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              className="modal-content border-0 rounded-0"
              onSubmit={handlePaymentSubmit}
            >
              <div className="modal-header border-0">
                <h5 className="fw-bold m-0">Payment Details</h5>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setShowPaymentModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <input
                  type="text"
                  className="form-control rounded-0 mb-3"
                  placeholder="Card Number"
                  required
                  onChange={(e) =>
                    setCardData({ ...cardData, number: e.target.value })
                  }
                />
                <div className="row">
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control rounded-0"
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control rounded-0"
                      placeholder="CVC"
                      required
                      onChange={(e) =>
                        setCardData({ ...cardData, cvc: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-light text-center">
                  <small>Total Payable</small>
                  <h4 className="fw-bold">${calculateTotal().toFixed(2)}</h4>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="submit"
                  className="btn btn-dark w-100 py-3 rounded-0 fw-bold"
                >
                  PAY NOW
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
