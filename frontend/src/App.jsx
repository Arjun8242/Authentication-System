import React from 'react'
import {BrowserRouter, Route, Routes} from "react-router-dom"
import Login from './pages/Login'
import Home from './pages/Home';
import {ToastContainer} from  "react-toastify"
import VerifyOtp from './pages/VerifyOtp';
import { AppData } from './context/AppContext';
import Loading from './Loading';


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
      <Route path="/verifyotp" element={isAuth? <Home />:<VerifyOtp />}/>
    </Routes>
    <ToastContainer />
    </BrowserRouter>
    )}
    </>
  )
}

export default App
