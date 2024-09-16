import { Cloudinary } from "@cloudinary/url-gen";

const Configuration = new Cloudinary({
  cloud: {
    cloudName: "dwvg5xlum",
  },
});

const uploadImageToCloudinary = async (base64Data: string) => {
  const formData = new FormData();
  formData.append("file", base64Data);
  formData.append("upload_preset", "postOwner");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dwvg5xlum/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Cloudinary upload failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};

const uploadImageByClipBoard = async (base64Data: string) => {
  // Convert base64 data to a Blob
  const blob = await (await fetch(base64Data)).blob();

  // Prepare the form data
  const formData = new FormData();
  formData.append("file", blob);
  formData.append("upload_preset", "postOwner");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dwvg5xlum/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Image upload failed.");
    }

    const data = await response.json();
    return data; // Return the uploaded image's URL
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export { uploadImageToCloudinary, uploadImageByClipBoard };
