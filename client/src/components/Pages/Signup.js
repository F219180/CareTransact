import React, { useState, useEffect } from "react";
import './login_signup.css';
import Header from "../header.js";
import Footer from "../Footer.js";
import { createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, reload } from "firebase/auth";
import { auth } from "../firebase.js";
import { Toaster, toast } from "sonner";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { db } from "../firebase"; // Adjust the path to your firebase.js
import { doc, setDoc } from "firebase/firestore";

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validations, setValidations] = useState({
        length: false,
        number: false,
        specialChar: false,
        passwordMatch: false
    });

    const [emailVerificationSent, setEmailVerificationSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        // Real-time listener for authentication state
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Manually reload user to get latest verification status
                    await reload(user);

                    // Check if verification email is sent
                    if (!user.emailVerified) {
                        if (!emailVerificationSent) {
                            toast.info("Verification email sent. Please check your inbox.", {
                                style: { backgroundColor: "#2196f3", color: "#fff" },
                                duration: 5000
                            });
                            setEmailVerificationSent(true);
                        }
                    } else {
                        // Email is verified
                        if (!isEmailVerified) {
                            toast.success("Email verified! You can now login.", {
                                style: { backgroundColor: "#4caf50", color: "#fff" },
                                duration: 5000
                            });
                            setIsEmailVerified(true);
                        }
                    }
                } catch (error) {
                    console.error("Error checking verification status:", error);
                }
            }
        });

        // Periodic check for email verification
        const verificationCheckInterval = setInterval(async () => {
            const currentUser = auth.currentUser;
            if (currentUser && !currentUser.emailVerified) {
                try {
                    await reload(currentUser);
                    if (currentUser.emailVerified) {
                        toast.success("Email verified! You can now login.", {
                            style: { backgroundColor: "#4caf50", color: "#fff" },
                            duration: 5000
                        });
                        setIsEmailVerified(true);
                        clearInterval(verificationCheckInterval);
                    }
                } catch (error) {
                    console.error("Periodic verification check error:", error);
                }
            }
        }, 5000); // Check every 5 seconds

        // Cleanup subscriptions
        return () => {
            unsubscribe();
            clearInterval(verificationCheckInterval);
        };
    }, [emailVerificationSent, isEmailVerified, navigate]);

    const validatePassword = (password, confirmPassword) => {
        const lengthValid = password.length >= 6;
        const numberValid = /\d/.test(password);
        const specialCharValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const passwordMatchValid = password === confirmPassword && confirmPassword !== '';

        setValidations({
            length: lengthValid,
            number: numberValid,
            specialChar: specialCharValid,
            passwordMatch: passwordMatchValid
        });
    };

    const getPasswordStrength = () => {
        if (validations.length && validations.number && validations.specialChar) {
            return { width: '100%', backgroundColor: '#00ff00', text: 'Strong' };
        } else if (validations.length && validations.number) {
            return { width: '66%', backgroundColor: '#ffa500', text: 'Medium' };
        } else if (validations.length) {
            return { width: '33%', backgroundColor: '#ff0000', text: 'Weak' };
        }
        return { width: '0%', backgroundColor: '#e0e0e0', text: '' };
    };

    const handleSaveEmailToDatabase = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/patients', { email });
            if (response.status === 201) {
                toast.success("Email successfully saved to the database!", {
                    style: { backgroundColor: "#4caf50", color: "#fff" },
                });
            } else {
                toast.error("Failed to save email.", {
                    style: { backgroundColor: "#f44336", color: "#fff" },
                });
            }
        } catch (error) {
            console.error("Error saving email to database:", error);
            toast.error("An error occurred while saving the email.", {
                style: { backgroundColor: "#f44336", color: "#fff" },
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Existing Firebase email/password creation logic
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await sendEmailVerification(user);

            toast.info("Verification email sent. Please check your inbox.", {
                style: { backgroundColor: "#2196f3", color: "#fff" },
            });

            // Save the email to the Patient collection in the database
            await handleSaveEmailToDatabase();

        } catch (error) {
            console.error("Error during signup:", error);
            toast.error(`Signup failed: ${error.message}`, {
                style: { backgroundColor: "#f44336", color: "#fff" },
            });
        }
    };


    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        validatePassword(newPassword, confirmPassword);
    };

    const handleConfirmPasswordChange = (e) => {
        const newConfirmPassword = e.target.value;
        setConfirmPassword(newConfirmPassword);
        validatePassword(password, newConfirmPassword);
    };

    const validatePakistaniEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(pk|com|org|edu|gov|mil)$/;
        return emailRegex.test(email);
    };
    const togglePasswordVisibility = (e) => {
        e.preventDefault();
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = (e) => {
        e.preventDefault();
        setShowConfirmPassword(!showConfirmPassword);
    };

    const allValid = Object.values(validations).every(Boolean);

    return (
        <>
            <Header />
            <Toaster position='top-center' richcolors closeButton />
            <div className="signup-container">
                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="signup-content">
                        <h2>Signup</h2>
                        <div className="email-input-container">
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Email"
                                className={validatePakistaniEmail(email) || email === "" ? "" : "invalid-email"}
                            />
                            {!validatePakistaniEmail(email) && email !== "" && (
                                <p className="error-text">Invalid email format!</p>
                            )}
                        </div>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={handlePasswordChange}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                                required
                                placeholder="Password"
                            />
                            <span
                                className="password-toggle-icon"
                                onClick={togglePasswordVisibility}
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        {isPasswordFocused && password && (
                            <div className="password-strength-container">
                                <div className="password-strength-bar">
                                    <div
                                        className="strength-fill"
                                        style={{
                                            width: getPasswordStrength().width,
                                            backgroundColor: getPasswordStrength().backgroundColor
                                        }}
                                    ></div>
                                </div>
                                <span className="strength-text">{getPasswordStrength().text}</span>
                            </div>
                        )}
                        <div className="password-input-container">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                required
                                placeholder="Confirm Password"
                            />
                            <span
                                className="password-toggle-icon"
                                onClick={toggleConfirmPasswordVisibility}
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        {confirmPassword && !validations.passwordMatch && (
                            <p className="password-match-error">Passwords do not match</p>
                        )}
                        <div className="signup-footer">
                            <button
                                type="submit"
                                disabled={!allValid}
                                className={`continue-button ${!allValid ? 'disabled' : ''}`}
                            >
                                Continue
                            </button>
                            <div className="signup">
                                <p>Already have an account? <a href="/login"><b>Login</b></a></p>
                            </div>
                        </div>
                    </div>
                    <div className="signup-image">
                        <img src="/signup.png" alt="signup" tabIndex="-1" />
                    </div>
                </form>
            </div>
            <Footer />
        </>
    );
}

export default Signup;
