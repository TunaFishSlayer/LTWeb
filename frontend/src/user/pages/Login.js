import { useState } from "react";
import { LuUser, LuLock, LuEye, LuEyeClosed } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../lib/auth";
import "../styles/Login.css";

export default function Login() {
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [signupShowPassword, setSignupShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("login");
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    // Basic validation
    if (!loginForm.email || !loginForm.password) {
      setError("Vui lòng điền đầy đủ thông tin đăng nhập");
      return;
    }

    if (!validateEmail(loginForm.email)) {
      setError("Email không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      
      // Sử dụng mock authentication
      const success = login(loginForm.email, loginForm.password);
      
      if (!success) {
        throw new Error('Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
      }
      
      // Chuyển hướng về trang chủ sau khi đăng nhập thành công
      navigate("/");
      
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (signupForm.firstName && signupForm.lastName && signupForm.email && signupForm.password) {
      alert(`Tạo tài khoản cho: ${signupForm.email}`);
      navigate("/");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Taplop</h1>
        <p className="login-subtitle">Sign in to continue shopping</p>

        <div className="tabs">
          <button
            className={`tab-btn ${tab === "login" ? "active" : ""}`}
            onClick={() => setTab("login")}
          >
            Sign In
          </button>
          <button
            className={`tab-btn ${tab === "signup" ? "active" : ""}`}
            onClick={() => setTab("signup")}
          >
            Sign Up
          </button>
        </div>

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="form">
            <label>Email</label>
            <div className="input-group">
              <LuUser className="icon-login" />
              <input
                type="email"
                placeholder="john@example.com"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
                required
              />
            </div>

            <label>Password</label>
            <div className="input-group">
              <LuLock className="icon-login" />
              <input
                type={loginShowPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                required
              />
              <span
                className="toggle"
                onClick={() => setLoginShowPassword(!loginShowPassword)}
              >
                {loginShowPassword ? <LuEye size={18} /> : <LuEyeClosed size={18} />}
              </span>
            </div>

            {error && <div className="error-message">{error}</div>}
            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="form">
            <div className="grid">
              <div>
                <label>First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={signupForm.firstName}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={signupForm.lastName}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <label>Email</label>
            <div className="input-group">
              <LuUser className="icon-login" />
              <input
                type="email"
                placeholder="john@example.com"
                value={signupForm.email}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, email: e.target.value })
                }
                required
              />
            </div>

            <label>Password</label>
            <div className="input-group">
              <LuLock className="icon-login" />
              <input
                type={signupShowPassword ? "text" : "password"}
                placeholder="Create a password"
                value={signupForm.password}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, password: e.target.value })
                }
                required
              />
              <span
                className="toggle set-password-toggle"
                onClick={() => setSignupShowPassword(!signupShowPassword)}
              >
                {signupShowPassword ? <LuEye size={18} /> : <LuEyeClosed size={18} />}
              </span>
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <div className="password-input-wrapper">
                <LuLock className="icon-login" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={signupForm.confirmPassword}
                  onChange={(e) =>
                    setSignupForm({
                      ...signupForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="confirm-password-input"
                  required
                />
                <span
                  className="toggle confirm-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <LuEye size={18} /> : <LuEyeClosed size={18} />}
                </span>
              </div>
            </div>

            <button type="submit" className="btn-submit">
              Create Account
            </button>
          </form>
        )}

        <div className="demo-info">
          <p>Demo credentials:</p>
          <p>Email: demo@laptophub.com | Password: demo123</p>
        </div>
      </div>
    </div>
  );
}
