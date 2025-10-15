import React from 'react'
import { AppData } from '../context/AppContext'

function Home() {
  const {logoutUser} = AppData();
  return (
    <div className="flex w-[100px] m-auto mt-40">
      <button className="bg-black-500 text-white p-2 rounded-md" onClick={logoutUser}>Logout</button>
    </div>
  )
}

export default Home