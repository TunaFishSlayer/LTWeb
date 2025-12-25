import { useState } from "react";
import { LuMail } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import "../styles/ForgotPass.css";

const API_BASE = process.env.REACT_APP_API_URL;

const apiForgotPassword = async (email) => {
  const response = await fetch(`${API_BASE}/auth/request-reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send reset email');
  }
  
  return response.json();
};

export default function ForgotPass() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validation
    if (!email) {
      setError("input email please");
      return;
    }

    if (!validateEmail(email)) {
      setError("Email is not valid");
      return;
    }

    try {
      setLoading(true);
      
      await apiForgotPassword(email);
      setSuccess("Email reset password has been sent! Redirecting to reset page...");
      
      // Redirect to reset page after 2 seconds
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
      
    } catch (err) {
      if (err.message === "User not found") {
        setError("Email not found in the system. Please check again.");
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-pass-page">
      <div className="forgot-pass-card">
        <div className="forgot-pass-header">
          <h1 className="forgot-pass-title">Forgot Password</h1>
          <p className="forgot-pass-subtitle">
            Enter your email to receive a password reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-pass-form">
          <label>Email</label>
          <div className="input-group-email">
            <LuMail className="icon-email" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="forgot-pass-footer">
          <p>
            Forgot password?{" "}
            <Link to="/login" className="login-link">
              Login now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}