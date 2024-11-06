import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");

  const inputChangeHandler = (event) => {
    setSearchTerm(event.target.value);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
   const urlParams = new URLSearchParams(window.location.search);
   const searchTermFromURL = urlParams.get("searchTerm");
   if(searchTermFromURL) {
    setSearchTerm(searchTermFromURL);
   }
  }, [location.search]);

  return (
    <header className="bg-slate-200 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-slate-500">Sharma</span>
            <span className="text-slate-700">Properties</span>
          </h1>
        </Link>
        <form onSubmit={submitHandler} className="bg-slate-100 p-3 rounded-lg flex items-center">
          <input onChange={inputChangeHandler} name="search" value={searchTerm} type="text" placeholder="Search..." className="w-24 sm:w-64 bg-transparent focus:outline-none" />
          <button type="submit"><FaSearch className="text-slate-600 cursor-pointer" /></button>
        </form>
        <ul className="flex gap-4">
          <Link to="/"><li className="hidden sm:inline text-slate-700 hover:underline cursor-pointer">Home</li></Link>
          <Link to="/about"><li className="hidden sm:inline text-slate-700 hover:underline cursor-pointer">About</li></Link>
          <Link to="/profile">
          {
            currentUser ? 
            ( <img src={currentUser.avatar} alt="User Avatar" className="w-7 h-7 rounded-full object-cover" /> ) 
            : 
            ( <li className="text-slate-700 hover:underline cursor-pointer">Sign In</li> )
          }
          </Link>
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
