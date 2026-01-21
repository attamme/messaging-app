import React, { useState } from 'react'
import demoPic from '../assets/demo.jpg'

const ChatArea = () => {
    const [message, setMessage] = useState('')

    return (
        <div className="chat-area">
            <div className="message-container">
                {/* messages from database */}
                <div className="message">
                    <img src={demoPic} className="message-profile" alt="avatar"/>
                    <strong>User:</strong> Welcome!
                </div>
            </div>
            <div className="input-container">
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Send a message..."
                />
            </div>
        </div>
    )
}

export default ChatArea