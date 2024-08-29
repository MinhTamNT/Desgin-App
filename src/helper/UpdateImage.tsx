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

export { uploadImageToCloudinary };
