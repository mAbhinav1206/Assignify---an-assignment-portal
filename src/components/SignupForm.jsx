import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupForm = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSignup = async () => {


        // basic validation
        if (!email || !confirmEmail || !password || !confirmPassword) {
            alert("Please fill all fields");
            return;
        }

        if (email !== confirmEmail) {
            alert("Emails do not match");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {

            const res = await fetch("http://localhost:5000/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await res.json();

            if (data.message === "User created") {
                alert("Account created successfully 🎉");
                navigate("/"); // redirect to login page
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.log(error);
            alert("Server error");
        }


    };

    return (<div className="leftBox"> <div className="userCredentials">


        <div className="email inputBox">
            <input
                type="email"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
            />
        </div>

        <div className="confirmEmail inputBox">
            <input
                type="email"
                placeholder="Confirm email"
                onChange={(e) => setConfirmEmail(e.target.value)}
            />
        </div>

        <div className="password inputBox">
            <input
                type="password"
                placeholder="Choose a password"
                onChange={(e) => setPassword(e.target.value)}
            />
        </div>

        <div className="confirmPassword inputBox">
            <input
                type="password"
                placeholder="Confirm password"
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
        </div>

        <div className="submitBtn">
            <button type="button" onClick={handleSignup}>
                Sign Up
            </button>
        </div>

    </div>
    </div>

    );
};

export default SignupForm;
