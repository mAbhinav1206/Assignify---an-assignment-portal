import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="landingPage">
      <div className="mainContent notFoundPage">
        <div className="notFoundCard">
          <h1>Page not found</h1>
          <p>The page you tried to open does not exist in this workspace.</p>
          <button className="viewBtn" type="button" onClick={() => navigate("/")}>
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
