import { useState, useEffect, useRef } from "react"

const WS_URL = "ws://localhost:5001/ws"

export default function ChatArea({ channel }) {
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const socketRef = useRef(null)

    /* connecting to websocket */
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) return

        const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`)
        socketRef.current = ws

        ws.onopen = () => console.log("WebSocket connected")

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.type === "message:new") {
                setMessages((prev) => [...prev, data.message])
            }
        }

        ws.onclose = () => console.log("WebSocket disconnected")

        return () => ws.close()
    }, [])

    /* joining a channel */
    useEffect(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN && channel) {
            socketRef.current.send(JSON.stringify({
                type: "join",
                channelId: channel._id || channel.id
            }))
        }
    }, [channel])

    /* message history */
    useEffect(() => {
        const fetchMessages = async () => {
            if (!channel) return

            const id = channel._id || channel.id
            console.log("Asking for messages to channels:", id)

            try {
                const token = localStorage.getItem("token")
                console.log("Asking for messages to channels:", channel._id || channel.id)
                const response = await fetch(`http://localhost:5001/api/chat/messages?channelId=${encodeURIComponent(id)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (response.ok) {
                    const data = await response.json()
                    const messageData = Array.isArray(data) ? data : (data.messages || [])
                    setMessages(messageData)
                } else {
                    console.error("Backend responded with error:", response.status)
                }
            } catch (err) {
                console.error("Problem loading messages:", err)
            }
        }
        fetchMessages()
    }, [channel])

    /* send message */
    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !channel || !socketRef.current) return

        const channelId = channel._id || channel.id

        socketRef.current.send(JSON.stringify({
            type: "message",
            channelId: channelId,
            content: newMessage
        }))
        setNewMessage("")
    }

    if (!channel) return <div className="chat-area">Choose a channel to start a conversation!</div>

    return (
        <div className="chat-area">
            <header className="chat-header">
                <h3># {channel.name}</h3>
            </header>

            <div className="messages-container">
                {messages.map((msg, index) => (
                    <div key={msg._id || index} className="message-item">
                        <div className="message-avatar"></div>
                        <div className="message-content">
                            <span className="user-name">{msg.sender?.username || msg.username || "User"}</span>
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            <form className="message-input-form" onSubmit={handleSendMessage}>
                <input 
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message #${channel.name}`}
                />
            </form>
        </div>
    )
}