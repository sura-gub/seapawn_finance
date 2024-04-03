import React, { useEffect, useState } from 'react';
import Header from './header';
import Header1 from './header1';
import Footer from './footer';
import { FaBook } from "react-icons/fa";
import { CiViewList } from "react-icons/ci";
import Popup from './Popup';
import print from './../img/print.svg';
import Swal from 'sweetalert2';
import API from '../api/API';  // Import the new api.js

function Voucher() {
    const [currentYear, setCurrentYear] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [loan, setLoan] = useState([]);
    const [balance, setBalance] = useState([]);
    const [incomeItems, setIncomeItems] = useState([]);
    const [expenseItems, setExpenseItems] = useState([]);
    const [filterValue, setFilterValue] = useState('all');
    const [closingBalance, setClosingBalance] = useState(0);
    const [payy, setPayy] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    // const [key,setKey] = useState([]);
    const [inc,setInc] = useState([]);

    const handlePopupClose = () => {
        setShowPopup(false);
    };
    
    // Function to generate options for months
    const generateMonthOptions = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return (
            <>
                <option value={selectedMonth}>Month</option>
                {months.map((month, index) => (
                    <option key={month} value={(index + 1).toString().padStart(2, '0')}>
                        {month}
                    </option>
                ))}
            </>
        );
    };

    // Function to generate options for years
    const generateYearOptions = () => {
        const years = [];
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= 2020; year--) {
            years.push(year);
        }
        return years.map((year) => (
            <option key={year} value={year}>{year}</option>
        ));
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
        
    }, []);

    const handleYearChange = (e) => {
        setCurrentYear(e.target.value);
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    // Function to handle filter change
    const handleFilterChange = (e) => {
        setFilterValue(e.target.value);
    };

    const handleViewDailyDiary = async () => {
        try {
            const response = await fetch(`${API.getIE}?date=${selectedDate}`);
            if (response.ok) {
                const loanData = await response.json();
                // Ensure that bill_no is parsed as integers for proper sorting
                loanData.forEach(loanItem => {
                    loanItem.bill_no = parseInt(loanItem.bill_no);
                    const date = new Date(loanItem.bill_dt);
                    loanItem.dateString = date.toLocaleDateString('en-GB');
                });
                // Sort loanData by doc_no in ascending order
                loanData.sort((a, b) => a.bill_no - b.bill_no);
                setLoan(loanData);
                // console.log(loanData);
            } else {
                console.error('Failed to fetch loan');
            }
        } catch (error) {
            console.error('Error fetching loan:', error);
        }
    };

    useEffect(() => {
        const fetchLoan = async () => {
            try {
                const response = await fetch(`${API.getIE}?year=${currentYear}&month=${selectedMonth}`);
                if (response.ok) {
                    const loanData = await response.json();
                    // Ensure that bill_no is parsed as integers for proper sorting
                    loanData.forEach(loanItem => {
                        loanItem.bill_no = parseInt(loanItem.bill_no);
                        const date = new Date(loanItem.bill_dt);
                        loanItem.dateString = date.toLocaleDateString('en-GB');
                    });
                    // Sort loanData by doc_no in ascending order
                    loanData.sort((a, b) => a.bill_no - b.bill_no);
                    setLoan(loanData);
                    // const newKeys = loanData.map(item => item.bill_no);
                    // setKey(newKeys);
                    // console.log("key", newKeys);
                    // console.log(loanData);
                } else {
                    console.error('Failed to fetch loan');
                }
            } catch (error) {
                console.error('Error fetching loan:', error);
            }
        };

        const handleOpenBalance = async () => {
            try {
                const response = await fetch(`${API.getOB}?date=${selectedMonth}`);
                if (response.ok) {
                    const balanceData = await response.json();
                    setBalance(balanceData);
                    // console.log("2",balanceData);
                } else {
                    console.error('Failed to fetch loan');
                }
            } catch (error) {
                console.error('Error fetching loan:', error);
            }
        };
    
        fetchLoan();
        handleOpenBalance();
    }, [currentYear, selectedMonth]);

    // Helper function to get the month name from its value
    const getMonthName = (monthValue) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[parseInt(monthValue) - 1];
    };

    useEffect(() => {
        // Split loan data into income and expense items
        const income = [];
        const expense = [];
        loan.forEach(loanItem => {
            if (loanItem.bill_kind === 'inc') {
                income.push(loanItem);
            } else if (loanItem.bill_kind === 'exp') {
                expense.push(loanItem);
            }
        });
        setIncomeItems(income);
        setExpenseItems(expense);
    }, [loan]);

    useEffect(() => {
        // Function to get current year
        const getCurrentYear = () => {
            return new Date().getFullYear();
        };

        // Function to get current month
        const getCurrentMonth = () => {
            return new Date().getMonth() + 1; // Months are zero-based
        };

        // Check if currentYear and selectedMonth are already in sessionStorage
        const storedYear = sessionStorage.getItem('currentYear');
        const storedMonth = sessionStorage.getItem('selectedMonth');

        setCurrentYear(storedYear || getCurrentYear().toString());
        setSelectedMonth(storedMonth || getCurrentMonth().toString());
    }, []);

    // Store currentYear and selectedMonth in sessionStorage
    useEffect(() => {
        sessionStorage.setItem('currentYear', currentYear);
        sessionStorage.setItem('selectedMonth', selectedMonth);
    }, [currentYear, selectedMonth]);

    // Merge income and expense items into a single array
    const mergedItems = [...incomeItems, ...expenseItems];

    // Filter items based on the selected filter value
    const filteredItems = filterValue === 'all' ? mergedItems :
                         filterValue === 'inc' ? incomeItems :
                         expenseItems;

    // Sort the filtered array by bill_no
    filteredItems.sort((a, b) => a.bill_no - b.bill_no);

    const calculateTotal = (type) => {
        let total = 0;
        if (type === 'inc') {
            incomeItems.forEach(item => {
                total += item.bill_kind === 'inc' ? item.tot_amt : 0;
            });
        } else if (type === 'exp') {
            expenseItems.forEach(item => {
                total += item.bill_kind === 'exp' ? item.tot_amt : 0;
            });
        }
        return total;
    };    

    const profitOrLoss = calculateTotal('inc') - calculateTotal('exp');
    // console.log('Profit or Loss:', profitOrLoss);

    useEffect(() => {
        const calculatedClosingBalance = balance.length > 0 ? balance.reduce((acc, cur) => acc + cur.amt, 0) + profitOrLoss : profitOrLoss;
        setClosingBalance(calculatedClosingBalance);
    }, [balance, profitOrLoss]);

    const handleProceedNextMonth = async () => {
        try {
            const response = await fetch(API.saveClosingBalance, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: selectedMonth, // You may need to adjust this based on your server expectations
                    closingBalance,
                }),
            });
    
            if (response.ok) {
                console.log('Closing balance saved successfully');
                Swal.fire({
                    title: 'Success!',
                    text: 'Closing balance saved successfully', // Assuming the server sends a 'message' field in the response
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Reload the page
                    window.location.reload();
                });
            } else {
                console.error('Failed to save closing balance');
                // Optionally, you can add logic here to handle failed save
            }
        } catch (error) {
            console.error('Error saving closing balance:', error);
            // Optionally, you can add logic here to handle errors
        }
    };    

    const handleViewDetails = async (billNo) => {
        try {
            // Fetch details from the 'loan' table
            const IEResponse = await fetch(`${API.getIncDetails}?billNo=${billNo}`);
            const billResponse = await fetch(`${API.getBillDetails}?billNo=${billNo}`);
    
            if (IEResponse.ok && billResponse.ok) {
                // Corrected variable names here
                const IEDetails = await IEResponse.json();
                const billDetails = await billResponse.json();
    
                // Assuming loanDetails and payyDetails are arrays
                setInc(IEDetails);
                setPayy(billDetails);
    
                setShowPopup(true);
                console.log('Inc Details:', IEDetails);
                console.log('Bill Details:', billDetails);
                console.log('Inc:', inc);
            } else {
                console.error('Failed to fetch details');
            }
        } catch (error) {
            console.error('Error fetching details:', error);
        }
    };
    
