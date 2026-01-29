import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

export default function Signup({ onSignup }) {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")

    const handleSignup = (e) => {
        e.preventDefault()

        if (password === confirmPassword) {
            onSignup(username)
        } else {
            setError("Passwords don't match")
        }

        onSignup()
        navigate("/channels")
    }

    return (
        <div className="auth-page">
            <div className="login-box">
                <h2>Sign up</h2>

                <form onSubmit={handleSignup}>
                    <div className="input-field">
                        <label>Username</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>

                    <div className="input-field">
                        <label>E-mail</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="input-field">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <div className="input-field">
                        <label>Confirm password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>

                    {error && <p className="error-msg">{error}</p>}

                    <button type="submit" className="primary-button">
                        Sign up
                    </button>

                    <p className="footer-text">
                        Already have an account? <Link to="/login" className="link">Log in</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}