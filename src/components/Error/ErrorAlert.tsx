interface ErrorAlertProps {
  message: string;
  onClose: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
    <div className="flex items-center">
      <div className="flex-1 text-red-700">{message}</div>
      <button onClick={onClose} className="text-red-700 hover:text-red-900">
        ×
      </button>
    </div>
  </div>
);
