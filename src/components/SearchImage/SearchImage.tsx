import React, { useState } from "react";
import { FaUpload, FaTimes } from "react-icons/fa";
import axios from "axios";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [queryText, setQueryText] = useState("");
  const [similarImages, setSimilarImages] = useState<any[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setUploadedImages((prev) => [...prev, ...newImages]);
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleScanImages = async () => {
    setScanning(true);
    setSimilarImages([]);

    try {
      const payload: any = {};
      if (selectedIndex !== null) {
        payload.image_index = selectedIndex; // Chỉ gửi image_index nếu có
      } else if (queryText.trim() !== "") {
        payload.query_text = queryText; // Chỉ gửi query_text nếu có
      }

      // Gửi request chỉ với trường cần thiết
      const response = await axios.post(
        "http://127.0.0.1:5000/similar_images",
        payload
      );

      const fetchedSimilarImages = response.data.map((img: any) => ({
        imagePath: `http://127.0.0.1:5000/images/${img.image_path
          .split("/")
          .pop()}`,
        similarity: img.similarity,
      }));

      setSimilarImages(fetchedSimilarImages);
    } catch (error) {
      console.error("Error scanning images:", error);
    } finally {
      setScanning(false);
    }
  };

  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-white rounded-lg p-6 w-4/5 md:w-1/3 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
          Upload Your Images
        </h2>

        <label className="flex items-center justify-center h-12 bg-blue-600 text-white rounded-lg cursor-pointer shadow-lg hover:bg-blue-700 transition duration-200 mb-4">
          <FaUpload className="mr-2 text-lg" />
          <span className="font-medium">Choose Files</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        <input
          type="text"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder="Enter search text"
          className="border rounded-lg p-2 mb-4 w-full text-black"
        />

        <button
          onClick={handleScanImages}
          className={`w-full bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg p-3 shadow-lg hover:from-green-600 hover:to-green-800 transition duration-200 ${
            scanning ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={scanning}
        >
          {scanning ? "Scanning..." : "Scan Images"}
        </button>

        {scanning && (
          <div className="flex items-center justify-center mt-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        <div className="mt-6">
          {uploadedImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {uploadedImages.map((image, index) => (
                <div
                  key={index}
                  onClick={() => handleImageClick(index)}
                  className={`relative overflow-hidden rounded-lg shadow-lg transition-transform transform hover:scale-105 ${
                    selectedIndex === index ? "border-2 border-blue-500" : ""
                  }`}
                >
                  <img
                    src={image}
                    alt={`Uploaded ${index}`}
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No images uploaded.</p>
          )}
        </div>

        {similarImages.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Similar Images</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {similarImages.map((img, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-lg shadow-lg"
                >
                  <img
                    src={img.imagePath}
                    alt={`Similar ${index}`}
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                  />
                  <p className="text-center text-gray-600">
                    Similarity: {img.similarity.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;
};

export default SearchModal;
