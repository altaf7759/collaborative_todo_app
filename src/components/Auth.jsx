import { useEffect, useState } from "react";
import axios from "axios";
const backend_url = import.meta.env.VITE_BACKEND_BASE_URL;

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { useAppContext } from "../context/userContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const Auth = () => {
  const { theme, updateUser } = useAppContext();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email")
  const todoId = searchParams.get("todoId")
  const { user } = useAppContext()

  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [])

  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const textColor = theme.mode === "dark" ? "white" : "#1f2937";
  const cardBg = theme.mode === "dark" ? "#2c2d2d" : "#f7f7f7";

  const updateForm = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    if (token && email && todoId) {
      setIsSignup(true);
      setForm((prev) => ({
        ...prev,
        email,
      }));
    }
  }, [token, email]);

  // ================================
  // LOGIN
  // ================================
  const handleLogin = async () => {
    console.log("Login Data:", form);
    setLoading(true);

    try {
      const { data } = await axios.post(`${backend_url}/api/user/login`, {
        identifier: form.email,
        password: form.password,
      }, { withCredentials: true });

      console.log("Login Success:", data);
      localStorage.setItem("user", JSON.stringify(data.user))
      updateUser(data.user)
      alert("Login successful!");
      if (token && email && todoId) {
        try {
          const { data } = await axios.post(`${backend_url}/api/todo/invite/complete`, { token }, { withCredentials: true })
          alert(data?.message)
          navigate(`/todo/${todoId}?accept=true`)
        } catch (error) {
          console.log(error)
          alert(error?.response?.data?.message || "Error while accepting invitation")
        }
      } else {
        navigate("/")
      }
    } catch (error) {
      console.log(error);

      if (error.response) {
        alert(error.response.data.message || "Login failed");
      } else {
        alert("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // SIGNUP
  // ================================
  const handleSignup = async () => {
    console.log("Signup Data:", form);
    setLoading(true);

    try {
      const { data } = await axios.post(`${backend_url}/api/user/register`, form);
      console.log("Signup Success:", data);

      alert("Account created successfully!");

      // Switch to login mode after signup
      setIsSignup(false);
    } catch (error) {
      console.log(error);

      if (error.response) {
        alert(error.response.data.message || "Registration failed");
      } else {
        alert("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // UI
  // ================================
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "20px",
        maxWidth: "450px",
        width: "100%",
        margin: "80px auto",
      }}
    >
      <Card
        style={{
          width: "400px",
          backgroundColor: cardBg,
          color: textColor,
          border: "none"
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: textColor, fontSize: "22px" }}>
            {isSignup ? "Create Account" : "Welcome Back"}
          </CardTitle>

          <CardDescription
            style={{ color: theme.mode === "dark" ? "#c4c4c4" : "#4b5563" }}
          >
            {isSignup
              ? "Sign up to manage your tasks"
              : "Login to continue with your todos"}
          </CardDescription>
        </CardHeader>

        <CardContent
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {/* Username field (Signup only) */}
          {isSignup && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <Label style={{ color: textColor }}>Username</Label>
              <Input
                placeholder="Enter username"
                name="userName"
                value={form.userName}
                onChange={updateForm}
              />
            </div>
          )}

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <Label style={{ color: textColor }}>Email</Label>
            <Input
              type="email"
              placeholder="Enter email"
              name="email"
              value={form.email}
              onChange={updateForm}
            />
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <Label style={{ color: textColor }}>Password</Label>
            <Input
              type="password"
              placeholder="Enter password"
              name="password"
              value={form.password}
              onChange={updateForm}
            />
          </div>

          {/* Submit button */}
          <Button
            disabled={loading}
            onClick={isSignup ? handleSignup : handleLogin}
            style={{
              marginTop: "10px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Loading..." : isSignup ? "Sign Up" : "Login"}
          </Button>

          {/* Switch Form */}
          <p style={{ textAlign: "center", marginTop: "1rem", color: textColor }}>
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <span
              onClick={() => setIsSignup(!isSignup)}
              style={{
                color: "#3b82f6",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              {isSignup ? "Login" : "Sign Up"}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
