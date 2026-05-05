import LoginNavbar from "../components/LoginNavbar";
import SignupForm from "../components/SignupForm";
import SocialLogin from "../components/SocialLogin";
import SignupFooter from "../components/SignupFooter";

function TeacherSignup() {
  return (
    <div className="landingPage">
      <div className="mainContent">
        <div className="hero">
          <LoginNavbar />

          <div className="header signup">
            <h1>Create Teacher Account</h1>
            <p className="newUser">Set up your teacher workspace to manage students and assignments.</p>
          </div>

          <div className="user">
            <SignupForm role="teacher" />
            <SocialLogin />
          </div>

          <SignupFooter />
        </div>
      </div>
    </div>
  );
}

export default TeacherSignup;
