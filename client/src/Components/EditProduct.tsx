

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

interface IVariant {
  size: string;
  color: string;
  stock: number;
  price: number;
}

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [variants, setVariants] = useState<IVariant[]>([]);
 
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/getProductById/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const product = res.data.data;
        setName(product.name);
        setDescription(product.description);
        setCategory(product.category);
        setVariants(product.variants);
        setExistingImages(product.image);
      } catch (err) {
        console.error("Error fetching product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, token]);

  const handleVariantChange = (index: number, field: keyof IVariant, value: string | number) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages([...newImages, ...Array.from(e.target.files)]);
    }
  };

  const removeExistingImage = (imgName: string) => {
    setDeletedImages([...deletedImages, imgName]); 
    setExistingImages(existingImages.filter(img => img !== imgName)); 
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const formData = new FormData();
  
  formData.append("name", name);
  formData.append("description", description);
  formData.append("category", category);
  formData.append("variants", JSON.stringify(variants));
  
  formData.append("existingImages", JSON.stringify(existingImages)); 

  formData.append("deletedImages", JSON.stringify(deletedImages)); 
  
  newImages.forEach(img => formData.append("image", img));

  try {
    await axios.put(`http://localhost:3000/updateProduct/${id}`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data" 
      }
    });
    alert("Product updated successfully!");
    navigate("/displayProduct");
  } catch (err) {
    alert("Update failed");
  }
};


  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color: "#5d4037" }}></div></div>;

  return (
    <div className="min-vh-100 bg-white">
      <AdminNavbar />
      <div className="container py-5">
        <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: "850px" }}>
          <div className="card-body p-4 p-md-5">
            <div className="mb-4">
              <h2 className="fw-bold m-0" style={{ color: "#3e2723" }}>Edit Product</h2>
              <p className="text-muted">Update your inventory details and product media.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-7">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">PRODUCT NAME</label>
                    <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">DESCRIPTION</label>
                    <textarea className="form-control" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
                  </div>

                 <div className="mb-3">
                    <label className="form-label small fw-bold">PRODUCT CATEGORY</label>
                    <input type="text" className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} required />
                  </div>
                </div>

                  <div className="mb-3">
                <label className="form-label fw-bold">Images</label>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {/* Current Images */}
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="position-relative">
                      <img src={`http://localhost:3000/uploads/${img}`} style={{ width: "80px", height: "80px", objectFit: "cover" }} />
                      <button type="button" onClick={() => removeExistingImage(img)} className="btn btn-danger btn-sm position-absolute top-0 end-0">×</button>
                    </div>
                  ))}
                  {newImages.map((file, idx) => (
                    <div key={idx} className="position-relative border border-success">
                      <img src={URL.createObjectURL(file)} style={{ width: "80px", height: "80px", objectFit: "cover" }} />
                      <button type="button" onClick={() => setNewImages(newImages.filter((_, i) => i !== idx))} className="btn btn-dark btn-sm position-absolute top-0 end-0">×</button>
                    </div>
                  ))}
                </div>
                <input type="file" multiple className="form-control" onChange={handleFileChange} />
              </div>

                <div className="col-12 border-top pt-4 mt-2">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <label className="form-label small fw-bold m-0">VARIANTS & STOCK(Size,Color,Price,Stock)</label>
                    <button type="button" onClick={() => setVariants([...variants, { size: '', color: '', stock: 0, price: 0 }])} className="btn btn-sm text-white" style={{ backgroundColor: "#8d6e63" }}>+ Add Variant</button>
                  </div>
                  
                  {variants.map((v, i) => (
                    <div key={i} className="row g-2 mb-2 bg-light p-2 rounded">
                      <div className="col-3"><input type="text" placeholder="Size" className="form-control form-control-sm" value={v.size} onChange={(e) => handleVariantChange(i, 'size', e.target.value)} /></div>
                      <div className="col-3"><input type="text" placeholder="Color" className="form-control form-control-sm" value={v.color} onChange={(e) => handleVariantChange(i, 'color', e.target.value)} /></div>
                      <div className="col-2"><input type="number" placeholder="Price" className="form-control form-control-sm" value={v.price} onChange={(e) => handleVariantChange(i, 'price', Number(e.target.value))} /></div>
                      <div className="col-2"><input type="number" placeholder="Stock" className="form-control form-control-sm" value={v.stock} onChange={(e) => handleVariantChange(i, 'stock', Number(e.target.value))} /></div>
                      <div className="col-2"><button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="btn btn-sm btn-outline-danger w-100">Remove</button></div>
                    </div>
                  ))}
                </div>

                <div className="col-12 d-flex gap-3 mt-4">
                  <button type="submit" className="btn text-white fw-bold px-5 flex-grow-1" style={{ backgroundColor: "#5d4037", borderRadius: "0" }}>SAVE CHANGES</button>
                  <button type="button" onClick={() => navigate(-1)} className="btn btn-outline-secondary px-4" style={{ borderRadius: "0" }}>CANCEL</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
