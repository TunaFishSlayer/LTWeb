import { useState } from "react";
import { LuUser, LuLock, LuEye, LuEyeClosed } from "react-icons/lu";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "./lib/auth";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import "./Login.css";


const API_BASE = "/api";

const apiLogin = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  return response.json();
};

const apiRegister = async (email, password, name) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }
  
  return response.json();
};

const apiGoogleLogin = async (credential) => {
  const response = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ credential })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Google login failed');
  }
  
  return response.json();
};

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function Login() {
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [signupShowPassword, setSignupShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "", role: "user" });
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
  const { login: setAuthUser } = useAuthStore();


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
      
      // Call backend API
      const result = await apiLogin(loginForm.email, loginForm.password);
      
      // Update auth store with backend response
      setAuthUser(result.user);
      
      // Store token in localStorage
      localStorage.setItem('token', result.token);
      
      // Navigate based on user role
      if (result.user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/user/home");
      }
      
    } catch (err) {
      // Check if user doesn't exist - suggest registration
      if (err.message === "Invalid email or password") {
        setError("Email hoặc mật khẩu không đúng. Nếu chưa có tài khoản, hãy đăng ký.");
      } else {
        setError(err.message || 'Có lỗi xảy ra khi đăng nhập');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (!signupForm.firstName || !signupForm.lastName || !signupForm.email || !signupForm.password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    
    if (!validateEmail(signupForm.email)) {
      setError("Email không hợp lệ");
      return;
    }
    
    if (signupForm.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setLoading(true);
      
      const name = `${signupForm.firstName} ${signupForm.lastName}`;
      const result = await apiRegister(signupForm.email, signupForm.password, name);
      
      // Update auth store with new user
      setAuthUser(result.user);
      
      // Store token
      localStorage.setItem('token', result.token);
      
      // Navigate to home
      navigate("/user/home");
      
    } catch (err) {
      // Handle specific error messages
      if (err.message === "Email already in use") {
        setError("Email đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.");
      } else if (err.message === "Password must be at least 6 characters") {
        setError("Mật khẩu phải có ít nhất 6 ký tự");
      } else {
        setError(err.message || 'Có lỗi xảy ra khi tạo tài khoản');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true);
      setError("");
      
      const result = await apiGoogleLogin(credentialResponse.credential);
      
      // Update auth store with backend response
      setAuthUser(result.user);
      
      // Store token in localStorage
      localStorage.setItem('token', result.token);
      
      // Navigate based on user role
      if (result.user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/user/home");
      }
      
    } catch (err) {
      setError(err.message || 'Đăng nhập bằng Google thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
                placeholder="demo@laptophub.com"
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
                placeholder=" ******** "
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

            <div className="forgot-password-link">
              <Link to="/forgot-password" className="forgot-link">
                Quên mật khẩu?
              </Link>
            </div>

            {error && <div className="error-message">{error}</div>}
            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>

            <div className="divider">
              <span>OR</span>
            </div>

            <div className="google-login-container">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  setError('Đăng nhập bằng Google thất bại');
                }}
                disabled={loading}
                text="signin_with"
                locale="vi"
              />
            </div>
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

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-submit">
              Create Account
            </button>

            <div className="divider">
              <span>OR</span>
            </div>

            <div className="google-login-container">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  setError('Đăng nhập bằng Google thất bại');
                }}
                disabled={loading}
                text="signup_with"
                locale="vi"
              />
            </div>
          </form>
        )}
        <button 
              type="button" 
              className="btn-back"
              onClick={() => navigate('/')}
            >
              Về trang chủ
            </button>
        <div className="demo-info">
          <p>Demo credentials:</p>
          <p><strong>User:</strong> Email: test@gmail.com | Password: 123456</p>
          <p><strong>Admin:</strong> Email: tuongii@gmail.com | Password: 123456</p>
        </div>
      </div>
    </div>
    </GoogleOAuthProvider>
  );
}
