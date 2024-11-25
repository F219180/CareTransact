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

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = (e) => {
        e.preventDefault();
        setShowPassword(!showPassword);
    };

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            axios.post('http://localhost:5000/api/auth/create-profile', { email })
                .then(response => console.log(response.data))
                .catch(error => console.error(error));
            toast.success("Successfully Logged in!", {
                style: { backgroundColor: "#4caf50", color: "#fff" }
            });
            navigate('/updated_profile'); // Navigate to updated profile
        } catch (error) {
            toast.error(`Error: ${error.message}`, {
                style: { backgroundColor: "#f44336", color: "#fff" }
            });
        }
        console.log('email: ', email);
        console.log('Password: ', password);
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
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <div className="login-footer">
                            <button type="submit">Continue</button>
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