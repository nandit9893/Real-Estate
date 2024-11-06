import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import URL from "../assets/URL.js";
import { useDispatch, useSelector } from "react-redux";
import { signInStart, signInSuccess, signInFailure } from "../Redux/User/UserSlice.js";
import OAuth from "../Components/OAuth.jsx";

const SignIn = () => {
  const [successMessage, setSuccessMessage] = useState(null);
  const { loading, error }= useSelector((state) => state.user);
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(signInStart());
    const newURL = `${URL}/real/state/property/users/login`;
    try {
      const response = await axios.post(newURL, data);
      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        localStorage.setItem("accessToken", accessToken);
        dispatch(signInSuccess(user));
        setSuccessMessage(response.data.message);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        const errorMsg = response.data.message || "An error occurred. Please try again.";
        dispatch(signInFailure(errorMsg));
        return;
      }
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : "No response from the server";
      dispatch(signInFailure(errorMessage));
    } 
  };


  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="email" placeholder="email" className="border p-3 rounded-lg" id="email" name="email" value={data.email} required onChange={handleChange} />
        <input type="password" placeholder="password" className="border p-3 rounded-lg" id="password" name="password" value={data.password} required onChange={handleChange} />
        <button disabled={loading} type="submit" className="bg-slate-700 text-white p-3 rounded-lg hover:opacity-95 disabled:opacity-80">{loading ? "Loading..." : "SIGN IN"}</button>
        <OAuth />
      </form>
      <div className="flex gap-2 mt-5">
        <p>New User?</p>
        <Link to="/sign-up"><span className="text-blue-700">Sign Up</span></Link>
      </div>
      <div className="flex justify-center">
        {
          error ? 
          ( <p className="text-red-500 mt-5 text-2xl font-semibold text-center">{error}</p> ) 
          : 
          ( <p className="text-green-500 mt-5 text-2xl font-semibold text-center">{successMessage}</p> )
        }
      </div>
    </div>
  );
};

export default SignIn;
