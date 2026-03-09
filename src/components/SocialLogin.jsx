import React from "react";

const SocialLogin = () => {
    return (
        <div className="rightBox">
            <div className="directLogin">

                <div className="googleCard card">
                    <div className="googleIcon icon">
                        <div class="iconBoxGoogle">
                            <img src="/google.png" width="100%" />
                        </div>
                    </div>
                    <div className="boxText">Continue with Google</div>
                </div>

                <div className="facebookCard card">
                    <div className="facebookIcon icon">
                        <div class="iconBoxFB">
                            <img src="/facebook.png" width="100%" />
                        </div>
                    </div>
                    <div className="boxText">Continue with Facebook</div>
                </div>

            </div>
        </div>
    );
};

export default SocialLogin;
