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
    <div className="container-fluid vh-100 p-0 overflow-hidden">
      <div className="row g-0 vh-100">
        <div
          className="col-lg-6 d-none d-lg-flex flex-column justify-content-center p-5 text-white"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('./login.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h1 className="display-3 fw-bold">E-Commerce.</h1>
        </div>

        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-white p-4">
          <div className="w-100" style={{ maxWidth: "400px" }}>
            <div className="mb-5">
              <h2 className="fw-bold">Login</h2>
              <p className="text-secondary">
                Enter your credentials to access your account
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  className={`form-control p-2 ${msg.email ? "is-invalid" : ""}`}
                  placeholder="name@example.com"
                />
                <div className="invalid-feedback">{msg.email}</div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small">Password</label>
                <input
                  type="password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  className={`form-control p-2 ${msg.password ? "is-invalid" : ""}`}
                  placeholder="••••••••"
                />
                <div className="invalid-feedback">{msg.password}</div>
              </div>

              <button
                type="submit"
                className="btn btn-dark w-100 py-2 fw-bold shadow-sm mb-3"
              >
                Sign In
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-muted small">Don't have an account? </span>
              <Link
                to="/register"
                className="text-dark fw-bold text-decoration-none small"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
