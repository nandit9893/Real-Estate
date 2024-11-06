import axios from "axios";
import React, { useState } from "react";
import URL from "../assets/URL.js";
import { useNavigate } from "react-router-dom";

const CreateListing = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        name: "",
        description: "",
        address: "",
        regularPrice: "",
        discountPrice: 0,
        bathRooms: "",
        bedRooms: "",
        furnished: false,
        parking: false,
        type: "",
        offer: false,
        sale: false,
        rent: false,
        imageURLs: [],
    });
    const [imageUploadError, setImageUploadError] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imageData, setImageData] = useState([]);
    const [result, setResult] = useState("");

    const inputChangeHandler = (event) => {
        const { name, value } = event.target;
        setData((prev) => ({...prev, [name]: value}));
    };

    const inputCheckHandler = (event) => {
        const { name, checked } = event.target;
        if (name === "sale") {
            setData((prev) => ({
                ...prev,
                sale: checked,
                rent: false, 
                type: checked ? "Sale" : prev.rent ? "Rent" : "", 
            }));
        } else if (name === "rent") {
            setData((prev) => ({
                ...prev,
                rent: checked,
                sale: false,
                type: checked ? "Rent" : prev.sell ? "Sale" : "", 
            }));
        } else if (name === "offer") {
            setData((prev) => ({
                ...prev,
                offer: checked,
                discountPrice: checked ? prev.discountPrice : 0,
            }));
        } else {
            setData((prev) => ({...prev, [name]: checked}));
        }
    };

    const inputImageHandler = (event) => {
        const files = Array.from(event.target.files);
        setSelectedImages(files);
    };

    const handleImageSubmit = (event) => {
        event.preventDefault();
        if (selectedImages.length < 2) {
            setImageUploadError("Please select at least two images.");
            setSelectedImages([]); 
            return; 
        }
        if (selectedImages.length > 5) {
            setImageUploadError("You can only add up to 5 images.");
            setSelectedImages([]); 
            return;
        } else {
            setImageUploadError(""); 
        }
        setUploading(true);
        const imagePreviews = selectedImages.map((file) => window.URL.createObjectURL(file));
        setImageData(imagePreviews);
        setData((prev) => ({...prev, imageURLs: selectedImages}));
        setUploading(false);
    };

    const removeImageHandler = (index) => {
        setImageData((prev) => prev.filter((_, i) => i !== index));
        setSelectedImages((prev) => {
            const updatedImages = prev.filter((_, i) => i !== index);
            setData((prevData) => ({ ...prevData, imageURLs: updatedImages }));
            return updatedImages;
        });
    };

    const submitHandler = async (event) => {
        event.preventDefault();
        const regularPriceNum = Number(data.regularPrice);
        const discountPriceNum = Number(data.discountPrice);
        if (discountPriceNum >= regularPriceNum) {
            setImageUploadError("Discounted Price should be less than regular price");
            return;
        }
        if (selectedImages.length === 0) {
            setImageUploadError("Please upload images");
            return;
        }
        const formData = new FormData();
        for (const [key, value] of Object.entries(data)) {
            if (key === "imageURLs") {
                value.forEach((image) => {
                    formData.append("imageURLs", image);
                });
            } else if (key !== "sale" && key !== "rent") {
                formData.append(key, value);
            }
        }
        const newURL = `${URL}/real/state/property/listings/create/list`;
        try {
            setLoading(true);
            const token = localStorage.getItem("accessToken");
            const response = await axios.post(newURL, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            setLoading(false);
            if (response.data.success) {
                setResult(response.data.message);
                setData({
                    name: "",
                    description: "",
                    address: "",
                    regularPrice: "",
                    discountPrice: 0,
                    bathRooms: "",
                    bedRooms: "",
                    furnished: false,
                    parking: false,
                    type: "",
                    offer: false,
                    sale: false,
                    rent: false,
                    imageURLs: [],
                });
                navigate(`/listing/${response.data.data._id}`);
            } else if (response.data.success === false) {
                setResult(response.data.message);
            }
        } catch (error) {
            setResult(error.response.data.message);
        }
        setLoading(false);
    };
    

    return (
        <main className="p-3 max-w-4xl mx-auto">
            <h1 className="text-3xl font-semibold text-center my-7">Create a Listing</h1>
            <form onSubmit={submitHandler} className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-4 flex-1">
                    <input type="text" placeholder="Name" className="border p-3 rounded-lg" id="name" name="name" maxLength="60" minLength="10" required onChange={inputChangeHandler} />
                    <textarea type="text" placeholder="Description" className="border p-3 rounded-lg" id="description" name="description" required onChange={inputChangeHandler} />
                    <input type="text" placeholder="Address" className="border p-3 rounded-lg" id="address" name="address" required onChange={inputChangeHandler} />
                    <div className="flex gap-6 flex-wrap">
                        <div className="flex gap-2">
                            <input type="checkbox" id="sale" name="sale" className="w-5 cursor-pointer" checked={data.sale} value={data.sale} onChange={inputCheckHandler} />
                            <span>Sell</span>
                        </div>
                        <div className="flex gap-2">
                            <input type="checkbox" id="rent" name="rent" className="w-5 cursor-pointer" checked={data.rent} value={data.rent} onChange={inputCheckHandler} />
                            <span>Rent</span>
                        </div>
                        <div className="flex gap-2">
                            <input type="checkbox" id="parking" name="parking" className="w-5 cursor-pointer" checked={data.parking} value={data.parking} onChange={inputCheckHandler} />
                            <span>Parking Spot</span>
                        </div>
                        <div className="flex gap-2">
                            <input type="checkbox" id="furnished" name="furnished" className="w-5 cursor-pointer" checked={data.furnished} value={data.furnished} onChange={inputCheckHandler} />
                            <span>Furnished</span>
                        </div>
                        <div className="flex gap-2">
                            <input type="checkbox" id="offer" name="offer" className="w-5 cursor-pointer" checked={data.offer} value={data.offer} onChange={inputCheckHandler} />
                            <span>Offer</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <input className="p-3 border border-gray-300 rounded-lg" type="number" id="bedRooms" name="bedRooms" min="1" max="10" required onChange={inputChangeHandler} />
                            <p>Bed Room</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input className="p-3 border border-gray-300 rounded-lg" type="number" id="bathRooms" name="bathRooms" min="1" max="10" required onChange={inputChangeHandler} />
                            <p>Bath Rooms</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input className="p-3 border border-gray-300 rounded-lg" type="number" id="regularPrice" name="regularPrice" min="10000" max="100000000" required onChange={inputChangeHandler} />
                            <div className="flex flex-col items-center">
                                <p>Regular Price</p>
                                {
                                    data.rent ? 
                                    ( <span className="text-xs">(₹ / month)</span>  )
                                    :
                                    null
                                }
                            </div>
                        </div>
                        {
                            data.offer ? 
                            (
                                <div className="flex items-center gap-2">
                                    <input className="p-3 border border-gray-300 rounded-lg" type="number" id="discountPrice" name="discountPrice" min="0" max="100000" required onChange={inputChangeHandler} />
                                    <div className="flex flex-col items-center">
                                        <p>Discounted Price</p>
                                        {
                                            data.rent ? 
                                            ( <span className="text-xs">(₹ / month)</span>  )
                                            :
                                            null
                                        }
                                    </div>
                                </div>
                            )
                            : 
                            null
                        }
                    </div>
                </div>
                <div className="flex flex-col flex-1 gap-4">
                    <p className="font-semibold">Images:{" "}
                        <span className="font-normal text-gray-600 ml-2">
                            The first image will be the cover (max 5)
                        </span>
                    </p>
                    <div className="flex gap-4">
                        <input className="p-3 border border-gray-300 rounded w-full" type="file" id="imageURLs" name="imageURLs" accept="image/*" multiple onChange={inputImageHandler} />
                        <button type="button" disabled={uploading} onClick={handleImageSubmit} className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80">{uploading ? "Uploading..." : "Upload"}</button>
                    </div>
                    <button type="submit" className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80" disabled={loading || uploading}>{loading ? "CREATING LIST" : "CREATE LIST"}</button>
                    {
                        imageData.length > 0 ? 
                        (
                            <>
                                <img className="cursor-pointer rounded-lg w-65 h-48 object-cover transition-transform duration-300 ease-in-out hover:scale-105" src={imageData[0]} alt="Cover" />
                                <button onClick={() => removeImageHandler(0)} className="cursor-pointer bg-slate-700 rounded-full p-2 text-white font-semibold hover:opacity-80 disabled:opacity-80">DELETE</button>
                                <div className="grid grid-cols-2 gap-4">
                                    {
                                        imageData.slice(1).map((url, index) => (
                                            <div key={index}>
                                                <img className="cursor-pointer rounded-lg object-cover h-32 transition-transform duration-300 ease-in-out hover:scale-105" src={url} alt={`Image ${index + 2}`} />
                                                <button onClick={() => removeImageHandler(index + 1)} className="cursor-pointer bg-slate-700 rounded-full p-2 mt-2 w-48 text-white font-semibold hover:opacity-80 disabled:opacity-80">DELETE</button>
                                            </div>
                                        ))
                                    }
                                </div>
                            </>
                        ) : 
                        (
                            <div className="flex justify-center items-center">
                                <p className="flex items-center font-semibold text-xl">No images uploaded yet.</p>
                            </div>
                        )
                    }
                    {
                        result ? 
                        ( <p className="text-green-600 text-xl text-center font-semibold">{result}</p> )
                        : 
                        ( <p className="text-red-600 text-xl text-center font-semibold">{imageUploadError ? imageUploadError : ""}</p>  )
                    }
                </div>
            </form>
        </main>
    );
};

export default CreateListing;
