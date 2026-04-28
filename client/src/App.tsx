import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom"
import { getToken } from "./Utils/auth";
import Register from "./Components/Register";
import Login from "./Components/Login";
import AdminDashboard from "./Components/AdminDashboard";
import UserDashboard from "./Components/UserDashboard";


function App() {
 
  const navigate=useNavigate();
  useEffect(()=>{
    const token=getToken();
    if(!token){
      navigate("/");
    }
  },[])

  return (
    <>
     <Routes>
        <Route path="/register" element={<Register/>}></Route>
        <Route path="/" element={<Login/>}></Route>
        <Route path="/adminDashboard" element={<AdminDashboard/>}></Route>
        <Route path="/userDashboard" element={<UserDashboard/>}></Route>
     </Routes>
    </>
  )
}

export default App
