import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";

const CreateFlashSale = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    productId: "",
    variantId: "",
    salePrice: "",
    maxUnits: "",
    startTime: "",
    endTime: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:3000/getProduct", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(res.data.data);
      } catch (err) {
        toast.error("Failed to load products");
      }
    };
    fetchProducts();
  }, [token]);

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p._id === productId);
    setSelectedProduct(product);
    setFormData({ ...formData, productId, variantId: "" }); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await toast.promise(
        axios.post("http://localhost:3000/admin/createFlashSale", formData, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        {
          loading: "Creating Flash Sale...",
          success: "Flash Sale Scheduled!",
          error: (err) => err.response?.data?.message || "Failed to create sale",
        }
      );
      navigate("/adminDashboard");
    } catch (err) {}
  };

  return (
    <>
    <AdminNavbar/>
    <div className="min-vh-100 bg-light p-5">
      <Toaster position="top-center" />
     
      <div className="container mt-5" style={{ maxWidth: "600px" }}>
        <div className="card border-0 shadow-sm p-4 rounded-0">
          <h4 className="fw-bold mb-4" style={{ color: "#3e2723" }}>CREATE FLASH SALE</h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="small fw-bold text-muted mb-1">SELECT PRODUCT</label>
              <select 
                className="form-select rounded-0" 
                required 
                onChange={(e) => handleProductChange(e.target.value)}
              >
                <option value="">Choose a product...</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="small fw-bold text-muted mb-1">SELECT VARIANT</label>
              <select 
                className="form-select rounded-0" 
                required 
                disabled={!selectedProduct}
                value={formData.variantId}
                onChange={(e) => setFormData({ ...formData, variantId: e.target.value })}
              >
                <option value="">Choose variant (Size/Color)...</option>
                {selectedProduct?.variants.map((v: any) => (
                  <option key={v._id} value={v._id}>
                    {v.size} / {v.color} - (Stock: {v.stock})
                  </option>
                ))}
              </select>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="small fw-bold text-muted mb-1">SALE PRICE ($)</label>
                <input 
                  type="number" className="form-control rounded-0" required 
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="small fw-bold text-muted mb-1">MAX UNITS</label>
                <input 
                  type="number" className="form-control rounded-0" required 
                  onChange={(e) => setFormData({ ...formData, maxUnits: e.target.value })}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="small fw-bold text-muted mb-1">START TIME</label>
              <input 
                type="datetime-local" className="form-control rounded-0" required 
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="small fw-bold text-muted mb-1">END TIME</label>
              <input 
                type="datetime-local" className="form-control rounded-0" required 
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-dark w-100 rounded-0 fw-bold py-2">
              SCHEDULE FLASH SALE
            </button>
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default CreateFlashSale;
