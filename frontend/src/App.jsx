import React from 'react'
import {BrowserRouter, Route, Routes} from "react-router-dom"
import Login from './pages/Login'
import Home from './pages/Home';
import {ToastContainer} from  "react-toastify"
import VerifyOtp from './pages/VerifyOtp';


const App = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/login" element={<Login />}/>
      <Route path="/verifyotp" element={<VerifyOtp />}/>
    </Routes>
    <ToastContainer />
    </BrowserRouter>
  )
}

export default App
