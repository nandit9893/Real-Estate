import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../Components/OAuth";
import URL from "../assets/URL.js";
const SignUp = () => {
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const newURL = `${URL}/real/state/property/users/register`;
    try {
      const response = await axios.post(newURL, data);
      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setData({
          username: "",
          email: "",
          password: "",
        });
        setError(null);
        setTimeout(() => {
          navigate("/sign-in");
        }, 2000);
      } else {
        setError("An error occurred. Please try again.");
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError("No response from the server");
      }
    }
    setLoading(false);
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" placeholder="username" className="border p-3 rounded-lg" id="username" name="username" value={data.username} required onChange={handleChange} />
        <input type="email" placeholder="email" className="border p-3 rounded-lg" id="email" name="email" value={data.email} required onChange={handleChange} />
        <input type="password" placeholder="password" className="border p-3 rounded-lg" id="password" name="password" value={data.password} required onChange={handleChange} />
        <button disabled={loading} type="submit" className="bg-slate-700 text-white p-3 rounded-lg hover:opacity-95 disabled:opacity-80">{loading ? "Loading..." : "SIGN UP"}</button>
        <OAuth />
      </form>
      <div className="flex gap-2 mt-5">
        <p>Already have an account?</p>
        <Link to="/sign-in"><span className="text-blue-700">Sign In</span></Link>
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

export default SignUp;
