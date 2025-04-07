import React, { useState } from "react";
import { createPortal } from "react-dom";
import { API, endPoints } from "../../config/APIConfig";
type SearchImageModalProps = {
  onClose: () => void;
};

interface ResultImage {
  distance: number;
  image_path: string;
}

interface ApiResponse {
  message: string;
  results: ResultImage[];
}

const SearchImageModal = ({ onClose }: SearchImageModalProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [resultImage, setResultImage] = useState<ApiResponse[]>([]);
  const [pageIndex, setPageIndex] = useState<number | 0>(1);
  const [pageSize, setPageSize] = useState<number | 0>(10);
  const [totalPage, setTotalPage] = useState<number | 0>(0);

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

    try {
      const respone = await fetch(imageSrc);
      const blob = await respone.blob();
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("page", pageIndex.toString());
      formData.append("per_page", pageSize.toString());
      const res = await API.post(endPoints.SearchImage, formData, {
        headers: {
          mudiaType: "multipart/form-data",
          "Content-Type": "multipart/form-data",
        },
      });
      const data = res.data;
      // console.log("Response data:", data);
      setResultImage(data.results);
    } catch (error) {
      console.error("Error scanning image:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDelete = () => {
    setImageSrc(null);
    setResultImage([]);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-128 relative">
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

        {resultImage !== null && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {resultImage?.map((item: any, index: number) => (
              <div key={index} className="rounded-lg overflow-hidden shadow-md">
                <img
                  src={`data:image/jpeg;base64,${item?.image_path}`}
                  alt={`Result ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
              </div>
            ))}
          </div>
        )}
        {resultImage.length < 0 && (
          <>
            <p className="text-center text-gray-500 mt-4">
              không tìm thấy ảnh tương tự
            </p>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default SearchImageModal;
