import React, { useState, useEffect } from 'react';
import Header from './header';
import Header1 from './header1';
import Footer from './footer';
import { FaPlus } from "react-icons/fa";
import NumericInput from './numericinput';
import Swal from 'sweetalert2';
import API from '../api/API';  // Import the new api.js

const IncExp = () => {
    const [billDate, setBillDate] = useState('');
    const [billTitle, setBillTitle] = useState('');
    const [billType, setBillType] = useState('inc');
    const [numInputs, setNumInputs] = useState(1);
    const [errors, setErrors] = useState({});
    const [inputFields, setInputFields] = useState([]);
    const [showDetails, setShowDetails] = useState(false);
    const [allValues, setAllValues] = useState([]);
    const [allValues1, setAllValues1] = useState([]);    
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const calculateGrandTotal = () => {
            let calculatedTotal = 0;
            inputFields.forEach(field => {
                calculatedTotal += field.amount * field.quantity;
            });
            return calculatedTotal;
        };
        
        let calculatedTotal = calculateGrandTotal();
        setTotal(calculatedTotal);
    }, [inputFields]);

    useEffect(() => {
        console.log(allValues);
        console.log(allValues1);
    }, [allValues, allValues1]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'billDate') {
            setBillDate(value);
        } else if (name === 'billTitle') {
            setBillTitle(value);
        } else if (name === 'billType') {
            setBillType(value);
        }
    };

    const handleNumInputChange = (e) => {
        setNumInputs(e.target.value);
    };

    const handleProceed = () => {
        const errors = {};
        if (!billDate.trim()) {
            errors.billDate = 'Bill Date is required';
        }
        if (!billTitle.trim()) {
            errors.billTitle = 'Bill Title is required';
        } else if (!/^[a-zA-Z]+$/.test(billTitle)) {
            errors.billTitle = 'Bill Title should contain only alphabetical characters';
        }
        setErrors(errors);

        if (Object.keys(errors).length === 0) {
            const fields = Array.from({ length: numInputs }, (_, i) => ({
                id: i,
                description: '',
                amount: '',
                quantity: ''
            }));
            setInputFields(fields);
            setShowDetails(true);
        }
    };

    const handleFieldChange = (id, fieldName, value) => {
        const updatedFields = inputFields.map(field => {
            if (field.id === id) {
                return { ...field, [fieldName]: value };
            }
            return field;
        });
        setInputFields(updatedFields);
    };

    const handleSave = async () => {
        const errors = [];
    
        // Validate each input field
        inputFields.forEach(field => {
            if (!field.description.trim()) {
                errors.push(`Description is required for field ${field.id}`);
            } else if (!/^[a-zA-Z]+$/.test(field.description)) {
                errors.push(`Description for field ${field.id} should contain only alphabetical characters`);
            }
            if (!field.amount.trim()) {
                errors.push(`Amount is required for field ${field.id}`);
            } else if (isNaN(Number(field.amount))) {
                errors.push(`Amount must be a valid number for field ${field.id}`);
            }
            if (!field.quantity.trim()) {
                errors.push(`Quantity is required for field ${field.id}`);
            } else if (isNaN(Number(field.quantity))) {
                errors.push(`Quantity must be a valid number for field ${field.id}`);
            }
        });
    
        // Check if there are any errors
        if (errors.length > 0) {
            // Display SweetAlert alert with validation errors
            Swal.fire({
                icon: 'warning',
                title: 'Validation Warning',
                text: 'Enter the values',
            });
            
            // Stop further execution
            return;
        }
    
        // Continue with saving data if no errors
        const values1 = {
            billDate,
            billTitle,
            total,
            billType
        };
        const values = inputFields.map(field => ({
            description: field.description,
            amount: field.amount,
            total1: field.amount * field.quantity,
            quantity: field.quantity
        }));
        setAllValues(values);
        setAllValues1(values1);
    
        try {
            const response = await fetch(API.saveData, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values1,
                    values
                })
            });
    
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Data saved successfully',
                }).then(() => {
                    // Reload the page
                    window.location.reload();
                });
                console.log('Data saved successfully');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to save data',
                });
                console.error('Failed to save data');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
            });
            console.error('Error saving data:', error);
        }
    };

    return (
        <div className='bghome'>
            <Header />
            <Header1 />
            <div style={{ zoom: '0.8' }}>
                <div className='col-md-12 title'>
                    <FaPlus className='mb-1' /> ADD INCOME / EXPENSE
                </div>
                <div style={{ zoom: '1' }} className='mx-5 my-4'>
                    <div className='col-md-11 le ms-4'>
                        <div className='col-md-2 text-start ms-5'>
                            <label><b style={{ fontWeight: '700', fontSize: '20px' }} className='ms-5'>Bill Date</b></label><br />
                            <input type='date' name='billDate' value={billDate} onChange={handleInputChange} className='mt-2 ms-5' style={{ margin: '5px 5px', width: '70%', padding: '6px', fontSize: '18px' }} />
                            {errors.billDate && <div className="error" style={{color: 'red', fontSize: '20px', fontWeight: '400'}}>*{errors.billDate}</div>}
                        </div>
                        <div className='col-md-2 text-start ms-3'>
                            <label><b style={{ fontWeight: '700', fontSize: '20px' }}>Bill Title</b></label><br />
                            <input type='text' name='billTitle' value={billTitle} onChange={handleInputChange} className='mt-2' style={{ margin: '5px 5px', width: '90%', padding: '6px', fontSize: '18px' }} />
                            {errors.billTitle && <div className="error" style={{color: 'red', fontSize: '20px', fontWeight: '400'}}>*{errors.billTitle}</div>}
                        </div>
                        <div className='col-md-2 text-start ms-3'>
                            <label><b style={{ fontWeight: '700', fontSize: '20px' }}>What Kind of Bill</b></label><br />
                            <select name='billType' value={billType} onChange={handleInputChange} className='mt-2' style={{ margin: '5px 5px', width: '90%', padding: '6px', fontSize: '18px' }}>
                                <option value='inc'>Income</option>
                                <option value='exp'>Expense</option>
                            </select>
                        </div>
                        <div className='col-md-3 text-start ms-3'>
                            <label><b style={{ fontWeight: '700', fontSize: '20px' }}>Number of inputs need to Enter</b></label><br />
                            <NumericInput value={numInputs} onChange={handleNumInputChange} className='mt-2' style={{ margin: '5px 5px', width: '90%', padding: '6px', fontSize: '18px' }} />
                        </div>
                        <div className='col-md-3 text-start ms-3' style={{ marginTop: '2.6%' }}>
                            <button className='btn btn-primary px-3' onClick={handleProceed}>Proceed</button>
                        </div>
                    </div>
                    {/* <div className={showDetails ? 'col-md-12 le ms-4 mt-3' : 'dnone'}>
                        <div className='col-md-2 text-start ms-5'>
                           
                        </div>
                        <div className='col-md-2 text-start ms-5'>
                            
                        </div>
                        <div className='col-md-2 text-start ms-5'>
                           
                        </div>
                        <div className='col-md-2 text-start ms-5'>
                            
                        </div>
                    </div> */}
                    <br /> <br />
                    {inputFields.map(field => (
                        <div style={{zoom:0.9}} key={field.id} className='col-md-12 le ms-4'>
                            <div className='col-md-2 text-center ms-5'>
                            <label><b style={{ fontWeight: '500', fontSize: '22px' }}>Description</b></label><br />
                                <input type='text' value={field.description} onChange={e => handleFieldChange(field.id, 'description', e.target.value)} className='mt-2' style={{ margin: '5px 5px', width: '90%', padding: '6px', fontSize: '18px' }} />
                            </div>
                            <div className='col-md-2 text-center ms-5'>
                            <label><b style={{ fontWeight: '500', fontSize: '22px' }}>Amount</b></label><br />
                                <NumericInput value={field.amount} onChange={e => handleFieldChange(field.id, 'amount', e.target.value)} className='mt-2' style={{ margin: '5px 5px', width: '90%', padding: '6px', fontSize: '18px' }} />
                            </div>
                            <div className='col-md-2 text-center ms-5'>
                            <label><b style={{ fontWeight: '500', fontSize: '22px' }}>Qty</b></label><br />
                                <NumericInput value={field.quantity} onChange={e => handleFieldChange(field.id, 'quantity', e.target.value)} className='mt-2' style={{ margin: '5px 5px', width: '90%', padding: '6px', fontSize: '18px' }} />
                            </div>
                            <div className='col-md-2 text-center ms-5'>
                            <label><b style={{ fontWeight: '500', fontSize: '22px' }}>Total</b></label><br />
                                <NumericInput value={field.amount * field.quantity} readOnly className='mt-2' style={{ margin: '5px 5px', width: '90%', padding: '6px', fontSize: '18px' }} />
                            </div>
                        </div>
                    ))}
                    <div style={{zoom:0.9}}  className={showDetails ? 'col-md-12 ms-4 mt-2' : 'dnone'}>
                        <div className='col-md-8 text-center ms-5'>
                            <b className='float-end inxgt' style={{ marginRight: '-50px', fontWeight: '500', fontSize: '21px', whiteSpace: 'nowrap' }}>Grand Total</b><br />
                        </div>
                        <div className='col-md-10 text-end ms-5'>
                            <input type='text' value={total} readOnly className='mt-2 float-end inxgt' style={{ marginRight: '-190px', width: '18%', padding: '6px', fontSize: '18px', whiteSpace: 'nowrap' }} />
                        </div>
                        <br /> <br /> <br />
                        <div className='col-md-10 text-center mt-4'>
                            <button className='btn btn-primary px-3 me-5 float-end w-20' onClick={handleSave}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='fixed-bottom'>
            <Footer />
            </div>
        </div>
    );
};

export default IncExp;