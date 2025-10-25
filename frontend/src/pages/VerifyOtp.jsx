import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../main";
import { toast } from "react-toastify";
import { AppData } from "../context/AppContext";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const navigate = useNavigate();
  const { setIsAuth, setUser } = AppData();

const submitHandler = async (e) => {
  setBtnLoading(true);
  e.preventDefault();

  const email = localStorage.getItem("email");
  try {
    const { data } = await axios.post(
      `${server}/api/auth/v1/verify`,
      { email, otp },
      { withCredentials: true }
    );

    toast.success(data.message);
    setIsAuth(true);
    setUser(data.user);
    localStorage.clear("email");
    navigate("/");
  } catch (error) {
    toast.error(error.response?.data?.message || "Something went wrong");
  } finally {
    setBtnLoading(false);
  }
};

  return (
    <section className="text-gray-600 body-font">
        <form
          onSubmit={submitHandler}
          className="lg:w-2/6 md:w-1/2 bg-gray-100 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0"
        >
          <h2 className="text-gray-900 text-lg font-medium title-font mb-5">
            Verify Using otp
          </h2>
          <div className="relative mb-4">
            <label htmlFor="otp" className="leading-7 text-sm text-gray-600">
              Otp
            </label>
            <input
              type="number"
              id="otp"
              name="otp"
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button
            className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
            disabled={btnLoading}
          >
            {btnLoading ? "Submitting..." : "Button"}
          </button>
          <Link to={"/login"} className="text-xs text-gray-500 mt-3">
            go to login page
          </Link>
        </form>
    </section>
  );
};

export default VerifyOtp;
