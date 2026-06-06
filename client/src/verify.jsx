import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Verify() {
    const { userid, uniquestring } = useParams()
    const [verifying, setVerifying] = useState(true)
    const [message, setMessage] = useState('')
    const [status, setStatus] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/verify/${userid}/${uniquestring}`
                )

                if (response.data.status === 'ok') {
                    setStatus('success')
                    setMessage(response.data.message)
                    setTimeout(() => navigate('/login'), 3000)
                }
            } catch (err) {
                setStatus('error')
                if (err.response?.data?.message) {
                    setMessage(err.response.data.message)
                } else {
                    setMessage('Email verification failed. Please try again.')
                }
            } finally {
                setVerifying(false)
            }
        }

        if (userid && uniquestring) {
            verifyEmail()
        }
    }, [userid, uniquestring, navigate])

    return (
        <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
            <div className="bg-white p-5 rounded text-center" style={{ width: '400px' }}>
                {verifying ? (
                    <>
                        <div className="spinner-border mb-3" role="status">
                            <span className="visually-hidden">Verifying...</span>
                        </div>
                        <h2>Verifying Email</h2>
                        <p>Please wait while we verify your email address...</p>
                    </>
                ) : (
                    <>
                        {status === 'success' ? (
                            <>
                                <div className="alert alert-success" role="alert">
                                    ✓ Success
                                </div>
                                <h2 className="text-success">Email Verified!</h2>
                                <p className="mt-3">{message}</p>
                                <p className="text-muted">Redirecting to login...</p>
                            </>
                        ) : (
                            <>
                                <div className="alert alert-danger" role="alert">
                                    ✗ Error
                                </div>
                                <h2 className="text-danger">Verification Failed</h2>
                                <p className="mt-3">{message}</p>
                                <button 
                                    className="btn btn-primary mt-3"
                                    onClick={() => navigate('/login')}
                                >
                                    Back to Login
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default Verify
