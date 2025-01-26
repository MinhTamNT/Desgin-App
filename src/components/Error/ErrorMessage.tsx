interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="flex justify-center items-center min-h-screen bg-gray-50">
    <div className="text-red-500 text-center">
      <h2 className="text-2xl font-bold mb-2">Error</h2>
      <p>{message}</p>
    </div>
  </div>
);
