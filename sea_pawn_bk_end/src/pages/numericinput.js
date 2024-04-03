import React from 'react';

function NumericInput(props) {
    const handleKeyPress = (evt) => {
        const { key, target } = evt;

        // Allow only numbers (0-9) and a single decimal point
        if (!/[\d.]/.test(key)) {
            evt.preventDefault();
        }

        // Allow only one decimal point
        if (key === '.' && target.value.includes('.')) {
            evt.preventDefault();
        }
    };

    return (
        <input type="text" onKeyPress={handleKeyPress} {...props} />
    );
}

export default NumericInput;