import React, { useEffect, useState } from 'react';
import Header from './header';
import Header1 from './header1';
import Footer from './footer';
import { FaMoneyBillWave } from "react-icons/fa";
import swal from 'sweetalert2';
import API from '../api/API';  // Import the new api.js

function Examt() {
    const [loan, setLoan] = useState([]);
    const [selectedSearchOption, setSelectedSearchOption] = useState([]);
    const [searchMode, setSearchMode] = useState('');
    const [searchOptions, setSearchOptions] = useState([]);
    const [showDetails, setShowDetails] = useState(false);
    const [extraAmount, setExtraAmount] = useState('');
    const [int, setInt] = useState('');
    const [total, setTotal] = useState('');
    const [dateDifferenceExceedsOneMonth, setDateDifferenceExceedsOneMonth] = useState(false);
    const [totamt, setTotamt] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        // Check if username and password are present in session storage
        const username = sessionStorage.getItem('username');
        const password = sessionStorage.getItem('password');

        if (!username || !password) {
            // Redirect to login.js if username or password is missing
            window.location.href = '/';
        }

        fetchCompanyDetails();
    }, []);

    useEffect(() => {
        // Fetch search options based on search mode
        const fetchSearchOptions = async () => {
            try {
                if (searchMode === 'mob' || searchMode === 'glno' || searchMode === 'name') {
                    const response = await fetch(`${API.getSearchOptions}?mode=${searchMode}`);
                    if (response.ok) {
                        const optionsData = await response.json();
                        setSearchOptions(optionsData.options);
                    } else {
                        console.error('Failed to fetch search options');
                    }
                }
            } catch (error) {
                console.error('Error fetching search options:', error);
            }
        };

        fetchSearchOptions();
    }, [searchMode]);

    const handleSearchModeChange = (e) => {
        setSearchMode(e.target.value);
    };

    const handleSearchButtonClick = () => {
        fetchLoanBySearch();
        setShowDetails(true);
    };

    const fetchLoanBySearch = async () => {
        try {
            const response = await fetch(`${API.getLoanBySearch}?mode=${searchMode}&value=${selectedSearchOption}`);
            if (response.ok) {
                const loanData = await response.json();
                loanData.forEach(item => setTotamt(item.tot_paid));
                loanData.forEach(item => fetchArtBySearch(item.id));
                setLoan(loanData);
            } else {
                console.error('Failed to fetch loan by search');
            }
        } catch (error) {
            console.error('Error fetching loan by search:', error);
        }
    };

    const fetchArtBySearch = async (id) => {
        try {
            const response = await fetch(`${API.getLoanBySearchess}/${id}`);
            if (response.ok) {
                const loanData1 = await response.json();
                let arttContent = '';
    
                if (Array.isArray(loanData1)) {
                    arttContent = loanData1.map(item => `${item.arti}(${item.grm}gm)`).join(', ');
                    setContent(arttContent);
                }
            } else {
                console.error('Failed to fetch loan by search');
            }
        } catch (error) {
            console.error('Error fetching loan by search:', error);
        }
    };

    const fetchCompanyDetails = async () => {
        try {
            const response = await fetch(API.getCompanyDetails);
            const result = await response.json();
    
            if (result.message === 'Company details retrieved successfully') {
                const companyDetails = result.data;
    
                document.getElementById('omobValue').innerText = companyDetails.omob || '';
                document.getElementById('cmobValue').innerText = companyDetails.cmob || '';
                document.getElementById('lnnoValue').innerText = companyDetails.lnno || '';
                document.getElementById('cnameValue').innerText = companyDetails.cname || '';
                document.getElementById('caddrValue').innerText = companyDetails.caddr || '';
            } else {
                console.log('Error retrieving company details:', result.error);
            }
        } catch (error) {
            console.error('Error fetching company details:', error);
        }
    };

    const handleNumberInput1 = (e) => {
        const { value } = e.target;
        const isValidInput = /^[0-9]*\.?[0-9]*$/.test(value);
    
        if (isValidInput) {
            setExtraAmount(value);
        }
    };
    const [timeDifference, setTimeDifference] = useState('');
    
    const handleGiveNow = async () => {
        if (dateDifferenceExceedsOneMonth) {
            // If date difference is within one month, do nothing
            return;
        }
    
        const enteredValue = parseFloat(extraAmount);
    
        // Check if the entered amount is non-negative
        if (enteredValue >= 0) {
            // Proceed with updating the loan amount
            const updatedAmount = parseFloat(loan[0]?.amt) + enteredValue;
    
            // Update loan amount in the database
            try {
                const response = await fetch(API.updateLoanAmount, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        newAmount: updatedAmount,
                        examount: enteredValue,
                        pawn_intrest: loan[0]?.pawn_intrest,
                        gl_no: loan[0]?.gl_no,
                        cust_mob: loan[0]?.cust_mob,
                        nm: loan[0]?.nm,
                        id: loan[0]?.id,
                    }),
                });
    
                if (response.ok) {
                    swal.fire({
                        title: 'Success!',
                        text: 'Loan amount updated successfully',
                        icon: 'success',
                        confirmButtonText: 'OK',
                    }).then(() => {
                        // Reload the page
                        window.location.reload();
                    });
                    console.log('Loan amount updated successfully');
                    // Optionally, you can update the UI here after a successful update
                } else {
                    const responseData = await response.json(); // await the Promise here
                    swal.fire({
                        icon: 'info',
                        title: 'Notification',
                        text: responseData.message,
                    }).then(() => {
                        // Reload the page
                        window.location.reload();
                    });
                    console.error('Failed to update loan amount');
                }
            } catch (error) {
                console.error('Error updating loan amount:', error);
            }
        } else {
            // Show warning message for a negative amount
            swal.fire({
                title: 'Warning!',
                text: 'Entered amount cannot be negative',
                icon: 'warning',
                confirmButtonText: 'OK',
            });
        }
        // Reset the input field
        setExtraAmount('');
    };    

    useEffect(() => {
        if (!loan || loan.length === 0) {
            // Handle the case where loan is empty or undefined
            return;
        }
    
        // Check if date difference exceeds one month
        const currentDate = new Date();
        const loanDate = new Date(loan[0]?.dt); // Assuming loan[0] is the first loan in the list
        const differenceInMilliseconds = currentDate - loanDate;
        const differenceInDays = differenceInMilliseconds / (1000 * 3600 * 24);
        const differenceInMonths = differenceInDays / 30;
        const years = Math.floor(differenceInMilliseconds / (365 * 24 * 60 * 60 * 1000));
        const months = Math.floor((differenceInMilliseconds % (365 * 24 * 60 * 60 * 1000)) / (30 * 24 * 60 * 60 * 1000));
        const days = Math.floor((differenceInMilliseconds % (30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
        setTimeDifference(` ${years} years, ${months} months, ${days} days`);
        const amtt = parseFloat(loan[0].amt); // Assuming amt is a property of the loan object
        const int = parseFloat(loan[0].pawn_intrest); // Assuming pawn_intrest is a property of the loan object
        const totall = parseFloat(loan[0].tot_paid);

        if (differenceInDays < 15)
        {
            const days = 15;
            const intt = ((amtt * int * (days * 1.0139) * 12) / 36500).toFixed(0);
            setInt(intt);
            const tt = amtt + parseFloat(intt);
            const total_amt = tt - totall;
            console.log("13", totall);
            console.log(total_amt);
            setTotal(total_amt);
        }
        else
        {
            var timeDifference = Math.max(15.2085, years * 365 + months * 30.4171 + days * 1.0139);
            console.log(timeDifference);
            const intt = ((amtt * int * (timeDifference) * 12) / 36500).toFixed(0);
            setInt(intt);
            const tt = amtt + parseFloat(intt);
            const total_amt = tt - totall;
            console.log("13", totall);
            console.log(total_amt);
            setTotal(total_amt);
        }
    
        if (differenceInMonths > 1) {
            setDateDifferenceExceedsOneMonth(true);
        } else {
            setDateDifferenceExceedsOneMonth(false);
        }
    }, [loan]);

    const convertAmountToWords = (num) => {
        const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
        const convertLessThanOneThousand = (num) => {
          if (num === 0) return '';
          if (num < 10) return units[num];
          if (num < 20) return teens[num - 10];
          const unitDigit = num % 10;
          const tenDigit = Math.floor(num / 10) % 10;
          const hundredDigit = Math.floor(num / 100);
    
          let result = '';
    
          if (hundredDigit > 0) {
            result += `${units[hundredDigit]} Hundred `;
            if (num % 100 !== 0) {
              result += 'and ';
            }
          }
    
          if (tenDigit > 0) {
            result += `${tens[tenDigit]} `;
          }
    
          if (unitDigit > 0) {
            result += `${units[unitDigit]} `;
          }
    
          return result.trim();
        };
    
        const convertLessThanOneCrore = (num) => {
          if (num === 0) return 'Zero';
          const crore = Math.floor(num / 10000000);
          const remaining = num % 10000000;
          const lakh = Math.floor(remaining / 100000);
          const thousand = Math.floor((remaining % 100000) / 1000);
          const hundreds = remaining % 1000;
    
          let result = '';
    
          if (crore > 0) {
            result += `${convertLessThanOneThousand(crore)} Crore `;
          }
    
          if (lakh > 0) {
            result += `${convertLessThanOneThousand(lakh)} Lakh `;
          }
    
          if (thousand > 0) {
            result += `${convertLessThanOneThousand(thousand)} Thousand `;
          }
    
          if (hundreds > 0) {
            result += convertLessThanOneThousand(hundreds);
          }
    
          return result.trim();
        };
    
        return convertLessThanOneCrore(num);
      };

    return (
        <div className='bghome'>
            <Header />
            <Header1 />
            <div style={{zoom: 0.8}}>
                <div className='col-md-12 title'>
                    <FaMoneyBillWave className='mb-1' /> Extra Amount
                </div>
                <div className='col-md-11 le' style={{zoom: 0.9}}>
                    <div className='col-md-6 my-3 ms-5'>
                        <div className='col-md-12 d-flex'>
                            <div className='col-md-4'>
                                <label><b style={{fontWeight: '600', marginLeft: '15px'}}>Mode</b></label>
                                <select style={{ margin: '5px 5px', width: '85%', padding: '6px',borderRadius: '5px' }} value={searchMode} onChange={handleSearchModeChange}>
                                    <option value='' disabled>-- Select --</option>
                                    <option value='mob'>Mobile Number</option>
                                    <option value='glno'>Gl. Number</option>
                                    <option value='name'>Name</option>
                                </select>
                            </div>
                            <div className='col-md-4 text-center' style={{ marginTop: '2.1%' }}>
                                <input list='searchOptions' style={{ margin: '5px 5px', width: '90%', padding: '6px' }} onChange={(e) => setSelectedSearchOption(e.target.value)} className='inputstyle' />
                                <datalist id='searchOptions'>
                                    {searchOptions.map((option, index) => (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </datalist>
                            </div>
                            <div className='col-md-4 text-center' style={{ marginTop: '2.5%' }}>
                                <button className='btn btn-primary' onClick={handleSearchButtonClick}>
                                    Check Details
                                </button>
                            </div>
                        </div>
                        <div className={showDetails ? 'col-md-11' : 'dnone'} style={{fontSize: '18px'}}>
                            <table className='table table-bordered bg-light text-center m-3'>
                                <tbody>
                                    <tr>
                                        <td style={{backgroundColor: '#fff0', fontWeight: '400'}}>
                                            <b>L.N.TN-</b><span id="lnnoValue"></span>
                                        </td>
                                        <td style={{backgroundColor: '#fff0', fontWeight: '400'}}>
                                            <b>Off : </b><span id="omobValue"></span><br />
                                            <b>Mob : </b><span id="cmobValue"></span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{backgroundColor: '#fff0', fontWeight: '400'}} colSpan='2'>
                                            <b><span id="cnameValue"></span></b><br />
                                            <span id="caddrValue"></span>
                                        </td>
                                    </tr>
                                    <tr>
                                        {loan.map((Loan, index) => {
                                            const date = new Date(Loan.dt);
                                            const dateString = date.toLocaleDateString('en-GB'); // Adjust the locale as needed

                                            return (
                                                <React.Fragment key={index}>
                                                    <td key={`name_${index}`} style={{ backgroundColor: '#fff0', fontWeight: '400', verticalAlign: 'middle' }}>
                                                            <b>Name : </b>{Loan.nm} <span style={{ color: 'green', fontWeight: '700' }}>- {Loan.status.charAt(0).toUpperCase() + Loan.status.slice(1).toLowerCase()}</span>
                                                    </td>
                                                    <td key={`date_${index}`} style={{ backgroundColor: '#fff0', fontWeight: '400' }}>
                                                        <b>Date : </b>{dateString}<br />
                                                        <b>Gl.No : </b>{Loan.gl_no}
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}
                                    </tr>
                                    <tr>
                                    {loan.map((Loan, index) => {
                                        return (
                                            <React.Fragment key={index}>
                                                <td key={`name_${index}`} style={{ backgroundColor: '#fff0', fontWeight: '400' }}>
                                                    <b>Mobile : </b>{Loan.cust_mob}
                                                </td>
                                                <td key={`date_${index}`} style={{ backgroundColor: '#fff0', fontWeight: '400' }}>
                                                    <b>Place : </b>{Loan.place}
                                                </td>
                                            </React.Fragment>
                                        );
                                    })}
                                    </tr>
                                    <tr>
                                    {loan.map((Loan, index) => {
                                        return (
                                            <React.Fragment key={index}>
                                                <td key={`name_${index}`} style={{ backgroundColor: '#fff0', fontWeight: '400' }} colSpan='2' className='text-start'>
                                                    <b>Address of Pawner : </b>{Loan.addr}
                                                </td>
                                            </React.Fragment>
                                        );
                                    })}
                                    </tr>
                                    <tr>
                                    {loan.map((Loan, index) => {
                                        return (
                                            <React.Fragment key={index}>
                                                <td key={`name_${index}`} style={{ backgroundColor: '#fff0', fontWeight: '400' }} colSpan='2' className='text-start'>
                                                    <b>Amount : </b> 
                                                    <span style={{color: 'red', fontWeight: 'bolder'}}>
                                                        {Loan.amt} ({convertAmountToWords(Loan.amt)} Only /-)
                                                    </span>
                                                </td>
                                            </React.Fragment>
                                        );
                                    })}
                                    </tr>
                                        <tr>
                                            <td style={{ backgroundColor: '#fff0', fontWeight: '400' }} colSpan='2' className='text-start'>
                                                <b>Details of Articles : </b> 
                                                <span style={{color: 'red', fontWeight: 'bolder'}}>
                                                    {content}
                                                </span>
                                            </td>
                                        </tr>
                                    <tr>
                                    {loan.map((Loan, index) => {
                                        return (
                                            <React.Fragment key={index}>
                                                <td key={`name_${index}`} style={{ backgroundColor: '#fff0', fontWeight: '400' }} colSpan='2' className='text-start'>
                                                    <b>Weight : </b> 
                                                    <span style={{color: 'red', fontWeight: 'bolder'}}>
                                                        {Loan.weight} gm
                                                    </span>
                                                </td>
                                            </React.Fragment>
                                        );
                                    })}
                                    </tr>
                                    <tr>
                                    {loan.map((Loan, index) => {
                                        return (
                                            <React.Fragment key={index}>
                                                <td key={`name_${index}`} style={{ backgroundColor: '#fff0', fontWeight: '400' }} colSpan='2' className='text-start'>
                                                    <b>Approximate value : </b> 
                                                    <span style={{color: 'red', fontWeight: 'bolder'}}>
                                                        {Loan.aprox_value}
                                                    </span>
                                                </td>
                                            </React.Fragment>
                                        );
                                    })}
                                    </tr>
                                    <tr>
                                        <td className='text-start' style={{ backgroundColor: '#fff0',fontSize: '17px' }}>
                                            <b>(P.T.O)</b>
                                        </td>
                                        <td className='text-start' style={{ backgroundColor: '#fff0',fontSize: '17px' }}>
                                            <b>Manager</b>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <span className={showDetails ? 'col-md-12' : 'dnone'} style={{fontSize: '20px',fontWeight: '900',marginLeft: '300px'}}>Calculation</span>
                        <div className={showDetails ? 'col-md-11 mb-5' : 'dnone'} style={{fontSize: '18px'}}>
                            <table className='table table-bordered bg-light text-center m-3'>
                                <tbody>
                                    <tr>
                                        {loan.map((Loan, index) => {
                                            return (
                                                <React.Fragment key={index}>
                                                    <td key={`name_${index}`} style={{ backgroundColor: '#fff0', fontWeight: '400' }} colSpan='2' className='text-center'>
                                                        <b>Amount : </b> 
                                                        <span style={{color: 'blue', fontWeight: 'bolder'}}>
                                                            Rs. {Loan.amt}
                                                        </span>&nbsp;&nbsp;
                                                        <b>Interest : </b> 
                                                        <span style={{color: 'blue', fontWeight: 'bolder'}}>
                                                            {Loan.pawn_intrest}%
                                                        </span>
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}
                                    </tr>
                                    <tr>
                                        <th style={{ backgroundColor: '#fff0', fontWeight: '400', fontSize: '18px' }} className='text-start'>
                                            <b>Time Period</b>
                                        </th>
                                        <th style={{ backgroundColor: '#fff0', fontWeight: '400', fontSize: '18px' }} className='text-start'>
                                            <b>Total Amount</b>
                                        </th>
                                    </tr>
                                    <tr>
                                        <td style={{ backgroundColor: '#fff0', fontWeight: 'bolder', fontSize: '18px' }} className='text-start'>
                                            1 year
                                        </td>
                                        {loan.map((Loan, index) => {
                                            return (
                                                <React.Fragment key={index}>
                                                    <td key={`name_${index}`} style={{ backgroundColor: '#fff0', fontWeight: '600' }} className='text-start'> 
                                                        <span>
                                                            {Loan.one_yr_amt}
                                                        </span>
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}
                                    </tr>
                                    <tr>
                                        <td style={{ backgroundColor: '#fff0', fontWeight: 'bolder', fontSize: '18px' }} className='text-start'>
                                            1 month
                                        </td>
                                        {loan.map((Loan, index) => {
                                            return (
                                                <React.Fragment key={index}>
                                                    <td key={`name_${index}`} style={{ backgroundColor: '#fff0', fontWeight: '600' }} className='text-start'> 
                                                        <span>
                                                            {Loan.one_mnth_amt}
                                                        </span>
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}
                                    </tr>
                                    <tr>
                                        <td style={{ backgroundColor: '#fff0', fontWeight: 'bolder', fontSize: '18px' }} className='text-start'>
                                            1 day
                                        </td>
                                        {loan.map((Loan, index) => {
                                            return (
                                                <React.Fragment key={index}>
                                                    <td key={`name_${index}`} style={{ backgroundColor: '#fff0', fontWeight: '600' }} className='text-start'> 
                                                        <span>
                                                            {Loan.one_day_amt}
                                                        </span>
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}
                                    </tr>
                                    <tr>
                                        <td style={{ backgroundColor: '#fff0', fontWeight: 'bolder', fontSize: '18px' }} className='text-start'>
                                            Min - 15 day
                                        </td>
                                        {loan.map((Loan, index) => {
                                            return (
                                                <React.Fragment key={index}>
                                                    <td key={`name_${index}`} style={{ backgroundColor: '#fff0', fontWeight: '600' }} className='text-start'> 
                                                        <span>
                                                            {Loan.seven_day_amt}
                                                        </span>
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className='col-md-6 my-3 me-5'>
                        <div className={showDetails ? 'col-md-12 d-flex' : 'dnone'}>
                            <div className='col-md-4 text-start'>
                                <span>Enter Extra Amount</span>
                                <input type='text' style={{ margin: '5px 5px', width: '90%', padding: '6px' }} onChange={(e) => handleNumberInput1({ target: { name: 'amount', value: e.target.value } })} disabled={dateDifferenceExceedsOneMonth} />
                            </div>
                            <div className='col-md-4 text-center' style={{ marginTop: '2.5%' }}>
                                <button className='btn btn-primary' onClick={handleGiveNow}>
                                    Give Now
                                </button>
                            </div>
                        </div>
                        <div className={dateDifferenceExceedsOneMonth ? 'col-md-11 text-Start mt-3' : 'dnone'}>
                            <span style={{ color: 'red', fontWeight: 'bold' }}>Too Late, One month Exceeded, Not Eligible for Extra Amount</span>
                        </div>
                        
                        <div style={{color: 'red', backgroundColor: 'white', fontSize: '20px', border: '4px solid', borderColor: '#EF0107', borderRadius: '9px'}} className={showDetails ? 'col-md-10 d-flex m-3 py-2 ps-2' : 'dnone'}>
                            {totamt !== 0 ? (
                                <>
                                    <span className={showDetails ? 'col-md-4 text-start' : 'dnone'} style={{whiteSpace: 'nowrap'}}>{timeDifference}</span>
                                    <span className={showDetails ? 'col-md-2 text-center' : 'dnone'}>interest: {int}</span>
                                    <span className={showDetails ? 'col-md-3 text-center' : 'dnone'}>Total Paid: {totamt}</span>
                                    <span className={showDetails ? 'col-md-3 text-center' : 'dnone'}>Total due: {total}</span>
                                </>
                            ) : (
                                <>
                                    <span className={showDetails ? 'col-md-4 text-start' : 'dnone'}>{timeDifference}</span>
                                    <span className={showDetails ? 'col-md-4 text-center' : 'dnone'}>interest: {int}</span>
                                    <span className={showDetails ? 'col-md-4 text-center' : 'dnone'}>Total due: {total}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className='fixed-bottom'>
            <Footer />
            </div>
        </div>
    );
}

export default Examt;