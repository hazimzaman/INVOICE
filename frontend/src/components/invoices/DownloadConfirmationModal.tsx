import { FiDownload } from 'react-icons/fi';

interface DownloadConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onDownloadMore: () => void;
  title?: string;
  message?: string;
}

export default function DownloadConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  onDownloadMore,
  title = "Download Invoice PDF",
  message = "Do you want to download this invoice as PDF?"
}: DownloadConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[400px]">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-gray-600">{message}</p>
        <div className="mt-6 flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              title="Download"
            >
              <FiDownload className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={onDownloadMore}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Download More
          </button>
        </div>
      </div>
    </div>
  );
} 