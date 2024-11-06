import React from "react";
import { MdLocationOn } from "react-icons/md";
import { Link } from "react-router-dom";

const ListingItem = ({ listing }) => {
  return (
    <div className="bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[340px]">
      <Link to={`/listing/${listing._id}`}>
        <img className="h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition-scale duration-300" src={listing.imageURLs[0]} alt="listing cover" />
        <div className="p-3 flex flex-col gap-2 w-full">
            <p className="text-lg font-semibold text-slate-700 truncate">{listing.name}</p>
            <div className="flex items-center gap-1">
                <MdLocationOn className="h-4 w-4 text-green-700"/>
                <p className="text-sm text-gray-600 truncate w-full">{listing.address}</p>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>
            <p className="text-slate-500 mt-2 font-semibold">₹{" "}
                {
                    listing.offer ? 
                    ( listing.regularPrice - listing.discountPrice )
                    :
                    ( listing.regularPrice )
                }
                {listing.type === "Rent" && "/month"}
            </p>
            <div className="text-slate-700 flex gap-4">
                <div className="font-bold text-xs">
                    {
                        listing.bedRooms > 1 ? 
                        ( `${listing.bedRooms} Beds` )
                        :
                        ( `${listing.bedRooms} Bed` )
                    }
                </div>
                <div className="font-bold text-xs">
                    {
                        listing.bathRooms > 1 ? 
                        ( `${listing.bathRooms} Baths` )
                        :
                        ( `${listing.bathRooms} Bath` )
                    }
                </div>
            </div>
        </div>
      </Link>
    </div>
  );
};

export default ListingItem;
