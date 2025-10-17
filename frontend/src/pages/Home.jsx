import React from 'react'
import { AppData } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

function Home() {
  const { logoutUser } = AppData();
  const navigate = useNavigate();

  return (
    <div className="flex justify-center mt-40">
      <button
        className="bg-black text-white p-2 rounded-md"
        onClick={() => logoutUser(navigate)}
      >
        Logout
      </button>
    </div>
  );
}

export default Home;
