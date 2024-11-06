import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListingItem from "../Components/ListingItem";
import URL from "../assets/URL.js";

const Search = () => {
    const navigate = useNavigate();
    const [sideBarData, setSideBarData] = useState({
        searchTerm: "",
        type: "all",
        parking: false,
        furnished: false,
        offer: false,
        sort: "created_at",
        order: "desc",
    });

    const [loading, setLoading] = useState(false);
    const [listings, setListings] = useState([]);
    const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchTermFromUrl = urlParams.get("searchTerm");
        const typeFromUrl = urlParams.get("type");
        const parkingFromUrl = urlParams.get("parking");
        const furnishedFromUrl = urlParams.get("furnished");
        const offerFromUrl = urlParams.get("offer");
        const sortFromUrl = urlParams.get("sort");
        const orderFromUrl = urlParams.get("order");
        if(searchTermFromUrl || typeFromUrl || parkingFromUrl || furnishedFromUrl || offerFromUrl || sortFromUrl || offerFromUrl || orderFromUrl) {
            setSideBarData({
                searchTerm: searchTermFromUrl || "",
                type: typeFromUrl || "all",
                parking: parkingFromUrl === "true" ? true : false,
                furnished: furnishedFromUrl === "true" ? true : false,
                offer: offerFromUrl === "true" ? true : false,
                sort: sortFromUrl || "created_at",
                order: orderFromUrl || "desc",
              });
          }
          const fetchSearchListings = async () => {
            setLoading(true);
            const searchQuery = urlParams.toString();
            const newURL = `${URL}/real/state/property/listings/get/serached/lisitings?${searchQuery}`;
            try {
                const response = await axios.get(newURL);
                if(response.data.success) {
                    if(response.data.data.length > 6) {
                        setShowMore(true);
                    } else {
                        setShowMore(false);
                    }
                    setListings(response.data.data.slice(0, 6));
                    setLoading(false);
                } 
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
          };
          fetchSearchListings();
    }, [location.search]);

    const inputChangeHandler = (event) => {
        if(event.target.name === "all" || event.target.name === "rent" || event.target.name === "sale") {
            setSideBarData({...sideBarData, type: event.target.name});
        }
        if(event.target.name === "searchTerm") {
            setSideBarData({...sideBarData, searchTerm: event.target.value});
        }
        if(event.target.name === "parking" || event.target.name === "furnished" || event.target.name === "offer") {
            setSideBarData({...sideBarData, [event.target.name]: event.target.checked });
        }
        if(event.target.name === "sort_order") {
            const sort = event.target.value.split("_")[0] || "created_at";
            const order = event.target.value.split("_")[1] || "desc";
            setSideBarData({ ...sideBarData, sort, order });
        }
    };

    const sumbitHandler = async (event) => {
        event.preventDefault();
        const urlParams = new URLSearchParams();
        urlParams.set("searchTerm", sideBarData.searchTerm);
        urlParams.set("type", sideBarData.type);
        urlParams.set("parking", sideBarData.parking);
        urlParams.set("furnished", sideBarData.furnished);
        urlParams.set("offer", sideBarData.offer);
        urlParams.set("sort", sideBarData.sort);
        urlParams.set("order", sideBarData.order);
        const searchQuery = urlParams.toString();
        navigate(`/search?${searchQuery}`);
    };

    const showMoreList = async (event) => {
        event.preventDefault();
        const numberOfListings = listings.length;
        const startIndex = numberOfListings;
        const urlParams = new URLSearchParams(location.search);
        urlParams.set("startIndex", startIndex);
        const searchQuery = urlParams.toString();
        const newURL = `${URL}/real/state/property/listings/get/serached/lisitings?${searchQuery}`;
        try {
            const response = await axios.get(newURL);
            if(response.data.success) {
                if(response.data.data.length < 7) {
                    setShowMore(false);
                }
            } 
            setListings([...listings, ...response.data.data.slice(0, 6)]);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }  
    };

  return (
    <div className="flex flex-col md:flex-row">
        <div className="p-7 border-b-2 md:border-r-2 md:min-h-screen">
            <form onSubmit={sumbitHandler} className="flex flex-col gap-8">
                <div className="flex items-center gap-2 ">
                    <label className="whitespace-nowrap font-semibold">Search Term</label>
                    <input type="text" id="searchTerm" name="searchTerm" placeholder="Search..." className="border rounded-lg p-3 w-full" onChange={inputChangeHandler} value={sideBarData.searchTerm} />
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    <label className="font-semibold">Type : </label>
                    <div className="flex gap-2">
                        <input type="checkbox" id="all" name="all" className="w-5" onChange={inputChangeHandler} value={sideBarData.type === "all"} checked={sideBarData.type === "all"}/><span>Rent & Sale</span>
                    </div>
                    <div className="flex gap-2">
                        <input type="checkbox" id="rent" name="rent" className="w-5" onChange={inputChangeHandler} value={sideBarData.type === "rent"} checked={sideBarData.type === "rent"}/><span>Rent</span>
                    </div>
                    <div className="flex gap-2">
                        <input type="checkbox" id="sale" name="sale" className="w-5" onChange={inputChangeHandler} value={sideBarData.type === "sale"} checked={sideBarData.type === "sale"}/><span>Sale</span>
                    </div>
                    <div className="flex gap-2">
                        <input type="checkbox" id="offer" name="offer" className="w-5" onChange={inputChangeHandler} value={sideBarData.offer} checked={sideBarData.offer}/><span>Offer</span>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    <label className="whitespace-nowrap font-semibold">Amenities : </label>
                    <div className="flex gap-2">
                        <input type="checkbox" id="parking" name="parking" className="w-5" onChange={inputChangeHandler} value={sideBarData.parking} checked={sideBarData.parking}/><span>Parking</span>
                    </div>
                    <div className="flex gap-2">
                        <input type="checkbox" id="furnished" name="furnished" className="w-5" onChange={inputChangeHandler} value={sideBarData.furnished} checked={sideBarData.furnished}/><span>Furnished</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="font-semibold">Sort : </label>
                    <select onChange={inputChangeHandler} defaultValue={"created_at"} className="border rounded-lg p-3" name="sort_order" id="sort_order">
                        <option value="regularPrice_desc">Price high to low</option>
                        <option value="regularPrice_asc">Price low to high</option>
                        <option value="createdAt_desc">Latest</option>
                        <option value="createdAt_asc">Oldest</option>
                    </select>
                </div>
                <button className="bg-slate-700 text-white p-3 rounded-lg hover:opacity-95">SEARCH</button>
            </form>
        </div>
        <div className="flex-1">
            <h1 className="text-3xl font-semibold border-b mt-5 p-3 text-slate-700">Listing Result : </h1>
            <div className="p-4 flex flex-wrap gap-4">
            {
                !loading && listings.length === 0 && 
                (
                    <p className="text-xl text-slate-700">No listing found!</p>
                )
            }
            {
                loading && 
                (
                    <p className="text-xl text-slate-700 text-center w-full">Loading...</p>
                )
            }
            {
                !loading && listings && listings.map((listing) => (
                    <ListingItem key={listing._id} listing={listing} />
                ))
            }
            {
                !loading && showMore && 
                (
                    <button onClick={showMoreList} className="p-2 text-green-700 border-2 border-gray-400 rounded-lg hover:opacity-95 text-center">Show More</button>
                )
            }
            </div>
        </div>
    </div>
  );
};

export default Search;
