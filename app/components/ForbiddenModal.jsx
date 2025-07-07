"use client";

const ForbiddenModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md text-center shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          403 - Access Denied
        </h2>
        <p className="text-gray-700 mb-4">
          You don't have permission to access this resource.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ForbiddenModal;
