import React, { useRef, useEffect } from 'react';

const Popup = ({ children, onClose }) => {
    const popupRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose(); // Call the onClose function passed from the parent component
            }
        };

        // Add event listener to listen for clicks outside the popup
        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup function to remove event listener when component unmounts
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zoom: '0.9' }}>
            <div ref={popupRef} style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '800px', height: '700px', overflowY: 'scroll', marginTop: '40px' }}>
                {children}
            </div>
        </div>
    );
};

export default Popup;