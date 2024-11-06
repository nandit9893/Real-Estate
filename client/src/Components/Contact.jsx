import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import URL from "../assets/URL.js";
const Contact = ({ listing }) => {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState("");

  const inputChangeHandler = (event) => {
    setMessage(event.target.value);
  };

  useEffect(() => {
    const fetchPropertyOwner = async () => {
      const newURL = `${URL}/real/state/property/users/get/user/contact/${listing.referenceId}`;
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(newURL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          console.log(response.data.data);
          setLandlord(response.data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchPropertyOwner();
  }, [listing.referenceId]);

  return (
    <> 
      {
        landlord &&
        (
          <div className="flex flex-col gap-2">
            <p>Contact <span className="font-semibold">{landlord.username}</span> for <span className="font-semibold">{listing.name}</span></p>
            <textarea className="w-full border p-3 rounded-lg" placeholder="Enter your message here..." value={message} name="message" id="message" rows="2" onChange={inputChangeHandler}></textarea>
            <Link to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`} className="bg-slate-700 text-white text-center p-3 rounded-lg hover:opacity-95">SEND MESSAGE</Link>
          </div>
        )
      }
    </>
  )
};

export default Contact;
