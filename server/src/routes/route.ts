import { handleBuyFlashItem, handleCreateFlashSale, handleGetActiveFlashSales, handlePreJoin } from './../controllers/flashsale.controller';

import express from "express";

import { registerUser,loginUser,getUsers, getProfile } from "../controllers/user.controller";
import { addProduct,getAllProducts,getProductById,updateProduct,deleteProduct } from "../controllers/product.controller";
import { verifyAdmin, verifyToken } from "../middleware/auth";
import upload from "../config/multer";
import { getUserCart, handleAddToCart, handleRemoveFromCart, handleUpdateQuantity } from "../controllers/cart.controller";
import { handleAdminGetAllOrders, handleCreateOrder, handleDeleteOrder, handleGetOrderDetails, handleGetUserOrders, handleUpdateOrderStatus } from "../controllers/order.controller";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", getUsers);
router.get("/profile", verifyToken, getProfile);

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
router.get("/admin/allOrders", verifyToken,verifyAdmin, handleAdminGetAllOrders);
router.patch("/admin/updateStatus/:orderId", verifyToken,verifyAdmin, handleUpdateOrderStatus);

router.post("/admin/createFlashSale", verifyToken, verifyAdmin, handleCreateFlashSale);
router.get("/active", handleGetActiveFlashSales);
router.post("/preJoin", verifyToken, handlePreJoin);
router.post("/buyFlash", verifyToken, handleBuyFlashItem);


export default router;
