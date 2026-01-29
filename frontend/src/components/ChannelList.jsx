import { useState, useEffect } from "react"

export default function ChannelList({ onSelectChannel }) {
    const [channels, setChannels] = useState([])
    const [selectedId, setSelectedId] = useState(null)

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const token = localStorage.getItem("token")
                const response = await fetch("http://localhost:5001/api/chat/channels", {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const data = await response.json()

                if (response.ok) {
                    const channelData = Array.isArray(data) ? data : (data.channels || [])
                    setChannels(channelData)
                    if (channelData.length > 0) {
                        setSelectedId(channelData[0]._id)
                        onSelectChannel(channelData[0])
                    }
                }
            } catch (err) {
                console.error("Problem loading channels: ", err)
            }
        }
        fetchChannels()
    }, [])

    return (
        <div className="channel-list">
            <div className="server-header">
                <h3>Kooliprojekt</h3>
            </div>

            <div className="channels-container">
                {channels.map((channel, index) => (
                    <div
                        key={channel._id || channel.id || index}
                        className={`channel-item ${selectedId === (channel._id || channel.id) ? 'active' : ''}`}
                        onClick={() => {
                            setSelectedId(channel._id || channel.id)
                            onSelectChannel(channel)
                        }}>
                        <span className="hash"># </span>{channel.name}
                    </div>
                ))}
            </div>
        </div>
    )
}