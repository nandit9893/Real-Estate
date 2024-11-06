import Listing from "../models/listing.model.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const createListing = async (req, res) => {
 const { name, description, address, regularPrice, bathRooms, bedRooms, type } = req.body;
 let { furnished, offer, parking, discountPrice } = req.body;
 const referenceId = req.user._id;
 const parsedRegularPrice = parseFloat(regularPrice);
 const parsedDiscountPrice = parseFloat(discountPrice);

 if (!name?.trim())
  return res.status(400).json({
   success: false,
   message: "Name of property is required",
  });
 if (!description?.trim())
  return res.status(400).json({
   success: false,
   message: "Description of property is required",
  });
 if (!address?.trim())
  return res.status(400).json({
   success: false,
   message: "Address of property is required",
  });
 if (!parsedRegularPrice || isNaN(parsedRegularPrice))
  return res.status(400).json({
   success: false,
   message: "Valid regular price is required",
  });
 if (!bathRooms || isNaN(bathRooms))
  return res.status(400).json({
   success: false,
   message: "Valid number of bathrooms is required",
  });
 if (!bedRooms || isNaN(bedRooms))
  return res.status(400).json({
   success: false,
   message: "Valid number of bedrooms is required",
  });
 if (typeof parking !== "boolean") {
  if (parking === "true") parking = true;
  else if (parking === "false") parking = false;
  else
   return res.status(400).json({
    success: false,
    message: "Parking status is required",
   });
 }

 if (typeof furnished !== "boolean") {
  if (furnished === "true") furnished = true;
  else if (furnished === "false") furnished = false;
  else
   return res.status(400).json({
    success: false,
    message: "Furnished status is required",
   });
 }

 if (typeof offer !== "boolean") {
  if (offer === "true") offer = true;
  else if (offer === "false") offer = false;
  else
   return res.status(400).json({
    success: false,
    message: "Offer status is required",
   });
 }

 if (!["Rent", "Sale"].includes(type))
  return res.status(400).json({
   success: false,
   message: "Type of property is required (Rent/Sale)",
  });
 try {
  const userExisted = await User.findById(req.user._id);
  if (!userExisted) {
   return res.status(401).json({
    success: false,
    message: "Not authorized to add listings",
   });
  }
  if (!req.files || req.files.length === 0) {
   return res.status(400).json({
    success: false,
    message: "Images are required",
   });
  }
  if (req.files.length > 5) {
   return res.status(400).json({
    success: false,
    message: "You can only upload a maximum of 5 images",
   });
  }
  if (offer) {
   if (!parsedDiscountPrice || isNaN(parsedDiscountPrice)) {
    return res.status(400).json({
     success: false,
     message: "Valid discount price is required when offer is true",
    });
   }
   if (parsedDiscountPrice >= parsedRegularPrice) {
    return res.status(400).json({
     success: false,
     message: "Discount price should be less than the regular price.",
    });
   }
  } else {
   discountPrice = 0;
  }

  let imageURLs = [];
  for (const file of req.files) {
    const result = await uploadOnCloudinary(file.path);
    if (result && result.secure_url) {
      imageURLs.push(result.secure_url);
    } else {
      return null;
    }
  }

  const listing = new Listing({
   name,
   description,
   address,
   regularPrice: parsedRegularPrice,
   discountPrice: parsedDiscountPrice,
   bathRooms,
   bedRooms,
   furnished,
   parking,
   type,
   offer,
   imageURLs,
   referenceId,
  });

  await listing.save();

  return res.status(201).json({
   success: true,
   message: "Listing created successfully",
   data: listing,
  });
 } catch (error) {
  return res.status(500).json({
   success: false,
   message: "An error occurred while creating the listing",
   error: error.message,
  });
 }
};

const deleteList = async (req, res) => {
 const deleteListID = req.params.deleteID;
 try {
  const list = await Listing.findById({ _id: deleteListID });
  if (!list) {
   return res.status(404).json({
    success: false,
    message: "List is not availble",
   });
  }
  if (list.imageURLs && list.imageURLs.length > 0) {
   for (const url of list.imageURLs) {
    await deleteFromCloudinary(url);
   }
  }
  await Listing.findByIdAndDelete(deleteListID);
  return res.status(200).json({
   success: true,
   message: "List deleted successfully",
  });
 } catch (error) {
  return res.status(500).json({
   success: false,
   message: "An error occurred while deleting the list",
   error: error.message,
  });
 }
};

