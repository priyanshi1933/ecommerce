import React, { useState, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import AdminNavbar from "./AdminNavbar";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    isActive: true,
  });

  const [variants, setVariants] = useState([
    { size: "", color: "", stock: 0, price: 0 },
  ]);

  const [images, setImages] = useState<File[]>([]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleVariantChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const addVariantRow = () =>
    setVariants([...variants, { size: "", color: "", stock: 0, price: 0 }]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("isActive", String(formData.isActive));
    data.append("variants", JSON.stringify(variants));
   
    images.forEach((img) => data.append("image", img));

    const token = localStorage.getItem("token");

    try {
      const res = await axios.post("http://localhost:3000/addProduct", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      
      alert("Product added successfully!");
      navigate("/displayProduct");
      console.log(res.data);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Error adding product");
      setIsSubmitting(false); 
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mt-5 mb-5">
        <div
          className="card shadow-sm border-0 mx-auto"
          style={{ maxWidth: "800px" }}
        >
          <div
            className="card-header text-white p-3"
            style={{ backgroundColor: "#5d4037" }}
          >
            <h4 className="mb-0 fw-bold text-uppercase small tracking-widest">
              Add New Product
            </h4>
          </div>
          <div className="card-body p-4 bg-light">
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark small">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-control shadow-none"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark small">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    className="form-control shadow-none"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold text-dark small">
                    Description
                  </label>
                  <textarea
                    name="description"
                    className="form-control shadow-none"
                    rows={3}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-dark small">
                  Product Images (Multiple)
                </label>
                <input
                  type="file"
                  className="form-control shadow-none"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label fw-bold text-dark small mb-0">
                    Product Variants
                  </label>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={addVariantRow}
                    style={{ color: "#5d4037", borderColor: "#5d4037" }}
                  >
                    + Add Variant
                  </button>
                </div>
                {variants.map((v, index) => (
                  <div
                    key={index}
                    className="row g-2 mb-2 p-2 border rounded bg-white"
                  >
                    <div className="col-md-3">
                      <input
                        type="text"
                        placeholder="Size"
                        className="form-control form-control-sm"
                        onChange={(e) =>
                          handleVariantChange(index, "size", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="text"
                        placeholder="Color"
                        className="form-control form-control-sm"
                        onChange={(e) =>
                          handleVariantChange(index, "color", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="number"
                        placeholder="Stock"
                        className="form-control form-control-sm"
                        onChange={(e) =>
                          handleVariantChange(index, "stock", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="number"
                        placeholder="Price"
                        className="form-control form-control-sm"
                        onChange={(e) =>
                          handleVariantChange(index, "price", Number(e.target.value))
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="btn w-100 fw-bold text-white py-2"
                style={{ backgroundColor: "#3e2723" }}
                disabled={isSubmitting} 
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    SAVING...
                  </>
                ) : (
                  "SAVE PRODUCT"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProduct;

