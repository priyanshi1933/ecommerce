
import express from "express";

import { registerUser,loginUser,getUsers } from "../controllers/user.controller";
import { addProduct,getAllProducts,getProductById,updateProduct,deleteProduct } from "../controllers/product.controller";
import { verifyToken } from "../middleware/auth";
import upload from "../config/multer";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", getUsers);

router.post("/addProduct",verifyToken,upload.array("image", 5),addProduct);
router.get("/getProduct",verifyToken,getAllProducts);
router.get("/getProductById/:id",verifyToken,getProductById);
router.put("/updateProduct/:id",verifyToken,upload.array("image", 5),updateProduct);
router.delete("/deleteProduct/:id",verifyToken,deleteProduct);

export default router;
