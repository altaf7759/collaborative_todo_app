import { useState } from "react";
import { useAppContext } from "../context/userContext";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import axios from "axios";
const backend_url = import.meta.env.VITE_BACKEND_BASE_URL

const Profile = () => {
      const { theme, user } = useAppContext();

      // Modal & state
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [isOtpSending, setIsOtpSending] = useState(false);
      const [otp, setOtp] = useState("");
      const [newPassword, setNewPassword] = useState("");

      const close = () => {
            setIsModalOpen(false)
            setIsOtpSending(false)
            setOtp("")
            setNewPassword("")
      }

      const sendOtp = async () => {
            setIsModalOpen(true)
            try {
                  const { data } = await axios.post(`${backend_url}/api/user/generate-otp`, {}, { withCredentials: true })
                  alert(data?.message)
            } catch (error) {
                  console.log(error)
                  alert(error?.response?.data?.message || "Error while generating OTP")
                  setIsModalOpen(false)
            }
      }

      // Reset Password function
      const resetPassword = async () => {
            if (!otp || otp.length !== 6) {
                  return alert("Please enter a valid 6-digit OTP.");
            }
            if (!newPassword) {
                  return alert("Please enter your new password.");
            }

            setIsOtpSending(true);
            try {
                  const { data } = await axios.patch(`${backend_url}/api/user/reset-password`, { otp, newPassword }, { withCredentials: true })
                  alert(data?.message)
                  setIsModalOpen(false);
                  setOtp("");
                  setNewPassword("");
            } catch (error) {
                  console.error(error);
                  alert(error.message || "Error while resetting password");
            } finally {
                  setIsOtpSending(false);
            }
      };

      return (
            <div
                  className={`max-w-[1200px] m-auto p-4 ${theme.mode === "dark" ? "text-white" : "text-[#4b5563]"
                        }`}
            >
                  <h1 className="text-xl font-semibold">Manage your profile</h1>

                  <div className="mt-10 text-gray-300">
                        <p>Username:</p>
                        <p>{user.userName}</p>
                  </div>

                  <div className="mt-5 text-gray-300">
                        <p>Email:</p>
                        <p>{user.email}</p>
                  </div>

                  <Button className="mt-5" onClick={sendOtp}>
                        Reset Password
                  </Button>

                  {/* Reset password modal */}
                  {/* Reset password modal */}
                  {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex justify-center items-center">
                              {/* Overlay without click handler */}
                              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                              {/* Modal content */}
                              <div
                                    className={`relative z-10 w-[90%] max-w-md rounded-lg p-6 flex flex-col gap-4 ${theme.mode === "dark"
                                          ? "bg-[#393a3a] text-white"
                                          : "bg-[#d4dce5] text-[#4b5563]"
                                          }`}
                              >
                                    <div className="flex justify-between items-center">
                                          <h1 className="text-xl font-bold">Reset Password</h1>
                                          <X
                                                className="cursor-pointer"
                                                onClick={close}
                                          />
                                    </div>

                                    <input
                                          type="text"
                                          placeholder="Enter 6-digit OTP"
                                          value={otp}
                                          onChange={(e) => {
                                                const value = e.target.value;
                                                if (/^\d{0,6}$/.test(value)) setOtp(value);
                                          }}
                                          className="w-full p-2 rounded border"
                                    />

                                    <input
                                          type="password"
                                          placeholder="Enter new password"
                                          value={newPassword}
                                          onChange={(e) => setNewPassword(e.target.value)}
                                          className="w-full p-2 rounded border"
                                    />

                                    <div className="flex justify-end">
                                          <Button onClick={resetPassword} disabled={isOtpSending}>
                                                {isOtpSending ? "Sending..." : "Reset Password"}
                                          </Button>
                                    </div>
                              </div>
                        </div>
                  )}

            </div>
      );
};

export default Profile;