const fetchCompanyDetails = async () => {
    try {
        const response = await fetch(API.getCompanyDetails);
        const result = await response.json();

        if (result.message === 'Company details retrieved successfully') {
            const newCompanyDetails = result.data;

            // Check if the elements exist before setting innerText
            if (document.getElementById('omobValue')) {
                document.getElementById('omobValue').innerText = newCompanyDetails.omob || '';
            }
            if (document.getElementById('cmobValue')) {
                document.getElementById('cmobValue').innerText = newCompanyDetails.cmob || '';
            }
            if (document.getElementById('lnnoValue')) {
                document.getElementById('lnnoValue').innerText = newCompanyDetails.lnno || '';
            }
            if (document.getElementById('cnameValue')) {
                document.getElementById('cnameValue').innerText = newCompanyDetails.cname || '';
            }
            if (document.getElementById('caddrValue')) {
                document.getElementById('caddrValue').innerText = newCompanyDetails.caddr || '';
            }
        } else {
            console.log('Error retrieving company details:', result.error);
        }

        return result; // Return the result for further handling if needed
    } catch (error) {
        console.error('Error fetching company details:', error);
        return { message: 'Error fetching company details', error };
    }
};

const handlePrintVoucher = async (item) => {
    try {
        // Fetch details from the 'loan' table
        const IEResponse = await fetch(`${API.getIncDetails}?billNo=${item.bill_no}`);
        const billResponse = await fetch(`${API.getBillDetails}?billNo=${item.bill_no}`);
        const result = await fetchCompanyDetails();

        if (IEResponse.ok && billResponse.ok && result.message === 'Company details retrieved successfully') {
            // Corrected variable names here
            const IEDetails = await IEResponse.json();
            const billDetails = await billResponse.json();

            // Assuming loanDetails and payyDetails are arrays
            setInc(IEDetails);
            setPayy(billDetails);

            // Construct HTML content for printing
            const htmlContent = `
                <html>
                    <head>
                        <title>Voucher Details</title>
                        <style>
                            /* Add any additional styling for the printed content */
                            body {
                                font-family: Consolas, "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", Monaco, "Courier New", monospace;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-bottom: 20px;
                            }
                            th {
                                padding-top: 12px;
                                padding-bottom: 12px;
                                text-align: left;
                                background-color: #fed1c4;
                                color: #000;
                                font-weight:bold;
                            }

                            label {
                                font-weight:bold;
                                font-size:20px;
                            }

                            td {
                                border: 1px solid #ddd;
                                padding: 8px;
                            }
                        </style>
                    </head>
                    <body>
                        <table width="100%" style="background-color:#fed1c447" border="1">
                            <tbody>
                                <tr>
                                    <td colspan="2" style="border:none"><center><b style="font-size:22px">${result.data.cname}</b><br>${result.data.caddr}</center></td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="border:none"><center><b style="border:thin solid #ccc;padding:4px;border-radius:5px;background-color:#ccc3;">CASH VOUCHER</b><hr></center></td>
                                </tr>
                                <tr>
                                    <td style="border:none"><label style="border:thin solid;padding:6px">BILL.No : ${item.bill_no}</label></td>
                                    <td style="border:none;text-align:right"><label>Bill Date :</label> <b style="border-bottom:dotted thin">${item.dateString}</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="border:none;white-space:nowrap"><label> Purpose :</label> <span style="border-bottom:dotted thin;padding-right:50%">${item.bill_title}</span></td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="border:none"><label>Rupees in Words  </label>  <b style="border-bottom:dotted thin"> ${convertAmountToWords(item.tot_amt)} &nbsp;</b><label> received. </label></td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="border:none"><label style="border:thin solid;padding:6px">Rs. ${item.tot_amt}</label></td>
                                </tr>
                                
                                
                                <tr>
                                    <td colspan="2" style="text-align:right;border:none"><label>Signature of recipient : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label></td>
                                </tr>
                                <tr>
                                    ${payy.map((Pay) => `
                                        <td colspan="2" style="text-align:left;border:none">Details of recipient :  <b style="border-bottom:dotted thin">${Pay.item_nm}</b></td> 
                                    `).join('')}
                                </tr>
                                <tr>
                                    <td style="border:none"><label>CLERK</label></td>
                                    <td align="right" style="border:none"><label>MANAGER</label></td>
                                </tr>
                                <tr>
                                    <td style="border:none"><label>&nbsp;&nbsp;&nbsp;</label></td>
                                    <td align="right" style="border:none"><label>&nbsp;&nbsp;&nbsp;</label></td>
                                </tr>
                            </tbody>
                        </table>
                    </body>
                </html>
            `;

            // Open the print window and write the HTML content
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                printWindow.print();
                printWindow.close(); // Close the print window after printing
            }
        } else {
            console.error('Failed to fetch details');
        }
    } catch (error) {
        console.error('Error fetching details:', error);
    }
};

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
            <div style={{zoom: '0.8'}}>                
                <div className='col-md-12 title'>
                    <FaBook className='mb-1' /> INCOME-EXPENSE DAILY DIARY
                </div>
                <div className='col-md-12 d-flex' style={{zoom: 0.9}}>
                    <div className='col-md-3 my-2 text-end'></div>
                    <div className='col-md-4x my-2 ms-5 me-1 text-end'>
                        <div className='col-md-11 d-flex'>
                            <div className='col-md-4'>
                                <select style={{ margin: '5px 5px', width: '80%', fontSize: '19px' }} value={filterValue} onChange={handleFilterChange}>
                                    <option value='all'>All</option>
                                    <option value='inc'>Income</option>
                                    <option value='exp'>Expense</option>
                                </select>
                            </div>
                            <div className='col-md-4'>
                                <select style={{ margin: '5px 5px', width: '80%', fontSize: '19px' }} value={currentYear} onChange={handleYearChange} >
                                    {generateYearOptions()}
                                </select>
                            </div>
                            <div className='col-md-4'>
                                <select style={{ margin: '5px 5px', width: '80%', fontSize: '19px' }} value={selectedMonth} onChange={handleMonthChange} >
                                    {generateMonthOptions()}
                                </select>
                            </div>
                            {/* <div className='col-md-3'>
                                <button className='btn btn-primary mt-1 ms-4' style={{fontSize: '19px', whiteSpace: 'nowrap'}}>View Monthly Diary</button>
                            </div> */}
                        </div>
                    </div>
                    <div className='col-md-4 my-3 ms-5 me-1 text-end'></div>
                </div>
                <div className='col-md-11 d-flex' style={{zoom: 0.9}}>
                    <div className='col-md-4'></div>
                    <div className='col-md-4 ms-5'>
                        <div className='col-md-10 d-flex ms-2'>
                            <div className='col-md-5'>
                                <input type='date' style={{ margin: '5px 5px', width: '90%', padding: '7px', fontSize: '19px' }} value={selectedDate} onChange={handleDateChange} />
                            </div>
                            <div className='col-md-5'>
                                <button className='btn btn-primary mt-1 ms-2' style={{fontSize: '19px', whiteSpace: 'nowrap'}} onClick={handleViewDailyDiary}>View Daily Diary</button>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-4'></div>
                </div>
                <div className='col-md-11 mt-1' style={{zoom: 0.9, display: 'flex', justifyContent: 'center'}}>
                    <div style={{fontSize: '27px', fontWeight: '600'}}>
                        Diary : {currentYear} - {getMonthName(selectedMonth)}
                    </div>
                </div>
                <div className='col-md-10' style={{zoom: '1', marginLeft: '4%'}}>
                    <div className='text-end' style={{marginRight: '7%', fontSize: '20px'}}>Opening Balance : {balance.length > 0 ? balance.reduce((acc, cur) => acc + cur.amt, 0) : '0'}</div>
                    <table className = 'of votbl table table-bordered bg-light' style={{margin: '0px 5px 0px 6px'}}>
                        <thead>
                            <tr className='text-center'>
                                <th style={{backgroundColor: '#fff0', fontSize: '21px',borderBottom: 'none' }}>Date</th>
                                <th style={{backgroundColor: '#fff0', fontSize: '21px',borderBottom: 'none' }}>Doc.No</th>
                                <th style={{backgroundColor: '#fff0', fontSize: '21px',borderBottom: 'none' }}>Narration</th>
                                <th style={{backgroundColor: '#fff0', fontSize: '21px',borderBottom: 'none' }}>Income</th>
                                <th style={{backgroundColor: '#fff0', fontSize: '21px',borderBottom: 'none' }}>Expense</th>
                                <th style={{backgroundColor: '#fff0', fontSize: '21px',borderBottom: 'none' }}>View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Render filtered items */}
                            {filteredItems.map((item, index) => (
                                <tr key={index} className='text-center'>
                                    <td style={{ backgroundColor: '#fff0', fontWeight: '400',borderBottom: 'none' }}>{item.dateString}</td>
                                    <td style={{ backgroundColor: '#fff0', fontWeight: '400',borderBottom: 'none' }}>{item.bill_no}</td>
                                    <td style={{ backgroundColor: '#fff0', fontWeight: '400', whiteSpace: 'nowrap',borderBottom: 'none' }}>{item.bill_title}</td>
                                    <td style={{ backgroundColor: '#fff0', fontWeight: '400',borderBottom: 'none' }}>{item.bill_kind === 'inc' ? item.tot_amt : ''}</td>
                                    <td style={{ backgroundColor: '#fff0', fontWeight: '400',borderBottom: 'none' }}>{item.bill_kind === 'exp' ? item.tot_amt : ''}</td>
                                    <td style={{ backgroundColor: '#fff0', fontWeight: '400',borderBottom: 'none' }}><CiViewList size={28} onClick={() => handleViewDetails(item.bill_no)} />{item.bill_typ === 'voucher' && (
                                        <>
                                            <span
                                                style={{ marginLeft: '45px', fontSize: '18px', cursor: 'pointer' }}
                                                onClick={() => handlePrintVoucher(item)}
                                            >
                                                <img src={print} alt='' width={'30px'} height={'28px'} />
                                            </span>
                                        </>
                                    )}</td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan='3' className='text-end' style={{ backgroundColor: '#fff0', fontWeight: '400', fontSize: '21px',borderBottom: 'none', verticalAlign: 'middle' }}><b>Total</b></td>
                                <td style={{ backgroundColor: '#fff0', fontWeight: '600', verticalAlign: 'middle',borderBottom: 'none' }} className='text-center'>{calculateTotal('inc')}</td>
                                <td style={{ backgroundColor: '#fff0', fontWeight: '600', verticalAlign: 'middle',borderBottom: 'none' }} className='text-center'>{calculateTotal('exp')}</td>
                                <td style={{ backgroundColor: '#fff0', fontWeight: '600', verticalAlign: 'middle',borderBottom: 'none' }} className='text-center'>
                                    {profitOrLoss < 0 ? ( 
                                        <>
                                            <div className='mb-1'>Profit = 0 </div>
                                            <div className='mt-1'>Loss = {Math.abs(profitOrLoss)}</div>
                                        </>
                                    ) : (
                                        <>
                                            Profit = {profitOrLoss} <br /> Loss = 0
                                        </>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan='6' style={{ backgroundColor: '#fff0', fontWeight: '600', verticalAlign: 'middle', borderBottom: 'none' }} className='text-end'>
                                    {balance.length > 0 ? (
                                        <>
                                            Closing Balance = {balance.reduce((acc, cur) => acc + cur.amt, 0) + profitOrLoss}
                                            <button className='btn btn-primary ms-3' onClick={handleProceedNextMonth}> Click here to Proceed next month Opening Balance </button>
                                        </>
                                    ) : (
                                        <>
                                            Closing Balance = {0 + profitOrLoss}
                                            <button className='btn btn-primary ms-3' onClick={handleProceedNextMonth}> Click here to Proceed next month Opening Balance </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='fixed-bottom'>
            <Footer />
            </div>
            {showPopup && (
                <Popup onClose={handlePopupClose}>
                    <div className='mb-2 modal-header1'>
                        <button onClick={handlePopupClose} className='btn' style={{ position: 'relative', left: '45%' }}> X </button>
                    </div>
                    <div className='col-md-10' style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>
                        {inc.map((incItem, index) => (
                            <React.Fragment key={index}>
                                <div className='ms-4'>
                                    <b>{incItem.bill_title}, Doc.No - {incItem.bill_no}</b>
                                </div>
                            </React.Fragment>
                        ))}
                        {Array.isArray(payy) && (
                            <table className='table table-bordered border-dark text-center m-3'>
                                <tbody>
                                    <tr>
                                        <td style={{ backgroundColor: '#fff0', fontWeight: '400' }}><b>Si.no</b></td>
                                        <td style={{ backgroundColor: '#fff0', fontWeight: '400' }}><b>Item</b></td>
                                        <td style={{ backgroundColor: '#fff0', fontWeight: '400' }}><b>Amount</b></td>
                                        <td style={{ backgroundColor: '#fff0', fontWeight: '400' }}><b>Qty</b></td>
                                        <td style={{ backgroundColor: '#fff0', fontWeight: '400' }}><b>Tot</b></td>
                                    </tr>
                                    {/* Map over payy and render rows */}
                                    {payy.map((Pay, index) => (
                                        <React.Fragment key={index}>
                                            <tr>
                                                <td style={{ backgroundColor: '#fff0', fontWeight: '400' }}>{index + 1}</td>
                                                <td style={{ backgroundColor: '#fff0', fontWeight: '400' }}>{Pay.item_nm}</td>
                                                <td style={{ backgroundColor: '#fff0', fontWeight: '400' }}>{Pay.amt}</td>
                                                <td style={{ backgroundColor: '#fff0', fontWeight: '400' }}>{Pay.qty}</td>
                                                <td style={{ backgroundColor: '#fff0', fontWeight: '400' }}>{Pay.qty_amt}</td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                    <tr>
                                        <td colSpan='4' className='text-end' style={{ backgroundColor: '#fff0', fontWeight: '400' }}>Total</td>
                                        <td style={{ backgroundColor: '#fff0', fontWeight: '400' }}>{payy.reduce((acc, cur) => acc + cur.qty_amt, 0)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>
                </Popup>
            )}
        </div>
    );
}

export default Voucher;