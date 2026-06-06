import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (!email || !password) {
            setError('Email and password are required')
            setLoading(false)
            return
        }

        try {
            const response = await axios.post('http://localhost:5000/login', {
                email,
                password
            })

            if (response.data.status === 'ok') {
                setEmail('')
                setPassword('')
                navigate('/home')
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message)
            } else {
                setError('Login failed. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleResendVerification = async () => {
        if (!email) {
            setError('Please enter your email')
            return
        }

        try {
            setLoading(true)
            const response = await axios.post('http://localhost:5000/resend-verification', {
                email
            })

            if (response.data.status === 'ok') {
                setError('')
                alert(response.data.message)
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message)
            } else {
                setError('Failed to resend verification email')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
            <div className="bg-white p-4 rounded w-25">
                <h2 className="mb-4">Login</h2>
                
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            <strong>Email</strong>
                        </label>
                        <input
                            type="email"
                            placeholder="Enter Email"
                            autoComplete="off"
                            name="email"
                            id="email"
                            className="form-control rounded-0"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            <strong>Password</strong>
                        </label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            autoComplete="off"
                            name="password"
                            id="password"
                            className="form-control rounded-0"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-success w-100 rounded-0"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <button 
                        type="button" 
                        className="btn btn-link w-100 mt-2"
                        onClick={handleResendVerification}
                        disabled={loading}
                    >
                        Didn't receive verification email? Resend
                    </button>
                </form>

                <p className="text-center mt-3">
                    Don't have an account? <a href="/signup">Sign up</a>
                </p>
            </div>
        </div>
    )
}

export default Login