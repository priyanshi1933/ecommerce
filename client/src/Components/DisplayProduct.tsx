import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

interface IVariant {
  size: string;
  color: string;
  stock: number;
  price: number;
}

interface IProduct {
  _id: string;
  name: string;
  description: string;
  category: string;
  image: string[];
  variants: IVariant[];
}

const DisplayProduct = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:3000/getProduct", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(res.data.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:3000/deleteProduct/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(products.filter(p => p._id !== id));
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  return (
    <div className="min-vh-100 bg-white">
      <AdminNavbar />
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="fw-bold m-0" style={{ color: "#3e2723" }}>Inventory Manager</h2>
            <p className="text-muted small mb-0">Select variants to see specific price and stock levels.</p>
          </div>
          <button 
            onClick={() => navigate("/addProduct")}
            className="btn text-white fw-bold px-4 shadow-sm"
            style={{ backgroundColor: "#5d4037", borderRadius: "0" }}
          >
            + ADD PRODUCT
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: "#5d4037" }}></div>
          </div>
        ) : (
          <div className="row g-4">
            {products.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                onDelete={() => handleDelete(product._id)} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProductCard = ({ product, onDelete }: { product: IProduct, onDelete: () => void }) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const current = product.variants[activeIndex];

  return (
    <div className="col-12 col-md-6 col-lg-3">
      <div className="card h-100 border-0 shadow-sm d-flex flex-column overflow-hidden rounded-3">
       
        <div className="position-relative">
          <div style={{ height: "220px", backgroundColor: "#f8f9fa" }}>
            <img
              src={`http://localhost:3000/uploads/${product.image[activeIndex] || product.image[0]}`}
              className="w-100 h-100 object-fit-cover"
              alt={product.name}
            />
          </div>
          {product.image.length > 1 && (
            <div className="d-flex justify-content-center gap-1 p-2 bg-white border-top">
              {product.image.map((img, idx) => (
                <img 
                  key={idx}
                  src={`http://localhost:3000/uploads/${img}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`rounded-1 border ${activeIndex === idx ? 'border-dark shadow-sm' : 'border-light'}`}
                  style={{ width: "35px", height: "35px", objectFit: "cover", cursor: "pointer", opacity: activeIndex === idx ? 1 : 0.6 }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="card-body p-3 d-flex flex-column flex-grow-1">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="badge" style={{ backgroundColor: "#efebe9", color: "#8d6e63" }}>
              {product.category}
            </span>
            <span className="fw-bold fs-5" style={{ color: "#3e2723" }}>
              ${current?.price}
            </span>
          </div>

          <h6 className="fw-bold text-dark mb-1">{product.name}</h6>
          <p className="text-muted small mb-3" style={{ fontSize: "0.75rem" }}>{product.description}</p>

          <div className="mb-3">
            <small className="text-muted d-block mb-2 fw-bold" style={{ fontSize: "0.6rem" }}>SELECT VARIANT:</small>
            <div className="d-flex flex-wrap gap-1">
              {product.variants.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className="btn btn-sm py-1 px-2 border fw-bold"
                  style={{ 
                    fontSize: "0.65rem",
                    backgroundColor: activeIndex === i ? "#5d4037" : "#fff",
                    color: activeIndex === i ? "#fff" : "#5d4037",
                    borderColor: "#5d4037"
                  }}
                >
                  {v.color} | {v.size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-3 border-top">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <small className="text-muted">Stock Availability:</small>
              <span className={`fw-bold small ${current?.stock > 0 ? 'text-success' : 'text-danger'}`}>
                {current?.stock > 0 ? `${current.stock} Left` : 'Out of Stock'}
              </span>
            </div>
            
            <div className="d-flex gap-2">
              <button 
                onClick={() => navigate(`/editProduct/${product._id}`)}
                className="btn btn-sm flex-grow-1 fw-bold border" 
                style={{ color: "#5d4037", borderColor: "#5d4037" }}
              >
                EDIT
              </button>
              <button onClick={onDelete} className="btn btn-sm btn-outline-danger px-3">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayProduct;
