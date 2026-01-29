import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom"
import Sidebar from "./components/Sidebar";
import ChannelList from "./components/ChannelList";
import ChatArea from "./components/ChatArea";
import Login from "./views/auth/log-in";
import Signup from "./views/auth/sign-up";
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true)


  /* token memory */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setIsLoggedIn(false)
        setLoading(false)
        return
      }

      try {
        const response = await fetch("http://localhost:5001/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
          setIsLoggedIn(true)
        } else {
          localStorage.removeItem("token")
          setIsLoggedIn(false)
        }

      } catch (err) {
        console.error("Auth check failed: ", err)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) return <div>Loading...</div>

  /* log out */
  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
  }

  return (
    <div className="app-container">
      <Routes>

        {/* public paths */}
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/signup" element={<Signup onSignup={() => setIsLoggedIn(true)} />} />
        
        {/* main app (protected) */}
        <Route 
          path="/channels" element={isLoggedIn ? 
          (
            <div className="main-layout">
              <Sidebar onLogout={handleLogout} />
              <ChannelList />
              <ChatArea />
            </div>
          ) : (<Navigate to="/login" />)} />

          <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

export default App