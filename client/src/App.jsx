import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./Pages/Home";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import About from "./Pages/About";
import Profile from "./Pages/Profile";
import Navbar from "./Components/Navbar";
import PrivateRoute from "./Components/PrivateRoute";
import CreateListing from "./Pages/CreateListing";
import Listings from "./Pages/Listings";
import UpdateListing from "./Pages/UpdateListing";
import Search from "./Pages/Search";
const App = () => {
  return (
    <BrowserRouter>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<Search />} />
          <Route path='/listing/:listID' element={<Listings />} />
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/update-listing/:listID" element={<UpdateListing />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
