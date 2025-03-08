import React, { useState } from "react";
import './login_signup.css';
import Header from "../header.js";
import Footer from "../Footer.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";
import { Toaster, toast } from "sonner";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { setEmail: setEmailInAuth } = useAuth();

    const togglePasswordVisibility = (e) => {
        e.preventDefault();
        setShowPassword(!showPassword);
    };

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user.emailVerified) {
                const response = await axios.post('http://localhost:5000/api/auth/check-user-type', { email });
                const userType = response.data.userType;

                toast.success("Successfully logged in!", {
                    style: { backgroundColor: "#4caf50", color: "#fff" }
                });

                // Store email in AuthContext
                setEmailInAuth(email);

                // Redirect based on user type
                setTimeout(() => {
                    switch (userType) {
                        case 'admin':
                            navigate('/admin');
                            break;
                        case 'doctor':
                            navigate('/Doctor');
                            break;
                        case 'patient':
                            navigate('/profilePatient');
                            break;
                        case 'pharmacist':
                            navigate('/pharmacist-dashboard'); // Redirect to Pharmacist Dashboard
                            break;
                        case 'labAttendee':
                            navigate('/lab-attendee-dashboard'); // Redirect to Lab Attendant Dashboard
                            break;
                        case 'insuranceCompany':
                            navigate('/insurance-dashboard'); // Redirect to Insurance Dashboard
                            break;
                        default:
                            toast.error("User type not recognized.");
                            break;
                    }
                }, 3000);
            } else {
                toast.error("Please verify your email before logging in.", {
                    style: { backgroundColor: "#f44336", color: "#fff" }
                });
            }
        } catch (error) {
            toast.error(`Error: ${error.message}`, {
                style: { backgroundColor: "#f44336", color: "#fff" }
            });
        }
    };




    return (
        <>
            <Header />
            <Toaster position='top-center' richcolors closeButton />
            <div className="login-container">
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="signup-content">
                        <h2>Login</h2>
                        <div>
                            <div className="username-input-container">
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Email"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="password-input-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Password"
                                />
                            </div>
                            <span
                                className="login-password-toggle-icon"
                                onClick={togglePasswordVisibility}
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </span>
                        </div>
                        <div className="login-footer">
                            <button type="submit">Continue</button>
                            <div className="forgot-password">
                                <p><a href="/forgot-password"><b>Forgot Password?</b></a></p>
                            </div>
                            <div className="signup">
                                <p>Don't have an account?<a href="/signup"><b>Signup</b></a></p>
                            </div>
                        </div>

                    </div>
                    <div className="signup-image">
                        <img src="/signup.png" alt="signup" />
                    </div>
                </form>
            </div>
            <Footer />
        </>
    )
}
export default Login