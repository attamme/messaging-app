import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"

export default function Login({ onLogin }) {
    const navigate = useNavigate()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("")

        try {
            const response = await fetch("http://localhost:5001/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password})
            })

            const data = await response.json()
            console.log(data)

            if (response.ok) {
                localStorage.setItem("token", data.token)
                onLogin(data.user)
                navigate("/channels")
            } else {
                setError(data.message || "Log in failed")
            }
        } catch (err) {
            setError("Can't connect to backend")
        }
    }

    return (
        <div className="auth-page">
            <div className="login-box">
                <h2>Log in</h2>

                <form onSubmit={handleLogin}>
                    <div className="input-field">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="input-field">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    {error && <p className="error-msg">{error}</p>}

                    <button type="submit" className="primary-button">
                        Log in
                    </button>

                    <p className="footer-text">
                        Don't have an account? <Link to="/signup" className="link">Sign up</Link>
                    </p>

                </form>
            </div>
        </div>
    )
}
