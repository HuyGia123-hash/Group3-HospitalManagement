import React, { useEffect } from 'react';

const Toast = ({ message, show, onClose, type = 'success' }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
            <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-2xl flex items-center space-x-3`}>
                <span className="font-bold">
                    {type === 'success' ? 'Thành công' : 'Lỗi'}
                </span>
                <span className="font-medium">{message}</span>
                <button 
                    onClick={onClose}
                    className="ml-4 hover:text-gray-200 focus:outline-none font-bold"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default Toast;