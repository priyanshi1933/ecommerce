import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import UserNavbar from "./UserNavbar";
import toast from "react-hot-toast";
import FlashSaleTimer from "./FlashSaleTimer";

// --- Interfaces ---
interface IVariant {
  _id: string;
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

// --- Sub-Component: Image Gallery ---
const ProductImageGallery = ({ images, activeIndex, setActiveIndex }: any) => {
  return (
    <div className="d-flex flex-column gap-2">
      <div
        style={{ height: "350px", backgroundColor: "#f8f9fa" }}
        className="rounded overflow-hidden border shadow-sm"
      >
        <img
          src={`http://localhost:3000/uploads/${images[activeIndex] || images[0]}`}
          className="w-100 h-100 object-fit-cover"
          alt="main-view"
          onError={(e) => {
            e.currentTarget.src = "https://placeholder.com";
          }}
        />
      </div>
      <div className="d-flex gap-2 flex-wrap">
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

// --- Main Component ---
const UserDashboard = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [activeIndex, setActiveIndex] = useState(0); // Tracks selected variant index
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, saleRes] = await Promise.all([
          axios.get("http://localhost:3000/getProduct", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/active"),
        ]);
        setProducts(prodRes.data.data);
        setFlashSales(saleRes.data.data);
      } catch (err) {
        console.error("Error loading data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );

  // Variant-Specific Lookup: Matches Product ID AND Variant ID
  const getActiveSale = (productId: string, variantId: string) => {
    return flashSales.find((sale) => {
      const sProdId =
        typeof sale.productId === "object"
          ? sale.productId._id
          : sale.productId;
      const sVarId =
        typeof sale.variantId === "object"
          ? sale.variantId._id
          : sale.variantId;
      return sProdId === productId && sVarId === variantId;
    });
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

  const openProductModal = (product: IProduct) => {
    setSelectedProduct(product);
    setActiveIndex(0); // Reset to first variant when opening
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;
    try {
      const selectedVariant = selectedProduct.variants[activeIndex];
      const payload = {
        productId: selectedProduct._id,
        variantId: selectedVariant._id,
        quantity: 1,
        selectedImage: selectedProduct.image[activeIndex] 
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
      toast.error(error.response?.data?.message || "Failed to add to cart");
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
                onClick={() => setSelectedCategory(cat)}
                className="btn btn-sm rounded-0 px-4 py-2 fw-bold text-uppercase shadow-none"
                style={{
                  fontSize: "0.7rem",
                  backgroundColor:
                    selectedCategory === cat ? "#3e2723" : "transparent",
                  color: selectedCategory === cat ? "#ffffff" : "#3e2723",
                  border: `1px solid #3e2723`,
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
          <>
            <div className="row g-4">
              {currentItems.map((product) => {
                // On dashboard, we check if ANY variant of this product is on sale for the badge
                const hasAnySale = flashSales.some(
                  (s) =>
                    (typeof s.productId === "object"
                      ? s.productId._id
                      : s.productId) === product._id,
                );
                // For the price display, we check the first variant
                const firstVarSale = getActiveSale(
                  product._id,
                  product.variants[0]?._id,
                );

                return (
                  <div key={product._id} className="col-6 col-md-4 col-lg-3">
                    <div
                      className="card h-100 border-0 shadow-sm text-center position-relative"
                      style={{ cursor: "pointer" }}
                      onClick={() => openProductModal(product)}
                    >
                      {hasAnySale && (
                        <div
                          className="position-absolute top-0 start-0 w-100 py-1 fw-bold text-white"
                          style={{
                            backgroundColor: "#d32f2f",
                            fontSize: "0.65rem",
                            zIndex: 10,
                          }}
                        >
                          ⚡ FLASH SALE ⚡
                        </div>
                      )}
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
                        <div
                          className="fw-bold"
                          style={{
                            color: firstVarSale ? "#d32f2f" : "#3e2723",
                          }}
                        >
                          {firstVarSale ? (
                            <span>
                              <span className="text-decoration-line-through text-muted me-2 small">
                                ${product.variants[0]?.price}
                              </span>
                              ${firstVarSale.salePrice}
                            </span>
                          ) : (
                            `$${product.variants[0]?.price}`
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav className="mt-5 d-flex justify-content-center">
                <ul className="pagination gap-2">
                  <li className="page-item">
                    <button
                      className="page-link border-0 rounded-0 px-3 fw-bold"
                      style={{
                        backgroundColor: "#3e2723",
                        color: "white",
                        opacity: currentPage === 1 ? 0.5 : 1,
                      }}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      &larr;
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i}>
                      <button
                        onClick={() => setCurrentPage(i + 1)}
                        className="page-link border rounded-0 fw-bold"
                        style={{
                          width: "40px",
                          backgroundColor:
                            currentPage === i + 1 ? "#3e2723" : "white",
                          color: currentPage === i + 1 ? "white" : "#3e2723",
                          borderColor: "#3e2723",
                        }}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className="page-item">
                    <button
                      className="page-link border-0 rounded-0 px-3 fw-bold"
                      style={{
                        backgroundColor: "#3e2723",
                        color: "white",
                        opacity: currentPage === totalPages ? 0.5 : 1,
                      }}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      &rarr;
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>

      {/* Modal */}
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
                    {/* DYNAMIC FLASH SALE ALERT FOR SELECTED VARIANT */}
                    {getActiveSale(
                      selectedProduct._id,
                      selectedProduct.variants[activeIndex]?._id,
                    ) && (
                      <div className="alert alert-danger rounded-0 border-0 py-2 small fw-bold mb-3 d-flex justify-content-between align-items-center">
                        <span>
                          ⚡ {selectedProduct.variants[activeIndex].size} SALE
                          PRICE!
                        </span>
                        <FlashSaleTimer
                          startTime={
                            getActiveSale(
                              selectedProduct._id,
                              selectedProduct.variants[activeIndex]._id,
                            ).startTime
                          }
                          endTime={
                            getActiveSale(
                              selectedProduct._id,
                              selectedProduct.variants[activeIndex]._id,
                            ).endTime
                          }
                        />
                      </div>
                    )}
                    <span
                      className="badge mb-2"
                      style={{ backgroundColor: "#efebe9", color: "#8d6e63" }}
                    >
                      {selectedProduct.category}
                    </span>
                    <h3 className="fw-bold mb-1" style={{ color: "#3e2723" }}>
                      {selectedProduct.name}
                    </h3>

                    {/* PRICE UPDATES BASED ON SELECTED VARIANT & SALE */}
                    <h4
                      className="fw-bold mb-3"
                      style={{
                        color: getActiveSale(
                          selectedProduct._id,
                          selectedProduct.variants[activeIndex]?._id,
                        )
                          ? "#d32f2f"
                          : "#8d6e63",
                      }}
                    >
                      {getActiveSale(
                        selectedProduct._id,
                        selectedProduct.variants[activeIndex]?._id,
                      ) ? (
                        <>
                          <span className="text-decoration-line-through text-muted me-2 small">
                            ${selectedProduct.variants[activeIndex]?.price}
                          </span>
                          $
                          {
                            getActiveSale(
                              selectedProduct._id,
                              selectedProduct.variants[activeIndex]._id,
                            ).salePrice
                          }
                        </>
                      ) : (
                        `$${selectedProduct.variants[activeIndex]?.price}`
                      )}
                    </h4>

                    <p
                      className="text-secondary mb-4 small"
                      style={{ lineHeight: "1.6" }}
                    >
                      {selectedProduct.description}
                    </p>

                    <h6 className="fw-bold text-uppercase small mb-3">
                      Select Size/Color
                    </h6>
                    <div className="d-flex flex-wrap gap-2 mb-4">
                      {selectedProduct.variants.map((v, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveIndex(idx)}
                          className={`btn btn-sm border px-3 py-2 rounded-0 fw-bold shadow-none transition-all ${activeIndex === idx ? "btn-dark" : "bg-white text-dark"}`}
                        >
                          {v.color} / {v.size}
                        </button>
                      ))}
                    </div>

                    <div className="mb-4">
                      <small className="text-muted d-block">
                        Availability:
                      </small>
                      <span
                        className={`fw-bold small ${selectedProduct.variants[activeIndex]?.stock > 0 ? "text-success" : "text-danger"}`}
                      >
                        {selectedProduct.variants[activeIndex]?.stock > 0
                          ? `${selectedProduct.variants[activeIndex].stock} Items in Stock`
                          : "Currently Out of Stock"}
                      </span>
                    </div>

                    <button
                      className="btn w-100 text-white fw-bold py-3 rounded-0 shadow-sm border-0"
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

export default UserDashboard;





