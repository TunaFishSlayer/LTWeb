import { useState } from "react";
import { LuMail } from "react-icons/lu";
import { Link } from "react-router-dom";
import "../styles/ForgotPass.css";

const API_BASE = "/api";

const apiForgotPassword = async (email) => {
  const response = await fetch(`${API_BASE}/auth/forgot-password`, {
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
      setError("Vui lòng nhập email của bạn");
      return;
    }

    if (!validateEmail(email)) {
      setError("Email không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      
      const result = await apiForgotPassword(email);
      setSuccess("Email khôi phục mật khẩu đã được gửi! Vui lòng kiểm tra hòm thư của bạn.");
      
      // Clear form after successful submission
      setEmail("");
      
    } catch (err) {
      if (err.message === "User not found") {
        setError("Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại.");
      } else {
        setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-pass-page">
      <div className="forgot-pass-card">
        <div className="forgot-pass-header">
          <h1 className="forgot-pass-title">Quên Mật Khẩu</h1>
          <p className="forgot-pass-subtitle">
            Nhập email của bạn để nhận link khôi phục mật khẩu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-pass-form">
          <label>Email</label>
          <div className="input-group-email">
            <LuMail className="icon-email" />
            <input
              type="email"
              placeholder="Nhập email của bạn"
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
            {loading ? 'Đang gửi...' : 'Gửi Link Khôi Phục'}
          </button>
        </form>

        <div className="forgot-pass-footer">
          <p>
            Nhớ lại mật khẩu?{" "}
            <Link to="/login" className="login-link">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}