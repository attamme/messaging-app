import demoPic from '../assets/demo.jpg'

const Sidebar = () => (
    <div className="sidebar">
        <img src={demoPic} className="server-icon" alt="server-icon1" />
        <img src={demoPic} className="server-icon" alt="server-icon1" />
        <button className="add-server">+</button>
    </div>
)

export default Sidebar