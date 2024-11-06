import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
 {
  name: {
   type: String,
   required: true,
  },
  description: {
   type: String,
   required: true,
  },
  address: {
   type: String,
   required: true,
  },
  regularPrice: {
   type: Number,
   required: true,
  },
  discountPrice: {
   type: Number,
   required: true,
   validate: {
    validator: function (value) {
     return value < this.regularPrice;
    },
    message: "Discount price should be less than the regular price.",
   },
  },
  bathRooms: {
   type: Number,
   required: true,
  },
  bedRooms: {
   type: Number,
   required: true,
  },
  furnished: {
   type: Boolean,
   required: true,
  },
  parking: {
   type: Boolean,
   required: true,
  },
  type: {
   type: String,
   required: true,
   enum: ["Rent", "Sale"],
  },
  offer: {
   type: Boolean,
   required: true,
  },
  imageURLs: {
   type: [String],
   required: true,
  },
  referenceId: {
   type: String,
   required: true,
  },
 },
 {
  timestamps: true,
 }
);

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
