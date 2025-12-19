import { useState, useEffect } from "react";
import { LuLock, LuEye, LuEyeClosed } from "react-icons/lu";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import "../styles/ResetPass.css";

const API_BASE = "/api";

const apiResetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, newPassword })
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
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validation
    if (!newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      
      await apiResetPassword(token, newPassword);
      setSuccess("Mật khẩu đã được đặt lại thành công! Đang chuyển hướng...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err) {
      if (err.message === "Invalid or expired reset token") {
        setError("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.");
      } else {
        setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="reset-pass-page">
        <div className="reset-pass-card">
          <div className="reset-pass-header">
            <h1 className="reset-pass-title">Link Hết Hạn</h1>
            <p className="reset-pass-subtitle">
              Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
            </p>
          </div>
          
          <div className="reset-pass-footer">
            <Link to="/forgot-password" className="reset-link">
              Yêu cầu link mới
            </Link>
            <span className="divider">|</span>
            <Link to="/login" className="login-link">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-pass-page">
      <div className="reset-pass-card">
        <div className="reset-pass-header">
          <h1 className="reset-pass-title">Đặt Lại Mật Khẩu</h1>
          <p className="reset-pass-subtitle">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="reset-pass-form">
          <label>Mật khẩu mới</label>
          <div className="input-group-password">
            <LuLock className="icon-lock" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu mới"
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

          <label>Xác nhận mật khẩu</label>
          <div className="input-group-password">
            <LuLock className="icon-lock" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Xác nhận mật khẩu mới"
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
            {loading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
          </button>
        </form>

        <div className="reset-pass-footer">
          <Link to="/login" className="login-link">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
