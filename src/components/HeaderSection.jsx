import React from "react";
import { Link } from "react-router-dom";

const HeaderSection = () => {
    return (
        <div className="header">
            <div className="signup">
                <h1>Log In</h1>
            </div>

            <div className="newUser">
                Don't have an account?{" "}
                <span>
                    <Link to="/signup">Sign Up</Link>
                </span>
            </div>
        </div>
    );
};

export default HeaderSection;
