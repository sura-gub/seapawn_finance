import React, { useState, useEffect } from 'react';
import Header from './header';
import Header1 from './header1';
import Footer from './footer';
import { FaTicket } from "react-icons/fa6";
import { LuPlusCircle } from "react-icons/lu";
import swal from 'sweetalert2';
import print from './../img/print.svg';
import API from '../api/API';  // Import the new api.js

function ApplyLoan() {

    const [articles, setArticles] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');
    const [loan, setLoan] = useState([]);
    const [contentList, setContentList] = useState([]);
    const [namee, setNamee] = useState('');
    const [glno, setGlno] = useState('');
    const [mob, setMob] = useState('');
    const [date, setDate] = useState('');
    const [amt, setAmt] = useState('');
    const [pagree, setPagree] = useState('');
    const [place, setPlace] = useState('');
    const [address, setAddress] = useState('');
    const [weight, setWeight] = useState('');
    const [artt, setArtt] = useState('');
    const [content, setContent] = useState('');
    const [count, setCount] = useState('');
    const [c1, setC1] = useState('');
    const [c2, setC2] = useState('');
    const [c3, setC3] = useState('');
    const [c4, setC4] = useState('');
    const [c5, setC5] = useState('');
    const [formData, setFormData] = useState({
        glNo: '',
        date: '',
        name: '',
        place: '',
        address: '',
        postOffice: '',
        pincode: '',
        articlesDetails: '',
        weight: '',
        amount: '',
        monthlyInterest: '',
        aadharNumber: '',
        mobileNumber: '',
        nominee: '',
        status: 'active',
        period_agree: '3',
        third_mnth_interest_per_mnth: '1.4',
        third_mnth_interest_yes_or_no: 'no',
        kootuvatti_yes_or_no: 'no',
        koottuvatti_intrest: '0',
        nomineeRelationship: '',
        cname: '',
        lnno: '',
        omob: '',
        brch_id: ''
    });

    const handleAddContent = () => {
      setContentList([...contentList, { id: contentList.length }]);
    };
  
    const handleDeleteContent = (id) => {
      const updatedContentList = contentList.filter((item) => item.id !== id);
      setContentList(updatedContentList);
    };

    useEffect(() => {
        // Check if username and password are present in session storage
        const username = sessionStorage.getItem('username');
        const password = sessionStorage.getItem('password');
        const brch_id = sessionStorage.getItem('brch_id');
    
        if (!username || !password) {
            // Redirect to login.js if username or password is missing
            window.location.href = '/';
        }

        setFormData(prevFormData => ({
            ...prevFormData,
            brch_id: brch_id,
        }));
    
        // Fetch the last gl_no from the server when the component mounts
        const fetchGlNo = async () => {
            try {
                const response = await fetch(API.getLastGlNo);
                if (!response.ok) {
                    console.error(`Error fetching last gl_no: ${response.status}`);
                    console.error(await response.text());
                    return;
                }
    
                const data = await response.json();
                const lastGlNo = data.lastGlNo || 0;
    
                // If there are no rows, set a default serial number, otherwise, extract serial number
                const serialNumber = lastGlNo === 0 ? 1 : extractSerialNumber(lastGlNo) + 1;
                // console.log(serialNumber);
    
                // Create the new gl_no with the current year and serial number
                const currentYear = new Date().getFullYear().toString().slice(-4);
                const newGlNo = `${padWithZero(serialNumber)}/${currentYear}`;
    
                // Use the callback form of setFormData to ensure correct state update
                setFormData(prevFormData => ({
                    ...prevFormData,
                    glNo: newGlNo,
                }));
            } catch (error) {
                console.error('Error fetching last gl_no:', error);
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
                     // Update state with the retrieved data
                            setFormData(prevFormData => ({
                                ...prevFormData,
                                cname: newCompanyDetails.cname || '',
                                omob: newCompanyDetails.omob || '',
                                lnno: newCompanyDetails.lnno || '',
                            }));
                            setC1(newCompanyDetails.cname);
                            setC2(newCompanyDetails.caddr);
                            setC3(newCompanyDetails.lnno);
                            setC4(newCompanyDetails.cmob);
                            setC5(newCompanyDetails.omob);
                } else {
                    console.log('Error retrieving company details:', result.error);
                }
        
                return result; // Return the result for further handling if needed
            } catch (error) {
                console.error('Error fetching company details:', error);
                return { message: 'Error fetching company details', error };
            }
        };
        
        const fetchLoan = async () => {
            try {
              const response = await fetch(API.getLoan);
              if (response.ok) {
                const loanArray = await response.json();
                setLoan(loanArray);

                // Check if the array is not empty
                if (loanArray.length > 0) {;
                    const loanData = loanArray[0]; 
                    const date = new Date(loanData.dt);
                    loanData.dateString = date.toLocaleDateString('en-GB')       
                    setShowPopup(true);
                    setAmt(loanData.amt);
                    setDate(loanData.dateString);
                    setGlno(loanData.gl_no);
                    setMob(loanData.cust_mob);
                    setNamee(loanData.nm);
                    setPagree(loanData.period_agree);
                    setPlace(loanData.place);
                    setAddress(loanData.addr);
                    setWeight(loanData.weight);
                    await fetchArtBySearch(loanData.id);
                    await fetchPicBySearch(loanData.id);
                } else {
                    console.error('Empty loan data array');
                }
              } else {
                console.error('Failed to fetch loan');
              }
            } catch (error) {
              console.error('Error fetching loan:', error);
            }
          };
    
        fetchGlNo();
        fetchCompanyDetails();
        fetchArticles();
        fetchLoan();
    }, []);
      
      const extractSerialNumber = (glNo) => {
        // Assuming glNo has a format like '01/2024' where '01' is the serial number and '2024' is the year
        return parseInt(glNo.split('/')[0], 10);
      };
      
      const padWithZero = (number) => {
        // Pad the number with zero if it's a single digit
        return number.toString().padStart(2, '0');
      };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleNumberInput1 = (e) => {
        const { name, value } = e.target;
        const isValidInput = /^[0-9]*\.?[0-9]*$/.test(value);
    
        if (isValidInput) {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = async () => {
        const articles1 = contentList.map(content => ({
            name: formData[`addjewels_${content.id}`]
        }));
    
        const articles2 = contentList.map(content => ({
            weight: formData[`weight_${content.id}`]
        }));
    
        // Check if articles1 and articles2 have any values
        const hasArticles = articles1.some(article => article.name) || articles2.some(article => article.weight);
    
        const requiredFields = ['date', 'name', 'place', 'address', 'postOffice', 'pincode', 'articlesDetails', 'weight', 'amount', 'monthlyInterest', 'aadharNumber', 'mobileNumber', 'nominee', 'nomineeRelationship'];
        const validationErrors = [];

        const isAnyFieldEmpty = requiredFields.some(field => {
        const fieldValue = formData[field];

        // Custom validation for name and nominee (no numbers allowed)
        if (['name', 'nominee', 'postOffice', 'place'].includes(field)) {
            if (/[^a-zA-Z]/.test(fieldValue)) {
                validationErrors.push(`${field} cannot have special characters or numbers.`);
                return true;
            }
        }

        // Custom validation for mobile number (10 digits starting from 6-9)
        if (field === 'mobileNumber') {
            if (!/^[6-9]\d{9}$/.test(fieldValue)) {
                validationErrors.push(`${field} should be a 10-digit number starting from 6-9.`);
                return true;
            }
        }

        // Custom validation for Aadhar number (only 12 digits numbers)
        if (field === 'aadharNumber') {
            if (!/^\d{12}$/.test(fieldValue)) {
                validationErrors.push(`${field} should be a 12-digit number.`);
                return true;
            }
        }

        // Default validation for other fields (empty check)
        if (!fieldValue) {
            validationErrors.push(`All values needed to store the loan entry.`);
            return true;
        }

        return false;
    });

    if (isAnyFieldEmpty) {
        // Show error notifications for each validation error
        validationErrors.forEach(error => {
            swal.fire({
                title: 'Error!',
                text: error,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });
        return; // Stop further execution if any field is empty or invalid
    }
    
        if (!hasArticles) {
            // If articles1 and articles2 are empty, send formData.articlesDetails and formData.weight directly
            const formDataToSend = {
                ...formData,
                articlesDetails: formData.articlesDetails,
                weight: formData.weight
            };
    
            try {
                // Make API call with formDataToSend
                const response = await fetch(API.submitLoanApplication, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formDataToSend),
                });
                if (!response.ok) {
                    // Handle the case where the server returns an error
                    console.error(`Error submitting loan application: ${response.status}`);
                    // Log the response text
                    console.error(await response.text());
                    return;
                }
    
                const data = await response.json();
                console.log(data.message);
                swal.fire({
                    title: 'Success!',
                    text: data.message, // Assuming the server sends a 'message' field in the response
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Reload the page
                    window.location.reload();
                });
                // TODO: Handle success, show a success message, redirect, etc.
    
            } catch (error) {
                console.error('Error submitting loan application:', error);
                // TODO: Handle error, you can throw an error, show a message, etc.
            }
        } else {
            // Include the details of the first row (if it exists)
            if (formData.articlesDetails) {
                articles1.push({
                    name: formData.articlesDetails
                });
            }
    
            if (formData.weight) {
                articles2.push({
                    weight: formData.weight
                });
            }
            // Combine the values from articlesDetails and weight based on index
            const combinedArticles = contentList.map(content => formData[`addjewels_${content.id}`]);
            const combinedWeights = contentList.map(content => formData[`weight_${content.id}`]);
    
            // Concatenate the values with the existing articlesDetails and weight
            formData.articlesDetails += ', ' + combinedArticles.join(', ');
            const totalWeight = combinedWeights.reduce((total, weight) => total + parseFloat(weight), 0);
            formData.weight = (parseFloat(formData.weight) + totalWeight).toFixed(2);
    
            try {
                // Log the formData before making the API call
                console.log('Submitting loan application with data:', formData);
    
                // Make an API call to submit the loan application
                const response = await fetch(API.submitLoanApplication, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
    
                if (!response.ok) {
                    // Handle the case where the server returns an error
                    console.error(`Error submitting loan application: ${response.status}`);
                    // Log the response text
                    console.error(await response.text());
                    return;
                }
    
                const data = await response.json();
                console.log(data.message);
                swal.fire({
                    title: 'Success!',
                    text: data.message, // Assuming the server sends a 'message' field in the response
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Reload the page
                    window.location.reload();
                });
                // TODO: Handle success, show a success message, redirect, etc.
    
            } catch (error) {
                console.error('Error submitting loan application:', error);
                // TODO: Handle error, you can throw an error, show a message, etc.
            }
        }
    };

    const fetchArticles = async () => {
        try {
          const response = await fetch(API.getArticles);
          if (response.ok) {
            const articlesData = await response.json();
            setArticles(articlesData);
          } else {
            console.error('Failed to fetch articles');
          }
        } catch (error) {
          console.error('Error fetching articles:', error);
        }
      };

      const convertAmountToWords = (num) => {
        const units = [
          "",
          "One",
          "Two",
          "Three",
          "Four",
          "Five",
          "Six",
          "Seven",
          "Eight",
          "Nine",
        ];
        const teens = [
          "",
          "Eleven",
          "Twelve",
          "Thirteen",
          "Fourteen",
          "Fifteen",
          "Sixteen",
          "Seventeen",
          "Eighteen",
          "Nineteen",
        ];
        const tens = [
          "",
          "Ten",
          "Twenty",
          "Thirty",
          "Forty",
          "Fifty",
          "Sixty",
          "Seventy",
          "Eighty",
          "Ninety",
        ];
    
        const convertLessThanOneThousand = (num) => {
          if (num === 0) return "";
          if (num < 10) return units[num];
          if (num < 20) return teens[num - 10];
          const unitDigit = num % 10;
          const tenDigit = Math.floor(num / 10) % 10;
          const hundredDigit = Math.floor(num / 100);
    
          let result = "";
    
          if (hundredDigit > 0) {
            result += `${units[hundredDigit]} Hundred `;
            if (num % 100 !== 0) {
              result += "and ";
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
          if (num === 0) return "Zero";
          const crore = Math.floor(num / 10000000);
          const remaining = num % 10000000;
          const lakh = Math.floor(remaining / 100000);
          const thousand = Math.floor((remaining % 100000) / 1000);
          const hundreds = remaining % 1000;
    
          let result = "";
    
          if (crore > 0) {
            result += `${convertLessThanOneThousand(crore)} Crore `;
          }
    
          if (lakh > 0) {
            result += `${convertLessThanOneThousand(lakh)} Lakh `;
          }
    
          if (thousand > 0) {
            if (thousand === 10) {
              result += "Ten Thousand ";
            } else {
              result += `${convertLessThanOneThousand(thousand)} Thousand `;
            }
          }
    
          if (hundreds > 0) {
            result += convertLessThanOneThousand(hundreds);
          }
    
          return result.trim();
        };
    
        return convertLessThanOneCrore(num);
      };
    
    console.log(convertAmountToWords(10000));

        const [searchMode, setSearchMode] = useState('');
        const [searchOptions, setSearchOptions] = useState([]);
    
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
        };

        const [selectedSearchOption, setSelectedSearchOption] = useState([]);

        const fetchLoanBySearch = async () => {
            try {
                const response = await fetch(`${API.getLoanBySearch}?mode=${searchMode}&value=${selectedSearchOption}`);
                if (response.ok) {
                    const loanArray = await response.json();
                    setLoan(loanArray);

                    // Check if the array is not empty
                    if (loanArray.length > 0) {
                        const loanData = loanArray[0];
                        const date = new Date(loanData.dt);
                        loanData.dateString = date.toLocaleDateString('en-GB')       
                        setAmt(loanData.amt);
                        setDate(loanData.dateString);
                        setGlno(loanData.gl_no);
                        setMob(loanData.cust_mob);
                        setNamee(loanData.nm);
                        setPagree(loanData.period_agree);
                        setPlace(loanData.place);
                        setAddress(loanData.addr);
                        setWeight(loanData.weight);
                        await fetchArtBySearch(loanData.id);
                        await fetchPicBySearch(loanData.id);
                    } else {
                        console.error('Empty loan data array');
                    }
                } else {
                    console.error('Failed to fetch loan by search');
                }
            } catch (error) {
                console.error('Error fetching loan by search:', error);
            }
        };

        const [file, setFile] = useState(null);

        const handleFileChange = (e) => {
            setFile(e.target.files[0]);
        };

        const handleFileUpload = async (id) => {
            try {
                const formData = new FormData();
                formData.append('file', file);
        
                if (!file) {
                    console.error('File is missing.');
                    return;
                }
        
                const response = await fetch(`${API.uploadImage}?id=${id}`, {
                    method: 'POST',
                    body: formData,
                });
        
                if (response.ok) {
                    const result = await response.json();
                    const fileName = result.fileName;
        
                    await fetch(`${API.updatePawnTicket}?id=${id}&fileName=${fileName}`, {
                        method: 'PUT',
                    });
        
                    console.log('File uploaded successfully.');
                    swal.fire({
                        title: 'Success!',
                        text: 'File uploaded successfully.', 
                        icon: 'success',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        // Reload the page
                        window.location.reload();
                    });
                } else {
                    console.error('Failed to upload file.');
                }
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        };

        const fetchCompanyDetails1 = async () => {
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

        const fetchLoans = async (id) => {
            try {
                const response = await fetch(`${API.getLoanById}/${id}`);
                if (response.ok) {
                    const loanData = await response.json();
                        const date = new Date(loanData.dt);
                        loanData.dateString = date.toLocaleDateString('en-GB')  
                        setAmt(loanData.amt);
                        setDate(loanData.dateString);
                        setGlno(loanData.gl_no);
                        setMob(loanData.cust_mob);
                        setNamee(loanData.nm);
                        setPagree(loanData.period_agree);
                        setPlace(loanData.place);
                        setAddress(loanData.addr);
                        setWeight(loanData.weight);
                        return loanData;
                } else {
                    console.error('Failed to fetch loan by ID');
                }
            } catch (error) {
                console.error('Error fetching loan by ID:', error);
            }
        };

        const handlePrintVoucher = async (id) => {
            try {
            const result = await fetchCompanyDetails1();
            console.log(id);
        
                if (result.message === 'Company details retrieved successfully') {
                    const loanData = await fetchLoans(id);

                    if(loanData) {
        
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
                                <table width="100%" id="myTable" style="background-color:#fed1c447" border="1">
                        <tbody>
                            <tr>
                                
                                <td colspan="2" style="border:none"><center><b style="font-size:22px">${result.data.cname}</b><br>${result.data.caddr}</center></td>
                            </tr>
                            <tr>
                                <td colspan="2" style="border:none"><center><b style="border:thin solid #ccc;padding:4px;border-radius:5px;background-color:#ccc3;">CASH VOUCHER</b><hr></center></td>
                            </tr>
                            <tr>
                                <td style="border:none"><label style="border:thin solid;padding:6px">Gl.No : ${glno}</label></td>
                                <td style="border:none;text-align:right">தேதி :  <b style="border-bottom:dotted thin">${date}</b>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" style="border:none;white-space:nowrap"> நான் : <span style="border-bottom:dotted thin;padding-right:50%;">${namee}</span></td>
                            </tr>
                            <tr>
                                <td colspan="2" style="border:none">வகையில் ரூபாய்   <b style="border-bottom:dotted thin"> ${convertAmountToWords(amt)} &nbsp;</b> பெற்றுக் கொண்டேன். </td>
                            </tr>
                            <tr>
                                <td colspan="2" style="border:none"><label style="border:thin solid;padding:6px">ரூ. : ${amt}/-</label></td>
                            </tr>
                            <tr>
                                <td colspan="2" style="text-align:right;border:none">பெற்றுக்கொள்பவர் கையொப்பம்  : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                            </tr>
                            <tr>
                                <td colspan="2" style="text-align:left;border:none">எனது தொடர்பு எண் :  <b style="border-bottom:dotted thin">${mob}</b></td>
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
                    console.error('Failed to fetch loan details');
                }
                } else {
                    console.error('Failed to fetch details');
                }
            } catch (error) {
                console.error('Error fetching details:', error);
            }
        };

        const fetchArtBySearch = async (id) => {
            try {
                const response = await fetch(`${API.getLoanBySearchess}/${id}`);
                if (response.ok) {
                    const loanData1 = await response.json();
                    setArtt(loanData1);
                    let arttContent = '';
        
                    if (Array.isArray(loanData1)) {
                        arttContent = loanData1.map(item => `${item.arti}(${item.grm}gm)`).join(', ');
                        setContent(arttContent);
                        setCount(loanData1.length);
                        // Log the count of items in loanData1
                        // console.log("loanData1 count:", loanData1.length);
                    }
                    // console.log("loanData12", arttContent); 
                } else {
                    console.error('Failed to fetch loan by search');
                }
            } catch (error) {
                console.error('Error fetching loan by search:', error);
            }
        };
        // console.log("loanData1", artt);

        const fetchPicBySearch = async (id) => {
            try {
                const response = await fetch(`${API.custPic}/${id}`);
                if (response.ok) {
                    // If the response is successful, set the logo URL
                    setLogoUrl(response.url);
                    // console.log('logoUrl', response);
                } else {
                    // If there's an error, set the logo URL to the default image
                    setLogoUrl('');
                }
            } catch (error) {
                // If there's an exception, set the logo URL to the default image
                setLogoUrl('');
            }
        };

        const handlePrintVoucher1 = async (id) => {
            try {
            const result = await fetchCompanyDetails1();
            console.log(id);
        
                if (result.message === 'Company details retrieved successfully') {
                    const loanData = await fetchLoans(id);
                    await fetchArtBySearch(id);
                    console.log("loanData1", artt);

                    if(loanData) {
                                                    
                    // Construct HTML content for printing
                    const htmlContent = `
                        <html>
                            <head>
                                <title>Bond Details</title>
                                <style>
    b {
        /* text-decoration: underline;
        text-decoration-style: solid; */
		font-size:17px;
		/* text-decoration-color: black; */
    }
    .lve {
            margin-top: 10px;
            margin-bottom: 10px;
            font-weight: bold;
            text-align: center;
            font-size: 18px;
        }
        .dott {
    width: 100%;
   
    border-style: dotted;
    border-color: rgb(133,130,130);
    border-width: 1px; /* Set the width of the border to make the dots smaller */
    padding-top: 20px;
    padding-bottom: 20px;
}
.voucher {
            width: 100%;
            margin: 5px auto;
            border-style: dotted;
    border-color: rgb(133,130,130);
    border-width: 1px; /* Set the width of the border to make the dots smaller */
            padding: 20px;
        }
body, h1, form, p {
    margin: 0;
    padding: 0;
}
.div-mergin{
    margin-top: 5px;
}
.page {
    width: 210mm;
    height: 297mm;
    margin: 0 auto;
    padding: 20mm;
    background-color: white;
    /*box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);*/
    position: relative; 
}

.main-title {
    text-align: center;
    position: absolute;
    top: 20px; 
    left: 50%;
    transform: translateX(-50%);
}

.lic-no {
    position: absolute;
    top: 20px; 
    right: 20px; 
}

.center-obj{
    text-align: center;
}

.p-justify{
    text-align: justify;
}

table {
    border-collapse: collapse; 
    width: 100%; 
}

th, td {
    border: 1px solid black; 
    padding: 5px; 
}

th:first-child, td:first-child {
    border-left: none; 
}

th:last-child, td:last-child {
    border-right: none; 
}

.tear-slip{
    margin-top: 10px;
}

hr{
    border-top: 1px dashed
}

.cell-phone-deatils {
    display: flex;
    justify-content: space-between; 
    margin-top: 10px;
}
.license{
    margin-top: 5px;
}
.bottom {
    margin-left: 60px;
}
.middle{
    margin-top: 10px;
}
.title{
    width: 50%; 
    margin: 0 auto; 
    text-align: center;
}
.title>h3{
    margin: 0;
    padding: 0;
}
.p-margin{
    padding: 5px;
}

.manager{
    text-align: right;
}

body {
    font-size: 21px; /* Adjust this value as needed */
}

h1, h2, h3, p {
    font-size: 12px; /* Adjust this value as needed */
}

table {
    font-size: 12px; /* Adjust this value as needed */
}
</style>
                            </head>
                            <body>
                                <div class="page">

        <div class="main-title">
            <h1 style="font-size:18px;">${result.data.cname}</h1> 
            <p>${result.data.caddr}</p>
        </div>

        <div class="lic-no">
            <p>L.No.${result.data.lnno}</p>
        </div>

        <div class="section1 div-mergin">
            <h3 class="center-obj" style="font-size:18px;"><u>நகை ஈட்டுக்கடன் விண்ணப்பம் &amp; பத்திரம்</u></h3>
            <p class="p-justify">மேலாளர் அவர்கட்கு,<br>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp;நான் எனக்கு சொந்தமானதும் எவ்வித வில்லங்கமுமில்லாத தங்க நகை ஈட்டில் பேரில் <b><u>&nbsp;&nbsp;ரூ.${amt}&nbsp;&nbsp;</u></b> சொந்த செலவுக்காக/விவசயாத்திற்க்கு கடன் கொடுக்க கோரிக்கிறேன்.<br>
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; மேற்படி கடனை <b>${pagree}</b> மாத வாய்தாவில் திரும்பி செலுத்த மேற்படி ஈட்டுநகைகளை  திருப்பிக் கொள்கிறேன்.<br>&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;மேற்படி சொத்து பைனான்ஸ் இருக்கும் காலத்தில் செய்வது தெய்வாதீவமாகவாவது ராஜரீகாமாகவாவது ஏற்படும் நஷ்டங்களுக்கு நான் உத்திரவாதி ஆகிக்கொள்வேன். <br>

               <span style="white-space:nowrap;"></span></p>
			   <p style="text-align:right">அடகு வைபவர் கையொப்பம்</p>
        </div>
        <div class="section-table">
            <h3 class="center-obj" style="font-size:18px;"><u>நகை விபரம்</u></h3>
            <table>
                <tbody>
                    <tr style="height: 40px;">
                        <th>அடமான பொருளின் விபரம்</th>
                        <th>எண்ணம்</th>
                        <th colspan="2" style="width: 80px;">மொத்த எடை<br>கி.  &nbsp;&nbsp;&nbsp;&nbsp; மி.கி.</th>
                        <th colspan="2" style="width: 80px;">கழிவு<br>கி.  &nbsp;&nbsp;&nbsp;&nbsp; மி.கி.</th>
                        <th colspan="2" style="width: 80px;">மீதி<br>கி.  &nbsp;&nbsp;&nbsp;&nbsp; மி.கி.</th>
                        <th>மாற்று</th>
                        <th>1கிராம் விலை ரூபாய்</th>
                        <th>மொத்த மதிப்பு ரூபாய்</th>
                        <th>கடன் தொகை ரூபாய்</th>
                    </tr>
                    <tr style="height: 100px;">
                        <td rowspan="10"><b style="font-size:16px">${content}</b></td>
                        <td rowspan="10"><b style="font-size:16px">${count}</b></td>
                        <td rowspan="10"><b style="font-size:16px">${weight}</b></td>
                        <td rowspan="10">&nbsp;</td>
                        <td rowspan="10">&nbsp;</td>
                        <td rowspan="10">&nbsp;</td>
                        <td rowspan="10">&nbsp;</td>
                        <td rowspan="10">&nbsp;</td>
                        <td rowspan="10">&nbsp;</td>
                        <td rowspan="10">&nbsp;</td>
                        <td rowspan="10">&nbsp;</td>
                        <td rowspan="10"><b>${amt}</b></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section2 div-mergin">
            <p class="p-justify">மேற்படியில் குறித்திருக்கும் உருப்படிகளின் விலைமதிப்புக்கு குறையுமானால் இதனடியில் கையொப்பமிட்டிருக்கும் நான் உத்திரவாதி ஆகிக்கொள்வேன்.<br></p>
			<span style="display:flex">
			<p style="text-align:left;padding-top:35px;padding-bottom:10px;width:50%;float:left;font-weight:900">நகை பரிசோதகர் கையொப்பம் </p>
			<p style="text-align:right;width:50%;float:left">கடன் நம்பர்  <b><u>${glno}</u></b><br>ரூபாய்:  <b><u>${amt}</u></b></p>
			
			</span>
			<p class="p-justify">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;மேற்படி பைனான்சில் நான் த/பெ/வாரிசுதாரர்.  <b><u>${namee}</u></b> விலாசம் <b><u>${place} - ${address}</u></b>  ஆகிய நான் மேலே குறிப்பிட்டிருக்கும் நகைகள் எனக்கு சொந்தமானது. <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;நான் கடனாக பெற்றுக் கொண்ட ரூபாய்...............யும் 100-கும் ஆண்டொன்றுக்கு............. விகிதமுள்ள வட்டியையும் தாங்கள் அவசியப்படுகிற சமயம் தந்து நகைகளை பெற்றுக் கொள்வேன்.
                <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;மேற்குறிப்பிட்டிருக்கும் எனது விலாசத்திற்கு நோட்டீஸ் மூலம் அவசியப்படும்போது முதலும் வட்டியும் தந்து நகைகளை திருப்பவில்லையானால் அவைகளை எனது அறிவோ சம்மதமோ இல்லாமல் தாங்கள் விற்று சகல செலவு சகிதம் ஈடாக்கிக் கொள்ள பூரணமாக சம்மதிக்கிறேன் விற்றதை ஆட்சேபித்து ஒரு காலத்திலும் தற்கம் தகராறுகள் சொல்வதற்கு எனக்கு அவகாசமோ அதிகாரமோ இல்லையென்று இதனால் உத்தரவாதம் செய்திருக்கிறேன் மீதி உள்ள தொகையை யாதொரு தற்கமும் இன்றி திரும்ப பெற்றுக் கொள்வேன்.
                <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;தங்களுக்கு கிடைக்க வேண்டிய தொகை முழுவதும் ஈடாகாவிட்டால் பாக்கி வருகிற தொகைக்கு என்னுடைய ஸ்தாவர ஜெங்கம சொத்துக்களும் உத்தரவாதம்.<br>மேற்கண்டவைகளை வாசித்து ஒப்புக்கொள்ளகிறேன்.
                <br></p>
               <p style="text-align:right"> கையொப்பம்</p>
                <div class="dott">
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;முதலும் வட்டியும் ரூ ____________________ பை __________________ அடைத்து மேல் குறிப்பிட்டிருக்கும் நகைகளை &nbsp;&nbsp;&nbsp;சரிபார்த்து பெற்றுக் கொண்டேன்.</p><p>
                    </p><p style="float:right;margin-top:6px;margin-right:15px;">பெயரும் ஒப்பமும்</p><br><br>
                    <p style="float:right;margin-top:6px;margin-right:15px;">மேலாளர்</p>
                    <p style="margin-left:15px;">தேதி: _________________</p>
</div>  
        </div>

        <hr class="div-mergin">
        <div style="display: flex;">
<div class="voucher" style="width: 525px">
        <div class="cell-phone-deatils">
                <p>L.NO.${result.data.lnno}<br>Email : winfinance23@gmail.com</p>
                <p style="text-align:right">Call : ${result.data.omob}<br>Whatsapp : ${result.data.cmob}</p>
        </div>
        <div class="license">
       

            <div class="title" style="margin-top:5px;">                
				<p><b>${result.data.cname}</b></p>
                <p>${result.data.caddr}</p>
            </div>
            <div class="content-slip div-mergin">
                <p class="p-justify p-margin">Name:<b><u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${namee}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></b> Date:<b><u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${date}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></b></p>
                <p class="p-justify p-margin">GL.NO:<b><u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${glno}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></b> Amount:<b><u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${amt}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></b> Extra Amt:<b><u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<!--25000-->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></b></p>
                <p class="p-justify p-margin">Particulars:<b><u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${content}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></b></p>
                <p class="p-justify p-margin">Weight.Grams:<b><u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${weight} gm&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></b></p>
            </div>
            <p class="manager" style="margin-right:20px;font-size:20px;">Manager</p>
        </div>
</div>
<div style="width: 375px">
                <ol class="" style="white-space: nowrap;font-size: 15px;margin-top:20px;">
                    <li>மூன்று மாதத்திற்கு ஒருமுறை வட்டி <br>செலுத்த வேண்டும்.</li>
                    <li style="margin-top: 20px;">ஒரு வருடத்திற்குள் நகை திருப்பிக் <br>கொள்ள வேண்டும்.</li>
                    <li style="margin-top: 20px;">நகை திருப்ப வரும்போது அடையாள <br>அட்டை தவறாது கொண்டு வரவும்.</li>
                    <hr class="line">
                    <p></p><center>N.B. ஞாயிறு விடுமுறை</center><p></p>
                    <center><span>*****</span></center>
                </ol>
</div>
</div>
    </div>
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
                    console.error('Failed to fetch loan details');
                }
                } else {
                    console.error('Failed to fetch details');
                }
            } catch (error) {
                console.error('Error fetching details:', error);
            }
        };
        // console.log("loanData12", content);

    return (
        <div className='bghome'>
            <Header />
            <Header1 />
                <div style={{zoom: 0.8}}>
                    <div className='col-md-12 title'>
                        <FaTicket className='mb-1' /> NEW JEWEL LOAN ENTRY
                    </div>
                    <div className='col-md-12 le' style={{zoom: 0.9}}>
                        <div className='col-md-5 m-4 lfb'>
                            <div className='col-md-12 d-flex'>
                                <div className='col-md-6'>
                                    <label><b style={{fontWeight: '600'}}>GL.No</b></label><br />
                                    <input className='loin' type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.glNo} readOnly />
                                    <input className='loin'  type='hidden' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.cname} readOnly />
                                    <input className='loin' type='hidden' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.lnno} readOnly />
                                    <input className='loin' type='hidden' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.omob} readOnly />
                                    <input className='loin' type='hidden' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.brch_id} readOnly />
                                </div>
                                <div className='col-md-6'>
                                    <label><b style={{fontWeight: '600'}}>Date</b></label><br />
                                    <input className='loin' type='date' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.date} onChange={(e) => handleInputChange({ target: { name: 'date', value: e.target.value } })}/>
                                </div>
                            </div>
                            <div className='col-md-12 d-flex'>
                                <div className='col-md-6'>
                                    <label><b style={{fontWeight: '600'}}>Name</b></label><br />
                                    <input className='loin' type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.name} onChange={(e) => handleInputChange({ target: { name: 'name', value: e.target.value } })}/>
                                </div>
                                <div className='col-md-6'>
                                    <label><b style={{fontWeight: '600'}}>Place</b></label><br />
                                    <input className='loin' type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.place} onChange={(e) => handleInputChange({ target: { name: 'place', value: e.target.value } })}/>
                                </div>
                            </div>
                            <div className='col-md-12'>
                                <label><b style={{fontWeight: '600'}}>Address of the Pawner</b></label><br />
                                <textarea className='loin' style={{margin: '5px 5px', width: '95%', padding: '6px'}} value={formData.address} onChange={(e) => handleInputChange({ target: { name: 'address', value: e.target.value } })}></textarea>
                            </div>
                            <div className='col-md-12 d-flex mb-2'>
                                <div className='col-md-6'>
                                    <label><b style={{fontWeight: '600'}}>Post Office</b></label><br />
                                    <input className='loin' type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.postOffice} onChange={(e) => handleInputChange({ target: { name: 'postOffice', value: e.target.value } })}/>
                                </div>
                                <div className='col-md-6'>
                                    <label><b style={{fontWeight: '600'}}>Pincode</b></label><br />
                                    <input className='loin' type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.pincode} onChange={(e) => handleNumberInput1({ target: { name: 'pincode', value: e.target.value } })}/>
                                </div>                                
                            </div>
                            <div className='col-md-12 d-flex article ms-1' style={{width: '95%'}}>
                                <div className='col-md-6 ms-2'>
                                    <label><b style={{fontWeight: '600'}}>Details of Articles</b></label><br />
                                    <select className='sa loin' style={{ margin: '5px 5px', width: '90%', padding: '6px',}} onChange={(e) => handleInputChange({ target: { name: 'articlesDetails', value: e.target.value } })}>
                                        <option selected disabled>-- Select Article --</option>
                                        {articles.map((article) => (
                                        <option key={article.id} value={article.nm}>{article.nm}</option>))}
                                    </select>
                                </div>
                                <div className='col-md-5 ms-1'>
                                    <label><b style={{fontWeight: '600'}}>Weight</b></label><br />
                                    <input className='loin' type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.weight} onChange={(e) => handleNumberInput1({ target: { name: 'weight', value: e.target.value } })}/>
                                </div>
                                <div className='col-md-1 text-center mt-4'>
                                    <LuPlusCircle size={30} className='me-5' onClick={handleAddContent} />
                                </div>
                            </div>
                            {contentList.map((formData) => (
                                <div key={formData.id} className='col-md-12 d-flex article ms-1 my-2' style={{ width: '95%' }}>
                                    <div className='col-md-6 ms-2'>
                                        <label><b style={{fontWeight: '600'}}>Details of Articles</b></label><br />
                                        <select className='loin' style={{ margin: '5px 5px', width: '90%', padding: '6px' }} name={`addjewels_${formData.id}`} value={formData[`addjewels_${formData.id}`]} onChange={handleInputChange} >
                                            <option selected disabled>
                                                -- Select Article --
                                            </option>
                                            {articles.map((article) => (
                                                <option key={article.id} value={article.nm}>
                                                    {article.nm}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='col-md-5 ms-1'>
                                        <label><b style={{fontWeight: '600'}}>Weight</b></label><br />
                                        <input className='loin' type='text' style={{ margin: '5px 5px', width: '90%', padding: '6px' }} name={`weight_${formData.id}`} value={formData[`weight_${formData.id}`]} onChange={handleNumberInput1} />
                                    </div>
                                    <div className='col-md-1 text-center mt-3' style={{verticalAlign: 'middle'}}>
                                        {/* Button to hide the copied fields */}
                                        <button className='btn btn-danger me-5' onClick={() => handleDeleteContent(formData.id)}>&times;</button>
                                    </div>
                                </div>
                            ))}
                            <div className='col-md-12 d-flex'>
                                <div className='col-md-6'>
                                    <label><b style={{fontWeight: '600'}}>Amount</b></label><br />
                                    <input className='loin' type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.amount} onChange={(e) => handleNumberInput1({ target: { name: 'amount', value: e.target.value } })}/>
                                </div>
                                <div className='col-md-6'>
                                    <label><b style={{fontWeight: '600'}}>Monthly Interest%</b></label><br />
                                    <input className='loin' type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.monthlyInterest} onChange={(e) => handleNumberInput1({ target: { name: 'monthlyInterest', value: e.target.value } })}/>
                                </div>
                            </div>
                            <div className='col-md-12 d-flex'>
                                <div className='col-md-6'>
                                    <label><b style={{fontWeight: '600'}}>Aadhar Number</b></label><br />
                                    <input className='loin' type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.aadharNumber} onChange={(e) => handleNumberInput1({ target: { name: 'aadharNumber', value: e.target.value } })}/>
                                </div>
                                <div className='col-md-6'>
                                    <label><b style={{fontWeight: '600'}}>Mobile Number</b></label><br />
                                    <input className='loin' type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.mobileNumber} onChange={(e) => handleNumberInput1({ target: { name: 'mobileNumber', value: e.target.value } })}/>
                                </div>
                            </div>
                            <div className='col-md-12 d-flex'>
                                <div className='col-md-6'>
                                    <label><b style={{fontWeight: '600'}}>Nominee</b></label><br />
                                    <input className='loin' type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.nominee} onChange={(e) => handleInputChange({ target: { name: 'nominee', value: e.target.value } })}/>
                                </div>
                                <div className='col-md-6'>
                                    <label><b style={{fontWeight: '600'}}>Nominee's Relationship</b></label><br />
                                    <select className='sa loin' style={{ margin: '5px 5px', width: '90%', padding: '6px' }}value={formData.nomineeRelationship} onChange={(e) => handleInputChange({ target: { name: 'nomineeRelationship', value: e.target.value } })}>
                                        <option value="" disabled> -- Nominee's Relationship --</option>
                                        <option value="Father">Father</option>
                                        <option value="Mother">Mother</option>
                                        <option value="Wife">Wife</option>
                                        <option value="Husband">Husband</option>
                                        <option value="Son">Son</option>
                                        <option value="Daughter">Daughter</option>
                                        <option value="Elder Brother">Elder Brother</option>
                                        <option value="Elder Sister">Elder Sister</option>
                                        <option value="Younger Brother">Younger Brother</option>
                                        <option value="Younger Sister">Younger Sister</option>
                                        <option value="Friend">Friend</option>
                                    </select>
                                </div>
                            </div>
                            <div className='col-md-12 text-center mt-3'>
                                <button className='btn btn-success' onClick={handleSubmit}>Set Now</button>
                            </div>                                                        
                        </div>
                        <div className='col-md-6 my-3 mx-5'>
                            <h3 style={{marginLeft: '39%',marginBottom: '20px',fontWeight: 'bold'}}>
                                Last Entry
                            </h3>
                            <div style={{marginLeft: '48px',background: 'smokewhite'}} className='col-md-11 d-flex'>
                                <div className='col-md-4 text-center'>
                                    <label><b style={{fontWeight: '700'}}>Advance Search Mode</b></label><br />
                                    <select style={{ margin: '5px 5px', width: '90%', padding: '8px' }} value={searchMode} onChange={handleSearchModeChange} >
                                        <option value='' disabled>-- select --</option>
                                        <option value='mob'>Mobile Number</option>
                                        <option value='glno'>Gl. Number</option>
                                        <option value='name'>Name</option>
                                    </select>
                                </div>
                                <div className='col-md-4 text-center' style={{ marginTop: '2.5%' }}>
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
                                        SEARCH
                                    </button>
                                </div>
                            </div>
                            {showPopup && (
                            <div className='col-md-11' style={{fontSize: '18px'}}>
                                <table className='table bg-light table-bordered border-gray text-center m-3'>
                                    <tbody>
                                        {loan.map((item) => (
                                            <tr key={item.id} style={{verticalAlign: 'middle'}}>
                                                <td colSpan='1' style={{ backgroundColor: '#fff0', fontWeight: '400', padding: '0px' }}>
                                                    {logoUrl && <img src={logoUrl} width={'25%'} alt='hiiii' style={{marginBottom: '2%', marginTop: '2%'}} />}
                                                    <label className="custum-file-upload">

                                                    <div className="icon">
                                                        <svg viewBox="0 0 24 24" fill="" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z" fill=""></path> </g></svg>
                                                    </div>
                                                    <div className="text">
                                                        <span>Click to upload image</span>
                                                    </div>
                                                    <input id="file" type='file' onChange={handleFileChange} />
                                                    </label>
                                                    <button className='float-end btn btn-primary m-2' onClick={() => handleFileUpload(item.id)}>Upload</button>
                                                </td>
                                                <td style={{backgroundColor: '#fff0', fontWeight: '400'}}>
                                                    <div className='mt-1'>Voucher Print <img src={print} alt='' width={'30px'} height={'28px'} onClick={() => handlePrintVoucher(item.id)} style={{ cursor: 'pointer' }} /></div>
                                                    <div>Bond Print <img src={print} alt='' width={'30px'} height={'28px'} onClick={() => handlePrintVoucher1(item.id)} style={{ cursor: 'pointer' }} /></div>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td style={{backgroundColor: '#fff0', fontWeight: '400'}}>
                                                <b>L.N.TN-</b><span id="lnnoValue">{c3}</span>
                                            </td>
                                            <td style={{backgroundColor: '#fff0', fontWeight: '400'}}>
                                                <b>Off : </b><span id="omobValue">{c5}</span><br />
                                                <b>Mob : </b><span id="cmobValue">{c4}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{backgroundColor: '#fff0', fontWeight: '400'}} colSpan='2'>
                                                <b><span id="cnameValue">{c1}</span></b><br />
                                                <span id="caddrValue">{c2}</span>
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
                                                    <td key={`date_${index}`} style={{ backgroundColor: '#fff0', fontWeight: '400', whiteSpace: 'nowrap' }}>
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
                            )}
                            {showPopup && (
                            <span style={{marginLeft: '39%',marginBottom: '20px',fontWeight: 'bold',fontSize: '25px'}}>Calculation</span>
                            )}
                            {showPopup && (
                            <div className='col-md-11 mb-5' style={{fontSize: '18px'}}>
                                <table className='table bg-light table-bordered border-gray text-center m-3'>
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
                            )}
                        </div>
                    </div>
                </div>
            <Footer />
        </div>
    );
}

export default ApplyLoan;