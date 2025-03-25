// ./ui/AlertDialog.js
import React from 'react';

// AlertDialog Component
export const AlertDialog = ({ children, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6">
                {children}
            </div>
        </div>
    );
};

// AlertDialogTrigger Component
export const AlertDialogTrigger = ({ onClick, children }) => (
    <button
        onClick={onClick}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
        {children}
    </button>
);

// AlertDialogContent Component
export const AlertDialogContent = ({ children }) => (
    <div className="mb-4">
        {children}
    </div>
);

// AlertDialogHeader Component
export const AlertDialogHeader = ({ children }) => (
    <div className="mb-2">
        {children}
    </div>
);

// AlertDialogTitle Component
export const AlertDialogTitle = ({ children }) => (
    <h2 className="text-lg font-bold">
        {children}
    </h2>
);

// AlertDialogDescription Component
export const AlertDialogDescription = ({ children }) => (
    <p className="text-gray-600">
        {children}
    </p>
);

// AlertDialogFooter Component
export const AlertDialogFooter = ({ children }) => (
    <div className="flex justify-end mt-4">
        {children}
    </div>
);

// AlertDialogCancel Component
export const AlertDialogCancel = ({ onClick, children }) => (
    <button
        className="mr-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-200"
        onClick={onClick}
    >
        {children}
    </button>
);

// AlertDialogAction Component
export const AlertDialogAction = ({ onClick, children }) => (
    <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={onClick}
    >
        {children}
    </button>
);