import React from 'react'
import { AppData } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const { user, logoutUser } = AppData();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.name}</h1>
      <button
        onClick={() => logoutUser(navigate)}
        className="px-4 py-2 bg-red-500 text-white rounded-md"
      >
        Logout
      </button>
      {user && user.role === "admin" && (
        <Link
          to="/dashboard"
          className="bg-purple-700 text-white p-2 rounded-md"
        >
          Dashboard
        </Link>
      )}
    </div>
  );
}

export default Home;
