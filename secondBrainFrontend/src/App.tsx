import './App.css'
import { Dashboard } from './pages/Dashboard'
import { Signin } from './pages/Signin'
import { Signup } from './pages/Signup'
import { Landing } from './pages/Landing'
import { Share } from './pages/Share'
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import {ProtectedRoute } from './components/ProtectedRoute';
function App() {
    
  return (
    <BrowserRouter>
    <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* <Navigate to="/signup" replace /> */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/dashboard"
         element={
         <ProtectedRoute>
         <Dashboard />
         </ProtectedRoute>
         } />
        <Route path="/share/:shareId" element={<Share />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
