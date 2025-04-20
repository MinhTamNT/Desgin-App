import React, { useState, useEffect } from "react";
import "./SearchImage.css";
import { createPortal } from "react-dom";
import Select from "react-select";
import { API, endPoints } from "../../config/APIConfig";

type SearchImageModalProps = {
  onClose: () => void;
};

interface ResultImage {
  distance: number;
  image_path: string;
}

interface TagOption {
  value: string;
  label: string;
}

interface TagResponse {
  id: number;
  tag_name: string;
}

const SearchImageModal = ({ onClose }: SearchImageModalProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [resultImage, setResultImage] = useState<ResultImage[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const [tagOptions, setTagOptions] = useState<TagOption[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const fetchTags = async (search: string = "") => {
    setIsLoadingTags(true);
    try {
      const response = await API.get(endPoints.Tags, {
        params: {
          search_name: search,
          page: pageIndex,
          per_page: pageSize,
        },
      });

      const { results } = response.data;

      const options = results.map((tag: TagResponse) => ({
        value: String(tag.id),
        label: String(tag.tag_name),
      }));

      setTagOptions((prevOptions) => [...prevOptions, ...options]);
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setIsLoadingTags(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

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
    if (!imageSrc && selectedTags.length === 0) {
      setMessage("Please provide an image or select tags to search.");
      return;
    }

    setIsScanning(true);
    setMessage(null);

    try {
      const formData = new FormData();

      if (imageSrc) {
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        formData.append("file", blob);
      }

      if (selectedTags.length > 0) {
        const tagValues = selectedTags.map((tag) => tag.label);
        formData.set("tags", JSON.stringify(tagValues));
      }

      const res = await API.post(endPoints.SearchImage, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data;

      if (data.results.length === 0) {
        setMessage("No similar images found.");
      } else {
        setResultImage(data.results);
      }
    } catch (error) {
      console.error("Error scanning image:", error);
      setMessage("An error occurred while scanning.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleDelete = () => {
    setImageSrc(null);
    setResultImage([]);
    setSelectedTags([]);
    setMessage(null);
  };

  const handleImageDoubleClick = (imagePath: string) => {
    const event = new CustomEvent("addImageToCanvas", {
      detail: { imagePath },
    });
    window.dispatchEvent(event);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-5xl relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all"
          aria-label="Close"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center">
          <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search Images
        </h2>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl h-60 flex justify-center items-center mb-8 relative hover:border-blue-500 transition-all group cursor-pointer"
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          {imageSrc ? (
            <div className="relative w-full h-full p-2">
              <img
                src={imageSrc}
                alt="Uploaded"
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="absolute top-4 right-4 bg-white/70 backdrop-blur-sm shadow-sm text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all"
                aria-label="Delete image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center px-6">
              <svg className="w-12 h-12 text-gray-400 group-hover:text-blue-500 transition-colors mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 font-medium mb-1">
                Drag and drop an image here
              </p>
              <p className="text-gray-500 text-sm">
                or click to browse your files
              </p>
            </div>
          )}
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Select Tags
          </label>
          <Select
            isMulti
            options={tagOptions}
            value={selectedTags}
            onChange={(selected) => setSelectedTags(selected as TagOption[])}
            onInputChange={(inputValue) => {
              setTagOptions([]);
              fetchTags(inputValue);
            }}
            isLoading={isLoadingTags}
            placeholder="Search and select tags..."
            className="basic-multi-select"
            classNamePrefix="select"
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: '0.5rem',
                borderColor: '#e2e8f0',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: '#cbd5e1',
                },
                padding: '2px',
                minHeight: '45px'
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: '#eff6ff',
                borderRadius: '0.375rem',
                padding: '0px 2px'
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: '#2563eb',
                fontWeight: 500
              }),
              multiValueRemove: (base) => ({
                ...base,
                color: '#2563eb',
                ':hover': {
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                },
              }),
            }}
          />
        </div>

        <button
          onClick={handleScan}
          className={`w-full px-5 py-3 rounded-xl text-white font-medium flex items-center justify-center ${
            isScanning
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } transition-all shadow-sm`}
          disabled={isScanning}
        >
          {isScanning ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Scanning...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search for Similar Images
            </>
          )}
        </button>

        {message && (
          <div className="flex items-center justify-center mt-6 text-center">
            <div className={`px-4 py-3 rounded-lg ${
              message.includes("No") || message.includes("error") 
                ? "bg-red-50 text-red-700 border border-red-100" 
                : "bg-blue-50 text-blue-700 border border-blue-100"
            }`}>
              <p className="flex items-center">
                {message.includes("No") || message.includes("error") ? (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {message}
              </p>
            </div>
          </div>
        )}

        {resultImage.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800">Similar Images</h3>
              <div className="ml-auto text-sm text-gray-500">{resultImage.length} results found</div>
            </div>
            <p className="mb-4 text-sm text-gray-600 italic">Double-click on any image to add it to your canvas</p>
            <div className="overflow-x-auto custom-scrollbar pb-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {resultImage.map((item: ResultImage, index: number) => (
                  <div
                    key={index}
                    className="rounded-xl overflow-hidden shadow-sm border border-gray-100 transform transition-all duration-200 hover:scale-105 hover:shadow-md bg-white cursor-pointer group"
                    onDoubleClick={() => handleImageDoubleClick(item.image_path)}
                  >
                    <div className="relative">
                      <img
                        src={item.image_path}
                        alt={`Result ${index + 1}`}
                        className="w-full h-36 object-cover"
                      />
                      <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="bg-white/80 backdrop-blur-sm text-blue-600 text-xs px-2 py-1 rounded-md shadow-sm font-medium">
                          Double-click to use
                        </span>
                      </div>
                    </div>
                    <div className="px-3 py-2 text-xs text-gray-500">
                      Match: {Math.round((1 - item.distance) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default SearchImageModal;
