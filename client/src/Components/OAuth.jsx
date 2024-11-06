import React from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import axios from "axios";
import URL from "../assets/URL.js";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../Redux/User/UserSlice.js";
import { useNavigate } from "react-router-dom";

const OAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleGoogleClick = async () => {
    const newURL = `${URL}/real/state/property/users/google`;
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      const { displayName, email, photoURL } = result.user;
      const response = await axios.post(newURL, {
        name: displayName,
        email,
        photo: photoURL,
      });
      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        localStorage.setItem("accessToken", accessToken);
        dispatch(signInSuccess(user));
        navigate("/");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  return (
    <button onClick={handleGoogleClick} type="button" className="bg-red-700 text-white p-3 rounded-lg hover:opacity-95">CONTINUE WITH GOOGLE</button>
  );
};

export default OAuth;
