import LoginNavbar from "../components/LoginNavbar";
import HeaderSection from "../components/HeaderSection";
import LoginForm from "../components/LoginForm";
import SocialLogin from "../components/SocialLogin";
import Footer from "../components/Footer";

import "../css/Login.css";


function Login() {
    return (
        <div className="landingPage">
            <div className="mainContent">
                <div className="hero">
                    <LoginNavbar />
                    <HeaderSection />
                    <div className="user">
                        <LoginForm />
                        <SocialLogin />
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default Login;
