import "../styles/NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">Page Not Found</h2>
        <p className="notfound-text">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="notfound-buttons">
          <button
            className="btnn btn-primary"
            onClick={() => (window.location.href = "/")}
          >
            Return Home
          </button>

          <button className="btnn btn-outline" onClick={() => window.history.back()}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
