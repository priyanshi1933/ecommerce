import React, { useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../Api/auth";
import { saveToken } from "../Utils/auth";

interface IUser {
  email: string;
  password: string;
}

const Login = () => {
  const [msg, setMsg] = useState({ email: "", password: "" });
  const [user, setUser] = useState<IUser>({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(() => ({ ...user, [name]: value }));
    setMsg((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let validationErrors = { email: "", password: "" };
    let hasError = false;

    if (user.email === "") {
      validationErrors.email = "Please enter email";
      hasError = true;
    }
    if (user.password === "") {
      validationErrors.password = "Please enter password";
      hasError = true;
    }

    setMsg(validationErrors);
    if (hasError) return;

    try {
      const res = await loginUser(user.email, user.password);
      saveToken(res.data.token);
      localStorage.setItem("token", res.data.token);
      const { role, id, name } = res.data;
      localStorage.setItem("role", role);
      localStorage.setItem("id", id);
      localStorage.setItem("name", name);
     
      alert("Login Successfully");
       if (role === "user") {
        navigate("/userDashboard");
      } else if (role === "admin") {
        navigate("/adminDashboard");
      }
     
    } catch (error: any) {
      if (error.response && error.response.data) {
        const { field, message } = error.response.data;
        setMsg((prev) => ({ ...prev, [field]: message }));
      } else {
        alert("Network error. Please check your connection.");
      }
    }
  };

  return (
    <div 
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{ 
        backgroundColor: "#fdfaf9", 
        backgroundImage: "radial-gradient(#efebe9 1px, transparent 1px)",
        backgroundSize: "20px 20px"
      }}
    >
      <div className="row shadow-lg bg-white rounded-4 overflow-hidden mx-2" style={{ maxWidth: "850px", width: "100%" }}>
        <div 
          className="col-md-6 d-none d-md-flex flex-column justify-content-center p-5 text-white"
          style={{ 
            backgroundImage: `linear-gradient(rgba(62, 39, 35, 0.7), rgba(62, 39, 35, 0.7)), url('./login.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "450px"
          }}
        >
          <h1 className="display-4 fw-bold mb-3">E-Shop<span style={{ color: "#8d6e63" }}>.</span></h1>
          <p className="lead opacity-75">Step back into your world of curated style.</p>
        </div>

        <div className="col-md-6 p-4 p-lg-5 d-flex flex-column justify-content-center">
          <div className="mb-4 text-center text-md-start">
            <h2 className="fw-bold" style={{ color: "#3e2723" }}>Welcome Back</h2>
            <p className="text-secondary small">Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-uppercase tracking-wider text-muted" style={{ fontSize: "0.7rem" }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                className={`form-control border-0 bg-light p-2 ${msg.email ? "is-invalid" : ""}`}
                placeholder="name@example.com"
              />
              <div className="invalid-feedback">{msg.email}</div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-uppercase tracking-wider text-muted" style={{ fontSize: "0.7rem" }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={user.password}
                onChange={handleChange}
                className={`form-control border-0 bg-light p-2 ${msg.password ? "is-invalid" : ""}`}
                placeholder="••••••••"
              />
              <div className="invalid-feedback">{msg.password}</div>
            </div>

            <button
              type="submit"
              className="btn w-100 py-2 fw-bold shadow-sm"
              style={{ backgroundColor: "#3e2723", color: "#fff", letterSpacing: "1px" }}
            >
              SIGN IN
            </button>
          </form>

          <div className="text-center mt-4 pt-2">
            <span className="text-muted small">New to E-Shop? </span>
            <Link
              to="/register"
              className="fw-bold text-decoration-none small"
              style={{ color: "#8d6e63" }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

