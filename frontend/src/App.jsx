import React from 'react'
import {BrowserRouter, Route, Routes} from "react-router-dom"
import Login from './pages/Login'
import Home from './pages/Home';
import {ToastContainer} from  "react-toastify"
import VerifyOtp from './pages/VerifyOtp';
import { AppData } from './context/AppContext';
import Loading from './Loading';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Verify from './pages/verify';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


const App = () => {
  const {isAuth ,loading} = AppData();
  return (
    <>
    {loading? (
      <Loading />
    ) : (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={isAuth? <Home />:<Login />}/>
      <Route path="/login" element={isAuth? <Home />:<Login />}/>
      <Route path="/verifyotp" element={<VerifyOtp />}/>
      <Route path="/register" element={isAuth ? <Home /> : <Register />} />
      <Route path="/dashboard" element={isAuth ? <Dashboard /> : <Login />} />
      <Route path="/token/:token" element={isAuth ? <Home /> : <Verify/>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
    </Routes>
    <ToastContainer />
    </BrowserRouter>
    )}
    </>
  )
}

export default App
