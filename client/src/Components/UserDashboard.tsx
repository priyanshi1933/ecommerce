import { useState, useEffect } from "react";
import axios from "axios";
import UserNavbar from "./UserNavbar";
import toast from "react-hot-toast";

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

const UserDashboard = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/getProduct", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const openProductModal = (product: IProduct) => {
    setSelectedProduct(product);
    setActiveIndex(0);
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    try {
      const selectedVariant = selectedProduct.variants[activeIndex];

      const payload = {
        productId: selectedProduct._id,
        variantId: (selectedVariant as any)._id,
        quantity: 1,
      };

      const res = await axios.post("http://localhost:3000/addCart", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.success("Added to cart!");
        window.dispatchEvent(new Event("cartUpdated"));
        setSelectedProduct(null);
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      alert(error.response?.data?.message || "Failed to add to cart");
    }
  };

  return (
    <div className="min-vh-100 bg-white">
      <UserNavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div
        className="py-5 border-bottom mb-4"
        style={{ backgroundColor: "#fdfaf9" }}
      >
        <div className="container text-center">
          <h2 className="fw-bold m-0" style={{ color: "#3e2723" }}>
            Modern Essentials
          </h2>

          <div className="d-flex justify-content-center flex-wrap gap-2 mt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className="btn btn-sm rounded-0 px-4 py-2 fw-bold text-uppercase tracking-wider transition-all"
                style={{
                  fontSize: "0.7rem",
                  letterSpacing: "1px",
                  backgroundColor:
                    selectedCategory === cat ? "#3e2723" : "transparent",
                  color: selectedCategory === cat ? "#ffffff" : "#3e2723",
                  border: `1px solid #3e2723`,
                  transition: "0.3s ease",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container pb-5">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: "#5d4037" }}></div>
          </div>
        ) : (
          <div className="row g-4 d-flex align-items-stretch">
            <div className="row g-4 d-flex align-items-stretch">
              {currentItems.length > 0 ? (
                currentItems.map((product) => (
                  <div key={product._id} className="col-6 col-md-4 col-lg-3">
                    <div
                      className="card h-100 border-0 shadow-sm text-center"
                      style={{ cursor: "pointer" }}
                      onClick={() => openProductModal(product)}
                    >
                      <div
                        style={{ height: "230px", backgroundColor: "#f8f9fa" }}
                      >
                        <img
                          src={`http://localhost:3000/uploads/${product.image[0]}`}
                          className="w-100 h-100 object-fit-cover"
                          alt={product.name}
                        />
                      </div>
                      <div className="card-body px-3 py-3">
                        <small
                          className="text-uppercase fw-bold text-muted"
                          style={{ fontSize: "0.65rem" }}
                        >
                          {product.category}
                        </small>
                        <h6 className="fw-bold text-dark text-truncate mt-1 mb-2">
                          {product.name}
                        </h6>
                        <div className="fw-bold" style={{ color: "#3e2723" }}>
                          ${product.variants[0]?.price}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5 text-muted">
                  No products found.
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <nav className="mt-5 d-flex justify-content-center">
                <ul className="pagination gap-2">
                  <li className="page-item">
                    <button
                      className="page-link border-0 rounded-0 px-3 fw-bold"
                      style={{
                        backgroundColor:
                          currentPage === 1 ? "#e0e0e0" : "#3e2723",
                        color: currentPage === 1 ? "#9e9e9e" : "white",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        transition: "0.3s",
                      }}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      &larr; PREV
                    </button>
                  </li>

                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i} className="page-item">
                      <button
                        className="page-link border shadow-none rounded-0 fw-bold"
                        style={{
                          width: "40px",
                          textAlign: "center",
                          backgroundColor:
                            currentPage === i + 1 ? "#3e2723" : "white",
                          color: currentPage === i + 1 ? "white" : "#3e2723",
                          borderColor: "#3e2723",
                          transition: "0.3s",
                        }}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}

                  <li className="page-item">
                    <button
                      className="page-link border-0 rounded-0 px-3 fw-bold"
                      style={{
                        backgroundColor:
                          currentPage === totalPages ? "#e0e0e0" : "#3e2723",
                        color: currentPage === totalPages ? "#9e9e9e" : "white",
                        cursor:
                          currentPage === totalPages
                            ? "not-allowed"
                            : "pointer",
                        transition: "0.3s",
                      }}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      NEXT &rarr;
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        )}
      </div>

      {selectedProduct && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1050 }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 rounded-0 shadow-lg">
              <div className="modal-header border-0 pb-0 d-flex justify-content-end">
                <button
                  type="button"
                  className="btn-close shadow-none p-3"
                  onClick={() => setSelectedProduct(null)}
                ></button>
              </div>

              <div className="modal-body p-4 pt-0">
                <div className="row g-4">
                  <div className="col-md-5">
                    <ProductImageGallery
                      images={selectedProduct.image}
                      activeIndex={activeIndex}
                      setActiveIndex={setActiveIndex}
                    />
                  </div>

                  <div className="col-md-7">
                    <span
                      className="badge mb-2"
                      style={{ backgroundColor: "#efebe9", color: "#8d6e63" }}
                    >
                      {selectedProduct.category}
                    </span>
                    <h3 className="fw-bold mb-1" style={{ color: "#3e2723" }}>
                      {selectedProduct.name}
                    </h3>

                    <h4 className="fw-bold mb-3" style={{ color: "#8d6e63" }}>
                      ${selectedProduct.variants[activeIndex]?.price}
                    </h4>

                    <p
                      className="text-secondary mb-4 small"
                      style={{ lineHeight: "1.6" }}
                    >
                      {selectedProduct.description}
                    </p>

                    <h6
                      className="fw-bold text-uppercase small tracking-widest mb-3"
                      style={{ color: "#3e2723" }}
                    >
                      Select Option
                    </h6>
                    <div className="d-flex flex-wrap gap-2 mb-4">
                      {selectedProduct.variants.map((v, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveIndex(idx)}
                          className={`btn btn-sm border px-3 py-2 rounded-0 fw-bold transition-all ${activeIndex === idx ? "btn-dark" : "bg-white text-dark"}`}
                          style={{ fontSize: "0.75rem" }}
                        >
                          {v.color} / {v.size}
                        </button>
                      ))}
                    </div>

                    <div className="mb-4">
                      <small className="text-muted d-block">
                        Availability:
                      </small>
                      {selectedProduct.variants[activeIndex]?.stock > 0 ? (
                        <span className="text-success fw-bold small">
                          {selectedProduct.variants[activeIndex].stock} Items in
                          Stock
                        </span>
                      ) : (
                        <span className="text-danger fw-bold small">
                          Currently Out of Stock
                        </span>
                      )}
                    </div>

                    <button
                      className="btn w-100 text-white fw-bold py-3 rounded-0 shadow-sm"
                      style={{
                        backgroundColor: "#3e2723",
                        opacity:
                          selectedProduct.variants[activeIndex]?.stock > 0
                            ? 1
                            : 0.5,
                      }}
                      disabled={
                        selectedProduct.variants[activeIndex]?.stock <= 0
                      }
                      onClick={handleAddToCart}
                    >
                      {selectedProduct.variants[activeIndex]?.stock > 0
                        ? "ADD TO CART"
                        : "OUT OF STOCK"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductImageGallery = ({ images, activeIndex, setActiveIndex }: any) => {
  return (
    <div className="d-flex flex-column gap-2">
      <div
        style={{ height: "350px", backgroundColor: "#f8f9fa" }}
        className="rounded overflow-hidden border shadow-sm"
      >
        <img
          src={`http://localhost:3000/uploads/${images[activeIndex]}`}
          className="w-100 h-100 object-fit-cover"
          alt="main-view"
          onError={(e) => {
            e.currentTarget.src = "https://placeholder.com";
          }}
        />
      </div>
      <div className="d-flex gap-2">
        {images.map((img: string, idx: number) => (
          <img
            key={idx}
            src={`http://localhost:3000/uploads/${img}`}
            onClick={() => setActiveIndex(idx)}
            className={`rounded border-2 ${activeIndex === idx ? "border-dark" : "border-transparent"}`}
            style={{
              width: "55px",
              height: "55px",
              objectFit: "cover",
              cursor: "pointer",
              opacity: activeIndex === idx ? 1 : 0.5,
              transition: "0.2s",
            }}
            alt={`thumb-${idx}`}
          />
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
