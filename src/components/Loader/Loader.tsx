export const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
      <div className="w-64 h-64 bg-white rounded-lg shadow-lg flex items-center justify-center overflow-hidden">
        <iframe
          src="https://giphy.com/embed/Ll88bcCbnV5U5UGsW7"
          width="100%"
          height="100%"
          className="rounded-lg border-none"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};
