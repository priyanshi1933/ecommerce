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
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: "#fdfaf9",
        backgroundImage: "radial-gradient(#efebe9 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div
        className="row shadow-lg bg-white rounded-4 overflow-hidden mx-2"
        style={{ maxWidth: "900px" }}
      >
        <div
          className="col-md-5 d-none d-md-flex flex-column justify-content-end p-5 text-white"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(62, 39, 35, 0.8), transparent), url('./register.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "500px",
          }}
        >
          <h2 className="fw-bold mb-3">Join the Community.</h2>
          <p
            className="small opacity-75 border-start ps-3"
            style={{ borderColor: "#8d6e63 !important" }}
          >
            Experience the finest collection of minimalist fashion and curated
            essentials.
          </p>
        </div>

        <div className="col-md-7 p-4 p-lg-5">
          <div className="mb-4">
            <h3 className="fw-bold" style={{ color: "#3e2723" }}>
              Register
            </h3>
            <p className="text-muted small">Let's get your account set up.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-12 mb-3">
                <label
                  className="form-label small fw-bold text-uppercase tracking-wider text-muted"
                  style={{ fontSize: "0.7rem" }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  className={`form-control border-0 bg-light p-2 ${msg.name ? "is-invalid" : ""}`}
                  placeholder="John Doe"
                />
                <div className="invalid-feedback">{msg.name}</div>
              </div>

              <div className="col-12 mb-3">
                <label
                  className="form-label small fw-bold text-uppercase tracking-wider text-muted"
                  style={{ fontSize: "0.7rem" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  className={`form-control border-0 bg-light p-2 ${msg.email ? "is-invalid" : ""}`}
                  placeholder="john@example.com"
                />
                <div className="invalid-feedback">{msg.email}</div>
              </div>

              <div className="col-md-6 mb-3">
                <label
                  className="form-label small fw-bold text-uppercase tracking-wider text-muted"
                  style={{ fontSize: "0.7rem" }}
                >
                  Role
                </label>
                <select
                  name="role"
                  value={user.role}
                  onChange={handleChange}
                  className={`form-select border-0 bg-light p-2 ${msg.role ? "is-invalid" : ""}`}
                >
                  <option value="">Choose...</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="invalid-feedback">{msg.role}</div>
              </div>

              <div className="col-md-6 mb-3">
                <label
                  className="form-label small fw-bold text-uppercase tracking-wider text-muted"
                  style={{ fontSize: "0.7rem" }}
                >
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
            </div>

            <button
              type="submit"
              className="btn w-100 py-2 mt-4 fw-bold shadow-sm"
              style={{
                backgroundColor: "#3e2723",
                color: "#fff",
                letterSpacing: "1px",
              }}
            >
              CREATE ACCOUNT
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted small">Already a member? </span>
            <button
              onClick={() => navigate("/")}
              className="btn btn-link p-0 fw-bold text-decoration-none small"
              style={{ color: "#8d6e63" }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
