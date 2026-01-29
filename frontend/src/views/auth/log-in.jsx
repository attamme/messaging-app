import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"

export default function Login({ onLogin }) {
    const navigate = useNavigate()
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();

        if (username === "test"&& password === "password") {
            onLogin(username);
        } else {
            setError("Invalid username or password.");
        }

        onLogin()
        navigate("/channels")
    }

    return (
        <div className="auth-page">
            <div className="login-box">
                <h2>Log in</h2>

                <form onSubmit={handleLogin}>
                    <div className="input-field">
                        <label>Username</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
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
        // Simple validation (in real app, validate against backend)
        /* if (username && password) {
            onLogin(username);
        } else {
            alert("Please enter both username and password.");
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Username: </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div>
                    <label>Password: </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                </div>
            </form>
        </div>    
    ); */
