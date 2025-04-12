import React, { useState, useEffect } from "react";
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex  justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Search Image
        </h2>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex justify-center items-center mb-6 relative hover:border-blue-500 transition-all"
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

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
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
          />
        </div>

        <button
          onClick={handleScan}
          className={`w-full px-4 py-2 rounded-lg text-white ${
            isScanning
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } transition-all`}
          disabled={isScanning}
        >
          {isScanning ? "Scanning..." : "Scan Image"}
        </button>

        {isScanning && (
          <div className="relative w-full h-4 bg-gray-200 rounded overflow-hidden mt-6">
            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 animate-scan-glow"></div>
          </div>
        )}

        {message && <p className="text-center text-gray-500 mt-6">{message}</p>}

        {resultImage.length > 0 && (
          <div className="overflow-x-auto">
            <div
              className="flex flex-nowrap gap-4 mt-6"
              style={{ height: "auto" }}
            >
              <div className="flex flex-col gap-4">
                {[...Array(3)].map((_, rowIndex) => (
                  <div key={rowIndex} className="flex flex-nowrap gap-4">
                    {resultImage
                      .slice(rowIndex * 10, rowIndex * 10 + 10)
                      .map((item: ResultImage, index: number) => (
                        <div
                          key={`${rowIndex}-${index}`}
                          className="min-w-[200px] rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl bg-white"
                          onDoubleClick={() =>
                            handleImageDoubleClick(item.image_path)
                          }
                        >
                          <img
                            src={item.image_path}
                            alt={`Result ${index + 1}`}
                            className="w-full h-40 object-cover"
                          />
                        </div>
                      ))}
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
