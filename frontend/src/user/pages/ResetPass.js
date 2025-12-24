import { useState } from "react";
import { LuLock, LuEye, LuEyeClosed } from "react-icons/lu";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import "../styles/ResetPass.css";

const API_BASE = "/api";

const apiResetPassword = async (email, verificationCode, newPassword) => {
  const response = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code: verificationCode, newPassword })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to reset password');
  }
  
  return response.json();
};

export default function ResetPass() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validation
    if (!verificationCode || !newPassword || !confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }
    
    if (!email) {
      setError("Email is required. Please go back to the forgot password page.");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      
      await apiResetPassword(email, verificationCode, newPassword);
      setSuccess("Password has been reset successfully! Redirecting to login...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err) {
      if (err.message === "Invalid verification code") {
        setError("Verification code is incorrect. Please check your email and try again.");
      } else if (err.message === "Expired verification code") {
        setError("Verification code has expired. Please request a new one.");
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="reset-pass-page">
      <div className="reset-pass-card">
        <div className="reset-pass-header">
          <h1 className="reset-pass-title">Reset Password</h1>
          <p className="reset-pass-subtitle">
            Enter the verification code sent to your email and your new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="reset-pass-form">
          <label>Email</label>
          <div className="input-group">
            <input
              type="email"
              value={email}
              disabled
              className="disabled-input"
            />
          </div>

          <label>Verification Code *</label>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              disabled={loading}
              maxLength={6}
            />
          </div>
          <label>New Password *</label>
          <div className="input-group-password">
            <LuLock className="icon-lock" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
            <span
              className="toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <LuEyeClosed size={18} /> : <LuEye size={18} />}
            </span>
          </div>

          <label>Confirm New Password *</label>
          <div className="input-group-password">
            <LuLock className="icon-lock" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
            <span
              className="toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <LuEyeClosed size={18} /> : <LuEye size={18} />}
            </span>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>

        <div className="reset-pass-footer">
          <Link to="/login" className="login-link">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
