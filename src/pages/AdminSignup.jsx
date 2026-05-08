import LoginNavbar from "../components/LoginNavbar";
import SignupForm from "../components/SignupForm";
import SocialLogin from "../components/SocialLogin";
import SignupFooter from "../components/SignupFooter";

function AdminSignup() {
  return (
    <div className="landingPage">
      <div className="mainContent">
        <div className="hero">
          <LoginNavbar />

          <div className="header signup">
            <h1>Create Admin Account</h1>
            <p className="newUser">Set up the admin workspace to manage teachers, students, and access control.</p>
          </div>

          <div className="user">
            <SignupForm role="admin" />
            <SocialLogin />
          </div>

          <SignupFooter />
        </div>
      </div>
    </div>
  );
}

export default AdminSignup;
