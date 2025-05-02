const loadingOverlay = document.createElement("div");
loadingOverlay.className =
  "absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50";
loadingOverlay.innerHTML = `
  <div class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-white"></div>
`;