import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './signup.jsx'
import { BrowserRouter , Routes, Route } from 'react-router-dom'
import Login from './login.jsx'


function App() {
  

  return (
   <browserRouter>
    <Routes>
      <Route path='/signup' element={<Signup />} />

      <route path='/login' element={<Login/>} />
      <route path='/home' element={<Home/>} />
    </Routes>
   </browserRouter>
  )
}

export default App
