
import express from "express";

import { registerUser,loginUser,getUsers } from "../controllers/user.controller";
import { addProduct,getAllProducts,getProductById,updateProduct,deleteProduct } from "../controllers/product.controller";
import { verifyToken } from "../middleware/auth";
import upload from "../config/multer";
import { getUserCart, handleAddToCart, handleRemoveFromCart, handleUpdateQuantity } from "../controllers/cart.controller";
import { handleCreateOrder, handleDeleteOrder, handleGetOrderDetails, handleGetUserOrders } from "../controllers/order.controller";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", getUsers);

router.post("/addProduct",verifyToken,upload.array("image", 5),addProduct);
router.get("/getProduct",verifyToken,getAllProducts);
router.get("/getProductById/:id",verifyToken,getProductById);
router.put("/updateProduct/:id",verifyToken,upload.array("image", 5),updateProduct);
router.delete("/deleteProduct/:id",verifyToken,deleteProduct);

router.post("/addCart",verifyToken,handleAddToCart);
router.get("/getCart",verifyToken,getUserCart);
router.put("/updateCart",verifyToken,handleUpdateQuantity);
router.delete("/removeCart/:productId/:variantId",verifyToken,handleRemoveFromCart);

router.post("/addOrder",verifyToken,handleCreateOrder);
router.get("/getOrder",verifyToken,handleGetUserOrders);
router.get("/details/:orderId",verifyToken,handleGetOrderDetails);
router.delete("/deleteOrder/:orderId",verifyToken,handleDeleteOrder);

export default router;
