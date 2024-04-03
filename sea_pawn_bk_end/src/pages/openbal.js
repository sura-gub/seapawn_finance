import React, { useEffect, useState, useRef } from 'react';
import Header from './header';
import Header1 from './header1';
import Footer from './footer';
import { FaMoneyBillWave, FaRegEdit } from "react-icons/fa";
import NumericInput from './numericinput';
import { MdDelete } from "react-icons/md";
import Swal from 'sweetalert2';
import API from '../api/API';  // Import the new api.js

function OpeningBalance() {
    const [paymentAmount, setPaymentAmount] = useState('');
    const [companyStartingDate, setCompanyStartingDate] = useState('');
    const [depositOwnerName, setDepositOwnerName] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [loans, setLoans] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [day, setDay] = useState('');
    const [amount, setAmount] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Adjust as needed

    const popupRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
          if (popupRef.current && !popupRef.current.contains(event.target)) {
            setShowPopup(false);
          }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
    
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [popupRef]);

    const handleEditClick1 = (id) => {
        const storedPassword = sessionStorage.getItem('password');
        const enteredPassword = prompt('Enter your password:');

        if (enteredPassword === storedPassword) {
            setSelectedId(id); // Set the selected ID for fetching specific loan data
            fetchObalance(id); // Pass the selected ID to fetchLoans
            setShowPopup(true); // Show the popup
        } else if (enteredPassword === null) {
            alert('Edit process Cancelled');
        } else {
            alert('Incorrect password!');
        }
    };

    const fetchObalance = async (id) => {
        try {
            const response = await fetch(`${API.getOpeningDetails}/${id}`);
            if (response.ok) {
                const loanData = await response.json();
                // Convert date string to Date object and format for display
                const formattedLoanData = {
                    ...loanData,
                    dt: new Date(loanData.dt).toLocaleDateString('en-GB')
                };
    
                // Original code
                var formattedDate = formattedLoanData.dt;
                // Split the date into parts (day, month, year)
                const parts = formattedDate.split('/');
                const day = parts[0];
                const month = parts[1];
                const year = parts[2];
                setDay(day);
    
                // Combine the parts in the correct order (year, month, day)
                const newFormattedDate = `${year}-${month}-${day}`;
                console.log("newFormattedDate", newFormattedDate);
    
                setDate(newFormattedDate);
                setName(formattedLoanData.nm);
                setAmount(formattedLoanData.amt);
            } else {
                console.error('Failed to fetch loan by search');
            }
        } catch (error) {
            console.error('Error fetching loan by search:', error);
        }
    };

    const handlePopupClose = () => {
        setShowPopup(false);
    };

    const handleUpdate = () => {
        // Assuming you have an API endpoint `/updateLoanData` to update loan data
        fetch(API.updateOpeningDetail, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: selectedId, // Assuming `loans.id` contains the ID of the loan to be updated
                name: name,
                date: date,
                amount: amount
            })
        })
        .then(async (response) => {
            if (response.ok) {
                // Handle success response
                console.log('Opening Detail updated successfully');
                Swal.fire({
                    title: 'Success!',
                    text: 'Opening Detail updated successfully', // Assuming the server sends a 'message' field in the response
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Reload the page
                    window.location.reload();
                });
            } else if (response.status === 409) {
                // Deposit detail is already inserted for this month
                const responseData = await response.json(); // await the Promise here
                Swal.fire({
                    icon: 'info',
                    title: 'Notification',
                    text: responseData.message
                });
            } else {
                // Deposit detail is already inserted for this month
                const responseData = await response.json(); // await the Promise here
                Swal.fire({
                    icon: 'warning',
                    title: 'Warning!',
                    text: responseData.error
                });
            }
        })
        .catch(error => {
            console.error('Error updating loan data:', error);
        })
        .finally(() => {
            setShowPopup(false);
        });
    };    

    const handleAmountChange = (e) => {
        let value = e.target.value;
    
        // Remove any non-numeric characters
        value = value.replace(/\D/g, '');
    
        // Ensure that the value is not empty
        if (value === '') {
            // If input is empty after removing non-numeric characters, set it to 0
            value = '';
        }
    
        // Update the input value and state
        e.target.value = value;
        setPaymentAmount(value);
    };

    const handleDateChange = (e) => {
        setCompanyStartingDate(e.target.value);
    };

    const handleNameChange = (e) => {
        // Use a regular expression to allow only alphabetic characters
        const value = e.target.value;
        const isValidInput = /^[a-zA-Z\s]*$/.test(value);
    
        if (!isValidInput) {
            // If input is not valid, set the value to a sanitized version (only alphabetic characters)
            e.target.value = value.replace(/[^a-zA-Z\s]/g, '');
        }
    
        setDepositOwnerName(e.target.value);
    };

    const handleNameChange1 = (e) => {
        // Use a regular expression to allow only alphabetic characters
        const value = e.target.value;
        const isValidInput = /^[a-zA-Z\s]*$/.test(value);
    
        if (!isValidInput) {
            // If input is not valid, set the value to a sanitized version (only alphabetic characters)
            e.target.value = value.replace(/[^a-zA-Z\s]/g, '');
        }
    
        setName(e.target.value);
    };

    useEffect(() => {
        // Check if username and password are present in session storage
        const username = sessionStorage.getItem('username');
        const password = sessionStorage.getItem('password');
        const userType = sessionStorage.getItem('userType');

        if (!username || !password) {
            // Redirect to login.js if username or password is missing
            window.location.href = '/';
        }
    
        if (userType === 'staff' ) {
            window.history.back();
        }

        const fetchLoans = async () => {
            try {
              const response = await fetch(API.getOpeningBalance);
              if (response.ok) {
                const loanData = await response.json();
                // Convert month number to month name
                const loansWithMonthNames = loanData.map(loan => ({
                    ...loan,
                    mnth: getMonthName(loan.mnth)
                }));
                setLoans(loansWithMonthNames);
              } else {
                console.error('Failed to fetch loans');
              }
            } catch (error) {
              console.error('Error fetching loans:', error);
            }
          };

          fetchLoans();
    }, []);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = loans.slice(indexOfFirstItem, indexOfLastItem);
 
    // Logic to render page numbers
    const visiblePageNumbers = [];
    for (
        let i = Math.max(1, currentPage - 1);
        i <= Math.min(currentPage + 1, Math.ceil(loans.length / itemsPerPage));
        i++
    ) {
        visiblePageNumbers.push(i);
    }

    // Function to handle page change
    const handleClick = (event, pageNumber) => {
        event.preventDefault();
        setCurrentPage(pageNumber);
    };

    const handleSetNow = async () => {
        try {
            // Send data to server
            const response = await fetch(API.insertOpeningBalance, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: paymentAmount,
                    date: companyStartingDate,
                    name: depositOwnerName
                })
            });
    
            if (response.status === 409) {
                // Deposit detail is already inserted for this month
                const responseData = await response.json();
                Swal.fire({
                    icon: 'info',
                    title: 'Notification',
                    text: responseData.message
                });
            } else if (!response.ok) {
                // Other errors
                const responseData = await response.json(); // await the Promise here
                Swal.fire({
                    icon: 'warning',
                    title: 'Warning!',
                    text: responseData.error
                });
            } else {
                // Success
                const data = await response.json();
                console.log(data.message); // Log the server response
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: data.message
                }).then(() => {
                    // Reload the page
                    window.location.reload();
                });
            }
        } catch (error) {
            console.error('Error:', error.message);
            // Show error message using SweetAlert
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
            }).then(() => {
                // Reload the page
                window.location.reload();
            });
        }
    };

    const getMonthName = (monthNumber) => {
        const date = new Date();
        date.setMonth(monthNumber - 1); // JavaScript months are 0-based
        return date.toLocaleString('default', { month: 'long' });
    };

    const handleEditClick = (id) => {
        const storedPassword = sessionStorage.getItem('password');
        const enteredPassword = prompt('Enter your password:');

        if (enteredPassword === storedPassword) {
            setSelectedId(id); // Set the selected ID for fetching specific loan data
            handleActionOptionClick(id);
            console.log(selectedId);
        } else if (enteredPassword === null) {
            alert('Delete process Cancelled');
        } else {
            alert('Incorrect password!');
        }
    };

      // Function to handle edit/delete option click
  const handleActionOptionClick = (id) => {
    Swal.fire({
      title: 'Delete Confirmation',
      text: 'Are you sure you want to delete this Opening balance Detail?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Call the function to handle staff deletion
        handleDeleteLoan(id);
      } else {
        // Reset the selected staff
        setSelectedId(null);       
      }
    });
};

      // Function to handle loan deletion
      const handleDeleteLoan = async (id) => {
        try {
          const response = await fetch(`${API.deleteLoan1}/${id}`, {
            method: 'DELETE',
          });
      
          if (response.ok) {
            Swal.fire({
              title: 'Deleted!',
              text: 'Opening balance Entry has been deleted.',
              icon: 'success',
              confirmButtonText: 'OK',
            }).then(() => {
              // Reload the page
              window.location.reload();
            });
          } else {
            console.error('Failed to delete loan entry');
          }
        } catch (error) {
          console.error('Error deleting loan entry:', error);
        }
      };
    
    return (
        <div className='bghome'>
            <Header />
            <Header1 />
            <div style={{zoom: '0.8'}}>
                <div className='col-md-12 title'>
                    <FaMoneyBillWave className='mb-1' /> Opening Balance
                </div>
                <div className='col-md-12 le vh-100' style={{zoom: 0.9}}>
                    <div className='col-md-5 my-3 ms-5 me-1 lfb'>
                        <div className='col-md-12'>
                            <label className='fs-5'>
                                <b style={{fontWeight: '600', marginLeft: '15px'}}>
                                    Enter Opening Balance Amt
                                </b>
                            </label><br />
                            <NumericInput id="amount" name="amount" value={paymentAmount} style={{ margin: '5px 5px', width: '90%', padding: '6px' }} onChange={handleAmountChange} />
                        </div>
                        <div className='col-md-12'>
                            <label className='fs-5'>
                                <b style={{fontWeight: '600', marginLeft: '15px'}}>
                                    Deposit Date
                                </b>
                            </label><br />
                            <input type='date' id="date" name="date" style={{ margin: '5px 5px', width: '90%', padding: '6px', fontSize: '18px' }} onChange={handleDateChange} />
                        </div>
                        <div className='col-md-12'>
                            <label className='fs-5'>
                                <b style={{fontWeight: '600', marginLeft: '15px'}}>
                                    Deposit-Owner A/C Name
                                </b>
                            </label><br />
                            <input type='text' id="name" name="name" style={{ margin: '5px 5px', width: '90%', padding: '6px', fontSize: '20px' }} onChange={handleNameChange} />
                        </div>
                        <div className='col-md-12 mt-3 text-end'>
                            <button className='btn btn-primary' style={{marginRight: '10.5%'}} onClick={handleSetNow}>Set Now</button>
                        </div>
                    </div>
                    <div className='col-md-6 my-3 mx-5'>
                        <h4 style={{marginLeft: '35%'}}>
                            Monthly Opening Balance
                        </h4>
                        <div className='col-md-12' style={{zoom: 1.1}}>
                            <table className='table table-bordered bg-light text-center m-3'>
                                <thead>
                                    <tr>
                                        <td style={{backgroundColor: '#fff0'}}>
                                            Si.no
                                        </td>
                                        <td style={{backgroundColor: '#fff0'}}>
                                            Opening Balance
                                        </td>
                                        <td style={{backgroundColor: '#fff0'}}>
                                            Month - Year
                                        </td>
                                        <td style={{backgroundColor: '#fff0'}}>
                                            Action
                                        </td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((loan, index) => (
                                        <tr key={index}>
                                            <td style={{backgroundColor: '#fff0'}}>
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td style={{backgroundColor: '#fff0'}}>
                                                Rs. {loan.amt}, Owner A/C : {loan.nm}
                                            </td>
                                            <td style={{backgroundColor: '#fff0'}}>
                                                {loan.mnth} - {loan.yr}
                                            </td>
                                            <td style={{backgroundColor: '#fff0'}}>
                                                <FaRegEdit size={25} onClick={() => handleEditClick1(loan.id)} /> &nbsp; <MdDelete size={25} onClick={() => handleEditClick(loan.id)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                    <div className='text-center mt-2'>
                        {currentPage > 1 && (
                            <button onClick={(e) => handleClick(e, currentPage - 1)} className='mx-1 btn'>
                                Previous
                            </button>
                        )}
                        {visiblePageNumbers.map(number => (
                            <button key={number} onClick={(e) => handleClick(e, number)} className={`mx-1 btn ${number === currentPage ? 'active' : ''}`}>
                                {number}
                            </button>
                        ))}
                        {currentPage < Math.ceil(loans.length / itemsPerPage) && (
                            <button onClick={(e) => handleClick(e, currentPage + 1)} className='mx-1 btn'>
                                Next
                            </button>
                        )}
                    </div>
                        </div>
                    </div>
                </div>
            </div>   
            <div className='fixed-bottom'>         
            <Footer />
            </div>
            {showPopup && (
                <div>
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '400px', }} ref={popupRef}>
                            <div className='modal-header1'>
                                <button onClick={handlePopupClose} className='btn' style={{ position: 'relative', left: '45%' }} > X </button>
                            </div>
                            <div style={{ display: day !== '01' ? 'block' : 'none' }}>
                                <label className='ms-1'><b style={{fontWeight: '600'}}>Deposit-Owner A/C Name</b></label><br />
                                <input type='text' className='ms-2' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={name} onChange={handleNameChange1} />
                            </div>
                            <div style={{ display: day !== '01' ? 'block' : 'none' }}>
                                <label className='ms-1'><b style={{fontWeight: '600'}}>Date</b></label>
                                    <input type='date' className='ms-2' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={date} onChange={(e) => setDate(e.target.value)} />
                            </div>
                            <div style={{ display: day !== '01' ? 'block' : 'none' }}>
                                <label className='ms-1'><b style={{fontWeight: '600'}}>Enter Opening Balance Amt</b></label><br />
                                <input type='text' className='ms-2' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={amount} onChange={(e) => setAmount(e.target.value)} />
                            </div>
                            <div className='col-md-12 text-center mt-3' style={{ display: day !== '01' ? 'block' : 'none' }}>
                                <button className='btn btn-success' onClick={handleUpdate}>Set Now</button>
                            </div>
                            <div className='col-md-12 text-center mt-3' style={{ display: day === '01' ? 'block' : 'none' }}>
                                <span style={{color: 'red', fontWeight: '500'}}>You can't alter the Stored Value comes from Closing Balance</span>
                            </div>
                        </div>           
                    </div>
                </div>
            )}
        </div>
    );
}

export default OpeningBalance;