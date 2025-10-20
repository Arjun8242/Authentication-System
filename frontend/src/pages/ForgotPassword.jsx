import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { server } from '../main';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${server}/api/v1/user/forgot-password`, { email }, { withCredentials: true });
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred');
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto flex flex-wrap items-center">
        <form onSubmit={handleSubmit} className="lg:w-2/6 md:w-1/2 bg-gray-100 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0">
          <h2 className="text-gray-900 text-lg font-medium title-font mb-5">Forgot Password</h2>
          <div className="relative mb-4">
            <label htmlFor="email" className="leading-7 text-sm text-gray-600">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full bg-white rounded border border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="text-white bg-pink-500 border-0 py-2 px-8 focus:outline-none hover:bg-pink-600 rounded text-lg" disabled={btnLoading}>
            {btnLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ForgotPassword;