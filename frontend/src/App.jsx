import React from "react";
import Sidebar from "./components/Sidebar";
import ChannelList from "./components/ChannelList";
import ChatArea from "./components/ChatArea";
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Sidebar /> {/* Servers list */}
      <ChannelList /> {/* Channels list */}
      <ChatArea /> {/* Messages and input */}
    </div>
  )
}

export default App