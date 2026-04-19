const SocialLogin = () => {
    return (
        <div className="rightBox">
            <div className="directLogin">

                <div className="googleCard card">
                    <div className="googleIcon icon">
                        <div className="iconBoxGoogle">
                            <img src="/google.png" width="100%" alt="Google" />
                        </div>
                    </div>
                    <div className="boxText">Continue with Google</div>
                </div>

                <div className="facebookCard card">
                    <div className="facebookIcon icon">
                        <div className="iconBoxFB">
                            <img src="/facebook.png" width="100%" alt="Facebook" />
                        </div>
                    </div>
                    <div className="boxText">Continue with Facebook</div>
                </div>

            </div>
        </div>
    );
};

export default SocialLogin;
