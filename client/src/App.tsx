import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { getToken } from "./Utils/auth";
import Register from "./Components/Register";
import Login from "./Components/Login";
import UserDashboard from "./Components/UserDashboard";
import AddProduct from "./Components/AddProduct";
import Dashboard from "./Components/Dashboard";
import DisplayProduct from "./Components/DisplayProduct";
import EditProduct from "./Components/EditProduct";
import Cart from "./Components/Cart";
import OrderHistory from "./Components/OrderHistory";
import OrderDetails from "./Components/OrderDetails";

function App() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/");
    }
  }, []);

  return (
    <>
      <Routes>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/" element={<Login />}></Route>
        <Route path="/adminDashboard" element={<Dashboard />}></Route>
        <Route path="/userDashboard" element={<UserDashboard />}></Route>
        <Route path="/addProduct" element={<AddProduct />}></Route>
        <Route path="/displayProduct" element={<DisplayProduct />}></Route>
        <Route path="/editProduct/:id" element={<EditProduct />}></Route>
        <Route path="/cart" element={<Cart />}></Route>
        <Route path="/orderHistory" element={<OrderHistory />}></Route>
        <Route path="/orderDetails/:orderId" element={<OrderDetails />}></Route>
      </Routes>
    </>
  );
}

export default App;
