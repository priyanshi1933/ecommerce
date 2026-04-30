import { useState, useEffect } from "react";
import axios from "axios";
import UserNavbar from "./UserNavbar";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await axios.get("http://localhost:3000/getCart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setLoading(false);
    }
  };

  const updateQuantity = async (
    productId: string,
    variantId: string,
    quantity: number,
  ) => {
    if (quantity < 1) return;
    const item = cart.items.find((i: any) => i.variantId === variantId);
    const variant = item?.productId?.variants?.find(
      (v: any) => v._id === variantId,
    );

    if (variant && quantity > variant.stock) {
      toast.error(`Only ${variant.stock} items available in stock`);
      return;
    }

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
        const variant = item.productId?.variants?.find(
          (v: any) => v._id === item.variantId,
        );
        return acc + (variant?.price || 0) * item.quantity;
      }, 0) || 0
    );
  };

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-dark" role="status"></div>
      </div>
    );



  const handlePlaceOrder = async () => {
  try {
    setLoading(true); 
    
    toast.loading("Processing Payment...", { id: "payment" });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const idempotencyKey = `ord-${Date.now()}`;
    const res = await axios.post(
      "http://localhost:3000/addOrder",
      { idempotencyKey },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.success) {
      toast.success("Payment Successful! Order Created.", { id: "payment" });
      window.dispatchEvent(new Event("cartUpdated"));
      navigate("/orderHistory");
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Payment Failed", { id: "payment" });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-vh-100 bg-white">
      <Toaster position="bottom-right" />
      <UserNavbar searchTerm="" setSearchTerm={() => {}} />

      <div className="container py-5">
        <h2
          className="fw-bold mb-5"
          style={{ color: "#3e2723", letterSpacing: "1px" }}
        >
          YOUR CART
        </h2>

        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="text-center py-5 border rounded-0 bg-light">
            <p className="text-muted mb-4">Your shopping cart is empty.</p>
            <button
              className="btn btn-dark rounded-0 px-5 py-2 fw-bold"
              onClick={() => (window.location.href = "/userDashboard")}
            >
              CONTINUE SHOPPING
            </button>
          </div>
        ) : (
          <div className="row g-5">
            <div className="col-lg-8">
              {cart.items.map((item: any, idx: number) => {
                if (typeof item.productId === "string") return null;

                const variant = item.productId?.variants?.find(
                  (v: any) => v._id === item.variantId,
                );
                const variantIndex = item.productId?.variants?.findIndex(
                  (v: any) => v._id === item.variantId,
                );

                const displayImage =
                  item.productId?.image && item.productId.image[variantIndex]
                    ? item.productId.image[variantIndex]
                    : item.productId?.image?.[0];

                return (
                  <div
                    key={idx}
                    className="row g-0 border-bottom pb-4 mb-4 align-items-center"
                  >
                    <div className="col-3 col-md-2">
                      <img
                        src={`http://localhost:3000/uploads/${displayImage}`}
                        className="w-100 object-fit-cover border"
                        style={{ height: "140px" }}
                        alt="product"
                        onError={(e) => {
                          e.currentTarget.src = "https://placeholder.com";
                        }}
                      />
                    </div>
                    <div className="col-9 col-md-10 ps-4">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6
                            className="fw-bold text-uppercase mb-1"
                            style={{ color: "#3e2723" }}
                          >
                            {item.productId?.name}
                          </h6>
                          <p
                            className="text-muted small text-uppercase mb-2"
                            style={{ fontSize: "0.7rem", letterSpacing: "1px" }}
                          >
                            {variant?.color} / {variant?.size}
                          </p>
                        </div>
                        <p className="fw-bold m-0" style={{ color: "#3e2723" }}>
                          ${(variant?.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="d-flex align-items-center gap-4 mt-3">
                        <div className="d-flex align-items-center border">
                          <button
                            className="btn btn-sm px-3 py-1 shadow-none border-0"
                            onClick={() =>
                              updateQuantity(
                                item.productId?._id,
                                item.variantId,
                                item.quantity - 1,
                              )
                            }
                          >
                            -
                          </button>
                          <span
                            className="px-2 fw-bold"
                            style={{ fontSize: "0.9rem" }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            className="btn btn-sm px-3 py-1 shadow-none border-0"
                            onClick={() =>
                              updateQuantity(
                                item.productId?._id,
                                item.variantId,
                                item.quantity + 1,
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="btn btn-link p-0 text-muted small text-decoration-none border-0 bg-transparent"
                          style={{ borderBottom: "1px solid #ccc" }}
                          onClick={() =>
                            removeItem(item.productId?._id, item.variantId)
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="col-lg-4">
              <div
                className="p-4 border rounded-0"
                style={{ backgroundColor: "#fdfaf9" }}
              >
                <h5 className="fw-bold mb-4" style={{ color: "#3e2723" }}>
                  ORDER SUMMARY
                </h5>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-bold">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-4">
                  <span className="text-muted">Shipping</span>
                  <span className="text-success fw-bold">FREE</span>
                </div>
                <hr />
                <div
                  className="d-flex justify-content-between mb-4 h5 fw-bold"
                  style={{ color: "#3e2723" }}
                >
                  <span>Estimated Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <button
                  className="btn w-100 text-white py-3 rounded-0 fw-bold shadow-sm mb-3"
                  style={{ backgroundColor: "#3e2723" }}
                  onClick={handlePlaceOrder}
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
