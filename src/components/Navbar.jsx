import { Moon, Sun, User } from "lucide-react";
import { useAppContext } from "../context/userContext";
const backend_url = import.meta.env.VITE_BACKEND_BASE_URL;

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { theme, toggleTheme, user } = useAppContext();

  const textColor = theme.mode === "dark" ? "#ffffff" : "#4b5563";
  const iconColor = textColor;
  const hoverBg = theme.mode === "dark" ? "#333" : "#f0f0f0";
  const bgColor = theme.mode === "dark" ? "#212121" : "#ffffff";
  const borderColor = theme.mode === "dark" ? "#444" : "#ccc";
  const menuBg = theme.mode === "dark" ? "#1f1f1f" : "#ffffff";
  const dividerColor = theme.mode === "dark" ? "#444" : "#e5e5e5";
  const navigate = useNavigate()

  const logout = async () => {
    try {
      const { data } = await axios.post(
        `${backend_url}/api/user/logout`,
        {}, // empty body
        { withCredentials: true } // config object
      );

      alert(data?.message);

      // Optional: Clear user data from localStorage
      localStorage.removeItem("user");

      // Optional: Redirect to login page
      window.location.href = "/auth";
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Logout failed. Try again.");
    }
  };


  return (
    <header style={{ backgroundColor: bgColor, borderBottom: `1px solid ${borderColor}` }}>
      <nav
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem",
        }}
      >
        <h1 style={{ fontSize: "1.2rem", fontWeight: "bold", color: textColor }}>
          Multi-User Todo App
        </h1>

        <div style={{ display: "flex", gap: "1rem" }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "50%",
              padding: "0.5rem",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            aria-label="Toggle Theme"
          >
            {theme.mode === "light" ? <Moon color={iconColor} size={20} /> : <Sun color={iconColor} size={20} />}
          </button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "50%",
                  padding: "0.5rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                aria-label="User Menu"
              >
                <User color={iconColor} size={20} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="bottom"
              align="end"
              style={{
                minWidth: "180px",
                backgroundColor: menuBg,
                color: textColor,
                borderRadius: "8px",
                padding: "0.5rem 0",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                border: `1.5px solid ${borderColor}`
              }}
            >
              {user?.userName ? (
                <>
                  <DropdownMenuItem style={{ fontWeight: "bold", cursor: "default" }}>
                    {user.userName}
                  </DropdownMenuItem>
                  <DropdownMenuItem style={{ cursor: "default" }}>{user.email}</DropdownMenuItem>
                  <hr style={{ borderColor: dividerColor, margin: "0.5rem 0" }} />
                  <DropdownMenuItem style={{ padding: "0.5rem 1rem", cursor: "pointer" }} onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
                  <DropdownMenuItem style={{ padding: "0.5rem 1rem", cursor: "pointer" }} onClick={logout}>Logout</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>Login</DropdownMenuItem>
                  <DropdownMenuItem style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>Register</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
