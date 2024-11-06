import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { deleteUserFailure, deleteUserStart, deleteUserSuccess, logoutUserFailure, logoutUserStart, logoutUserSuccess, updateUserFailure, updateUserStart, updateUserSuccess } from "../Redux/User/UserSlice";
import URL from "../assets/URL.js";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

const Profile = () => {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [image, setImage] = useState(null);
  const [imagePercentage, setImagePercentage] = useState(0);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();
  const [listingError, setListingError] = useState(null);
  const [showListings, setShowListings] = useState([]);
  const [initialAvatar, setInitialAvatar] = useState("");
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    avatar: "",
  });

  useEffect(() => {
    const initializeProfileData = () => {
      if (currentUser) {
        setData({
          username: currentUser.username || "",
          email: currentUser.email || "",
          password: "",
        });
        setInitialAvatar(currentUser.avatar || "");
      }
    };
    initializeProfileData();
  }, [currentUser]);

  const inputHandler = (event) => {
    const {name, value, files} = event.target;
    if(name === "avatar") {
      if(files[0].size > 2*1024*1024) {
        setImageUploadError(true);
        return;  
      }
      setImage(files[0]);
      setImageUploadError(false);
    } else {
      setData((prev) => ({...prev, [name] : value}));
    }
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    if (data.username) {
      formData.append("username", data.username);
    }
    if(data.email) {
      formData.append("email", data.email);
    }
    if(data.password) {
      formData.append("password", data.password);
    }
    if(image) {
      formData.append("avatar", image);
    }
    const newURL = `${URL}/real/state/property/users/profile-update`;
    try {
      dispatch(updateUserStart());
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(newURL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percentage = Math.round((loaded * 100) / total);
          setImagePercentage(percentage);
        },
      });
      if (response.data.success) {
        dispatch(updateUserSuccess(response.data.data));
        setUpdateSuccess(true);
        setImageUploadError(false);
      } else {
        dispatch(updateUserFailure(response.data.data.message));
        setUpdateSuccess(false); 
        setImageUploadError(true); 
      }
    } catch (error) {
      if (error.response && error.response.data) {
        dispatch(updateUserFailure(error.response.data.message));
        setUpdateSuccess(false); 
        setImageUploadError(true);
      } else {
        dispatch(updateUserFailure("An error occurred while updating"));
        setUpdateSuccess(false); 
        setImageUploadError(true);
      }
    }
  };

  const logout = async () => {
    const newURL = `${URL}/real/state/property/users/logout`;
    try {
      dispatch(logoutUserStart());
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(newURL, {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        dispatch(logoutUserSuccess(response.data.data));
        localStorage.removeItem("accessToken");
      } else {
        dispatch(logoutUserFailure(response.data.message));
        return;
      }
    } catch (error) {
      if (error.response && error.response.data) {
        dispatch(deleteUserFailure(error.response.data.message));
      } else {
        dispatch(deleteUserFailure(error.response.data.message));
      }
    }
  };

  const deleteAccount = async () => {
    const newURL = `${URL}/real/state/property/users/delete`;
    try {
      dispatch(deleteUserStart());
      const token = localStorage.getItem("accessToken");
      const response = await axios.delete(newURL,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if(response.data.success) {
        dispatch(deleteUserSuccess(response.data.data));
        localStorage.removeItem("accessToken");
      } else {
        dispatch(deleteUserFailure(response.data.data.message));
        return;
;      }
    } catch (error) {
      if(error.response && error.response.data) {
        dispatch(deleteUserFailure(error.response.data.message));
      } else {
        dispatch(deleteUserFailure("An error occured while deleting"));
      }
    }
  };

  const handleShowListings = async () => {
    const newURL = `${URL}/real/state/property/users/get/lists/${currentUser._id}`;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(newURL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200 && response.data.success) {
        setShowListings(response.data.data);
      } else {
        setListingError(response.data.message || "No listings found for this user.");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setListingError(error.response.data.message || "No listings found for this user.");
        } else {
          setListingError("An error occurred while fetching listings.");
        }
      } else {
        setListingError("An unexpected error occurred.");
      }
    }
  };

  const deleteList = async (deleteID) => {
    const newURL = `${URL}/real/state/property/listings/delete/list/${deleteID}`;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.delete(newURL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setShowListings((prev) => prev.filter((listing) => listing._id !== deleteID));
        setListingError(null); 
      } else {
        setListingError(response.data.message || "Failed to delete the list.");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setListingError("The listing was not found or may have already been deleted.");
        } else {
          setListingError("An error occurred while attempting to delete the list.");
        }
      } else {
        setListingError("Network error. Please try again later.");
      }
    }
  };
  

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4">
        <label htmlFor="file-input" className="flex flex-col items-center">
          <img src={image ? window.URL.createObjectURL(image) : initialAvatar} className="rounded-full h-24 w-24 object-cover self-center cursor-pointer mt-2" alt="" />
        </label>
        <p className="text-sm self-center">
        {
          imageUploadError ? 
          (
            <span className='text-red-700'>
              Error Image Upload (image must be less than 2MB)
            </span>
          ) 
          : 
          (
            image && imagePercentage > 0 && imagePercentage < 100 ? 
            (
              <span className='text-slate-700'>{`Uploading ${imagePercentage}%`}</span>
            )
            :
            (
              image && imagePercentage === 100 ? 
              (
                <span className='text-green-700'>Image successfully uploaded!</span>
              ) 
              : 
              ("")
            )
          )
        }
        </p>
        <input type="file" hidden name="avatar" id="file-input" accept="image/*" onChange={inputHandler} />
        <input onChange={inputHandler} value={data.username} type="text" placeholder="username" id="username" name="username" className="border p-3 rounded-lg" />
        <input onChange={inputHandler} value={data.email} type="email" placeholder="email" id="email" name="email" className="border p-3 rounded-lg" />
        <input onChange={inputHandler} value={data.password} type="password" placeholder="password" name="password" id="password" className="border p-3 rounded-lg" />
        <button disabled={loading} type="submit" className="bg-slate-700 text-white rounded-lg p-3 hover:opacity-95 disabled:opacity-80">{loading ? "Loading..." : "Update"}</button>
        <Link to={"/create-listing"} className="bg-green-700 text-white p-3 rounded-lg text-center hover:opacity-95">CREATE LISTING</Link>
      </form>
      <div className="flex justify-between mt-5">
        <span onClick={deleteAccount} className="text-red-700 cursor-pointer">Delete Account</span>
        <span onClick={logout} className="text-red-700 cursor-pointer">Sign Out</span>
      </div>
      <p className='text-red-700 mt-5'>{error ? error : ""}</p>
      <p className='text-green-700 mt-5'>{updateSuccess ? "User is updated successfully!" : ""}</p>
      <button onClick={handleShowListings} className="text-green-700 w-full">SHOW LISITINGS</button>
      {
        listingError ? 
        ( <p className="text-red-700 mt-5">{listingError}</p> )
        : 
        null
      }
      {
        showListings && showListings.length > 0 && (
          <div className="flex flex-col gap-4">
            <h1 className="text-center mt-7 text-2xl font-semibold">YOUR LISTINGS</h1>
            {
              showListings.map((listing) => (
                <div className="border rounded-lg p-3 flex justify-between items-center gap-4" key={listing._id}>
                  <Link to={`/listing/${listing._id}`}>
                    <img className="h-16 w-16 object-contain" src={listing.imageURLs[0]} alt="" />
                  </Link>
                  <Link to={`/listing/${listing._id}`} className="flex-1 text-slate-700 font-semibold hover:underline">
                    <p>{listing.name.slice(0, 28)}...</p>
                  </Link>
                  <div className="flex flex-col items-center">
                    <button onClick={()=>deleteList(listing._id)} className="text-red-700">DELETE</button>
                    <Link to={`/update-listing/${listing._id}`}>
                      <button className="text-green-700">EDIT</button>
                    </Link>
                  </div>
                </div>
              ))
            }
          </div>
        )
      }
    </div>
  );
};

export default Profile;