const updateListing = async (req, res) => {
 const listID = req.params.listID;
 const { name, description, address, regularPrice, bathRooms, bedRooms, type } = req.body;
 let { furnished, offer, parking, discountPrice } = req.body;

 if (typeof parking !== "boolean") parking = parking === "true";
 if (typeof furnished !== "boolean") furnished = furnished === "true";
 if (typeof offer !== "boolean") offer = offer === "true";

 if (type && !["Rent", "Sale"].includes(type)) {
  return res.status(400).json({
   success: false,
   message: "Type of property is required (Rent/Sale)",
  });
 }

 try {
  const userExisted = await User.findById(req.user._id);
  if (!userExisted) {
   return res.status(401).json({
    success: false,
    message: "Not authorized to update listings",
   });
  }
  const listing = await Listing.findById(listID);
  if (!listing) {
   return res.status(404).json({
    success: false,
    message: "Listing not found",
   });
  }
  if (offer && (isNaN(discountPrice) || discountPrice >= regularPrice)) {
   return res.status(400).json({
    success: false,
    message:
     "Valid discount price is required when offer is true and should be less than regular price",
   });
  }
  let imageURLs = listing.imageURLs;
  if (req.files && req.files.length > 0) {
   if (listing.imageURLs && listing.imageURLs.length > 0) {
    for (const url of listing.imageURLs) {
     await deleteFromCloudinary(url);
    }
   }
   if (req.files.length > 5) {
    return res.status(400).json({
     success: false,
     message: "You can only upload a maximum of 5 images",
    });
   }
   let imageURLs = [];
   for (const file of req.files) {
     const result = await uploadOnCloudinary(file.path);
     if (result && result.secure_url) {
       imageURLs.push(result.secure_url);
     } else {
       return null;
     }
   }
  }
  if (name) listing.name = name;
  if (description) listing.description = description;
  if (address) listing.address = address;
  if (regularPrice) listing.regularPrice = regularPrice;
  if (bathRooms) listing.bathRooms = bathRooms;
  if (bedRooms) listing.bedRooms = bedRooms;
  if (type) listing.type = type;
  if (typeof furnished !== "undefined") listing.furnished = furnished;
  if (typeof parking !== "undefined") listing.parking = parking;
  if (typeof offer !== "undefined") listing.offer = offer;
  listing.discountPrice = offer ? discountPrice : 0;
  listing.imageURLs = imageURLs;

  await listing.save();

  return res.status(200).json({
   success: true,
   message: "Listing updated successfully",
   data: listing,
  });
 } catch (error) {
  return res.status(500).json({
   success: false,
   message: "An error occurred while updating the listing",
   error: error.message,
  });
 }
};

const getSpecificList = async (req, res) => {
 const { listID } = req.params;
 try {
  const list = await Listing.findById(listID);
  if (!list) {
   return res.status(404).json({
    success: false,
    message: "List ID is not valid",
   });
  }
  return res.status(200).json({
   success: true,
   message: "List fetched successfully",
   data: list,
  });
 } catch (error) {
  return res.status(500).json({
   success: false,
   message: "An error occurred while getting the specific list",
   error: error.message,
  });
 }
};

const getSearchListings = async (req, res) => {
 try {
  const limit = parseInt(req.query.limit) || 9;
  const startIndex = parseInt(req.query.startIndex) || 0;

  let offer = req.query.offer;
  if (offer === undefined || offer === "false") {
   offer = { $in: [false, true] };
  }

  let furnished = req.query.furnished;
  if (furnished === undefined || furnished === "false") {
   furnished = { $in: [false, true] };
  }

  let parking = req.query.parking;
  if (parking === undefined || parking === "false") {
   parking = { $in: [false, true] };
  }
  let type = req.query.type;
  if (type === undefined || type === "all") {
   type = { $in: ["Sale", "Rent"] };
  } else {
   type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  }

  const searchTerm = req.query.searchTerm || "";

  const sort = req.query.sort || "createdAt";
  const order = req.query.order || "desc";

  const listings = await Listing.find({
   name: { $regex: searchTerm, $options: "i" },
   offer,
   furnished,
   parking,
   type,
  })
   .sort({
    [sort]: order,
   })
   .limit(limit)
   .skip(startIndex);

  return res.status(200).json({
   success: true,
   message: `${searchTerm} fetched successfully`,
   data: listings,
  });
 } catch (error) {
  return res.status(500).json({
   success: false,
   message: "Error while fetching listings",
   error: error.message,
  });
 }
};

export {
 createListing,
 deleteList,
 updateListing,
 getSpecificList,
 getSearchListings,
};
