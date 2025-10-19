import React, { useState, useEffect } from "react";
import { AppData } from "../context/AppContext";
import { toast } from "react-toastify";
import api from "../apiInterceptor.js"; 

const Dashboard = () => {
  const { user, logoutUser } = AppData();
  const [content, setContent] = useState("");

  async function fetchAdminData() {
    try {
      const { data } = await api.get(`/api/v1/admin`, {
        withCredentials: true,
      });
      setContent(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch admin data");
    }
  }

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {content && (
        <div className="mb-4 text-lg font-semibold text-green-600">
          {content}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.name}</h1>

      <button
        onClick={logoutUser}
        className="px-4 py-2 bg-red-500 text-white rounded-md"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
