import React, { useState, type ChangeEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { userSchema } from "../Validation/userSchema";

const Register = () => {
  const [msg, setMsg] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const navigate = useNavigate();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    setMsg((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = userSchema.safeParse(user);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setMsg({
        name: fieldErrors.name?.[0] || "",
        email: fieldErrors.email?.[0] || "",
        password: fieldErrors.password?.[0] || "",
        role: fieldErrors.role?.[0] || "",
      });
      return;
    }

    try {
      await axios.post("http://localhost:3000/register", result.data);
      alert("User Created Successfully");
      navigate("/");
    } catch (error: any) {
      setMsg((prev) => ({
        ...prev,
        email: error.response?.data?.message || "Registration failed",
      }));
    }
  };

  return (
    <div className="container-fluid vh-100 p-0 overflow-hidden">
      <div className="row g-0 vh-100">
        <div
          className="col-lg-6 d-none d-lg-flex flex-column justify-content-center p-5 text-white"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('./register.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h1 className="display-3 fw-bold">
            Find Clothes That
            <br />
            Matches Your Style.
          </h1>
          <p className="lead opacity-75">Simple is more.</p>
        </div>

        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-white p-4">
          <div className="w-100" style={{ maxWidth: "400px" }}>
            <div className="text-center mb-5">
              <h2 className="fw-bold">Create Account</h2>
              <p className="text-secondary">
                It's free and only takes a minute
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  className={`form-control p-2 ${msg.name ? "is-invalid" : ""}`}
                  placeholder="Enter your name"
                />
                <div className="invalid-feedback">{msg.name}</div>
              </div>

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

              <div className="row">
                <div className="col-6 mb-3">
                  <label className="form-label fw-semibold small">Role</label>
                  <select
                    name="role"
                    value={user.role}
                    onChange={handleChange}
                    className={`form-select p-2 ${msg.role ? "is-invalid" : ""}`}
                  >
                    <option value="">Select</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="invalid-feedback">{msg.role}</div>
                </div>
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
                className="btn btn-dark w-100 py-2 fw-bold shadow-sm"
              >
                Sign Up
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-muted small">
                Already have an account?{" "}
              </span>
              <button
                onClick={() => navigate("/")}
                className="btn btn-link p-0 text-dark fw-bold text-decoration-none small"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
