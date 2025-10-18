import React from "react";
import { AppData } from "../context/AppContext";

const Dashboard = () => {
  const { user, logoutUser } = AppData();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
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
