import React, { useState } from "react";
import { createPortal } from "react-dom";

type SearchImageModalProps = {
  onClose: () => void;
};

const SearchImageModal = ({ onClose }: SearchImageModalProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!imageSrc) return;

    setIsScanning(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate 3 seconds delay
      setResultImage(imageSrc); // Simulate returning the same image as the result
    } catch (error) {
      console.error("Error scanning image:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDelete = () => {
    setImageSrc(null);
    setResultImage(null);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-lg font-bold mb-4 text-center">Search Image</h2>

        {/* Drag-and-Drop Area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex justify-center items-center mb-4 relative"
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          {imageSrc ? (
            <div className="relative w-full h-full">
              <img
                src={imageSrc}
                alt="Uploaded"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={handleDelete}
                className="absolute top-2 right-2 bg-red-500 text-white text-sm px-2 py-1 rounded hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          ) : (
            <p className="text-gray-500">
              Click or drag an image here to upload
            </p>
          )}
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        {/* Scan Button */}
        <button
          onClick={handleScan}
          className={`w-full px-4 py-2 rounded-lg text-white ${
            isScanning
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } transition-all`}
          disabled={!imageSrc || isScanning}
        >
          {isScanning ? "Scanning..." : "Scan Image"}
        </button>

        {/* Scanning Animation */}
        {isScanning && (
          <div className="relative w-full h-4 bg-gray-200 rounded overflow-hidden mt-4">
            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 animate-scan-glow"></div>
          </div>
        )}

        {/* Result Image */}
        {resultImage && (
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Result:</h3>
            <img
              src={resultImage}
              alt="Result"
              className="w-full h-48 object-cover rounded-lg shadow-md"
            />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default SearchImageModal;
