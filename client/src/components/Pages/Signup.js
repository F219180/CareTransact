import React, { useState } from "react";
import './login_signup.css';
import Header from "../header.js";
import Footer from "../Footer.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";
import { Toaster, toast } from "sonner";
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    console.log("login component rendered")
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("user logged in successsfully");
            toast.success("Successfully Logged in!", {
                style: { backgroundColor: "#4caf50", color: "#fff" }, // Green background, white text
            });

        } catch (error) {
            console.log(error.message);
            toast.error(`Error: ${error.message}`, {
                style: { backgroundColor: "#f44336", color: "#fff" }, // Red background, white text
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
                    <h2>Login</h2>
                    <div>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Email"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Password"
                        />
                    </div>
                    <div className="login-footer">
                        <button type="submit">Continue</button>
                        <div className="signup">
                            <p>Don't have an account?</p>
                            <a href="/signup"><b>Signup</b></a>
                        </div>
                    </div>

                </form>
            </div>
            <Footer />
        </>
    )
}
export default Login