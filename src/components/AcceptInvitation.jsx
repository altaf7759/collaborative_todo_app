import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/userContext";

const backend_url = import.meta.env.VITE_BACKEND_BASE_URL;

const AcceptInvitation = () => {
      const [searchParams] = useSearchParams();
      const token = searchParams.get("token");
      const navigate = useNavigate();
      const { theme } = useAppContext();

      const [status, setStatus] = useState("loading"); // loading | error
      const hasRun = useRef(false); // prevent double call (React strict mode)

      useEffect(() => {
            if (!token) {
                  setStatus("error");
                  return;
            }

            if (hasRun.current) return;
            hasRun.current = true;

            const acceptInvitation = async () => {
                  try {
                        const { data } = await axios.post(
                              `${backend_url}/api/todo/invite/accept`,
                              { token },
                              { withCredentials: true }
                        );

                        // 🔀 Backend-driven navigation
                        if (data.requireSignup) {
                              alert("You are not register with us. please signup to accept this invitation")
                              navigate(`/auth?token=${token}&email=${data.email}&todoId=${data.todoId}`);
                        } else {
                              alert("Invitation accepted successfully")
                              navigate(`/todo/${data.todoId}?accepted=true`);
                        }
                  } catch (error) {
                        console.log(error);
                        setStatus("error");
                  }
            };

            acceptInvitation();
      }, [token, navigate]);

      return (
            <div
                  className={`flex items-center justify-center h-screen ${theme.mode === "dark"
                        ? "bg-[#393a3a] text-white"
                        : "bg-[#d4dce5] text-[#4b5563]"
                        }`}
            >
                  {status === "loading" && <p>Accepting invitation…</p>}
                  {status === "error" && <p>Invalid or expired invitation link.</p>}
            </div>
      );
};

export default AcceptInvitation;
