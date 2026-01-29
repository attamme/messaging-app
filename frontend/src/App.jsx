import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom"
import Sidebar from "./components/Sidebar";
import ChannelList from "./components/ChannelList";
import ChatArea from "./components/ChatArea";
import Login from "./views/auth/log-in";
import Signup from "./views/auth/sign-up";
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="app-container">
      <Routes>

        {/* public paths */}
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/signup" element={<Signup onSignup={() => setIsLoggedIn(true)} />} />
        
        {/* main app (protected) */}
        <Route 
          path="/app" 
          element={isLoggedIn ? 
          (
            <div className="main-layout">
              <Sidebar />
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