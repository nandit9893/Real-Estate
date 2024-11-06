import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import URL from "../assets/URL.js";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import ListingItem from "../Components/ListingItem";

const Home = () => {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  SwiperCore.use([Navigation]);

  useEffect(() => {
    const fetchOfferListings = async () => {
      const newURL = `${URL}/real/state/property/listings/get/serached/lisitings?offer=true&limit=4`;
      try {
        const response = await axios.get(newURL);
        if(response.data.success) {
          setOfferListings(response.data.data);
          fetchRentListings();
        }
      } catch (error) {
        console.log(error);
      }
    };
    const fetchRentListings = async () => {
      const newURL = `${URL}/real/state/property/listings/get/serached/lisitings?type=rent&limit=4`;
      try {
        const response = await axios.get(newURL);
        if(response.data.success) {
          setRentListings(response.data.data);
          fetchSaleListings();
        }
      } catch (error) {
        console.log(error);
      }
    };
    const fetchSaleListings = async () => {
      const newURL = `${URL}/real/state/property/listings/get/serached/lisitings?type=sale&limit=4`;
      try {
        const response = await axios.get(newURL);
        if(response.data.success) {
          setSaleListings(response.data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchOfferListings();
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto">
        <h1 className="text-slate-700 font-semibold text-3xl lg:text-6xl">Find your next <span className="text-slate-500">prefect</span> <br /> place with ease</h1>
        <div className="text-gray-600 text-xs sm:text-sm">
          Sharma Properties will help you find your home fast, easy and
          comfortable. <br />
          Our expert support are always available.
        </div>
        <Link to={"/search"} className="text-xs sm:text-sm text-blue-800 font-bold hover:underline">Let's get started...</Link>
      </div>
      <Swiper navigation>
        {
          offerListings && offerListings.length > 0 && 
          offerListings.map((listing) => (
            <SwiperSlide key={listing._id}>
              <div style={{background: `url(${listing.imageURLs[0]}) center no-repeat`, backgroundSize: "cover"}} className="h-[500px]"></div>
            </SwiperSlide>
          ))
        }
      </Swiper>
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
      {
          offerListings && offerListings.length > 0 && 
          (
            <>
              <div className="my-3">
                <h2 className="text-2xl font-semibold text-slate-600">Recent Offers</h2>
                <Link className="text-sm text-blue-800 hover:underline" to={`/search?offer=true`}>Show more offers</Link>
              </div>
              <div className="flex flex-wrap gap-4">
                {
                  offerListings.map((listing) => (
                    <ListingItem listing={listing} key={listing._id} />
                  ))
                }
              </div>
            </> 
          )
      }
      {
          rentListings && rentListings.length > 0 && 
          (
            <>
              <div className="my-3">
                <h2 className="text-2xl font-semibold text-slate-600">Recent places for rent</h2>
                <Link className="text-sm text-blue-800 hover:underline" to={`/search?type=rent`}>Show more places for rent</Link>
              </div>
              <div className="flex flex-wrap gap-4">
                {
                  rentListings.map((listing) => (
                    <ListingItem listing={listing} key={listing._id} />
                  ))
                }
              </div>
            </> 
          )
      }
      {
          saleListings && saleListings.length > 0 && 
          (
            <>
              <div className="my-3">
                <h2 className="text-2xl font-semibold text-slate-600">Recent places for sale</h2>
                <Link className="text-sm text-blue-800 hover:underline" to={`/search?type=sale`}>Show more places for sale</Link>
              </div>
              <div className="flex flex-wrap gap-4">
                {
                  saleListings.map((listing) => (
                    <ListingItem listing={listing} key={listing._id} />
                  ))
                }
              </div>
            </> 
          )
      }
      </div>
    </div>
  );
};

export default Home;
