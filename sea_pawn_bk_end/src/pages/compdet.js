import React, { useEffect } from 'react';
import Header from './header';
import Header1 from './header1';
import Footer from './footer';
import { FaWarehouse } from "react-icons/fa";
import swal from 'sweetalert2';
import API from '../api/API';  // Import the new api.js

function Compdet() {

    const handleNumberInput = (e) => {
        // Use a regular expression to allow only digits and a single decimal point
        const value = e.target.value;
        const isValidInput = /^[0-9]*\.?[0-9]*$/.test(value);
    
        if (!isValidInput) {
          // If input is not valid, set the value to a sanitized version (only digits and one decimal point)
          e.target.value = value.replace(/[^0-9.]/g, '');
        }
      };

      const handleAlphaInput = (e) => {
        // Use a regular expression to allow only alphabetic characters
        const value = e.target.value;
        const isValidInput = /^[a-zA-Z\s]*$/.test(value);
    
        if (!isValidInput) {
            // If input is not valid, set the value to a sanitized version (only alphabetic characters)
            e.target.value = value.replace(/[^a-zA-Z\s]/g, '');
        }
    };

    const checkExistingData = async () => {
        try {
          const response = await fetch(API.checkCompany);
          const result = await response.json();
  
          if (result.message === 'Redirect to login') {            
            const companyData = {
                cname: document.getElementsByName('cname')[0].value,
                rdate: document.getElementsByName('rdate')[0].value,
                cmob: document.getElementsByName('cmob')[0].value,
                omob: document.getElementsByName('omob')[0].value,
                lnno: document.getElementsByName('lnno')[0].value,
                caddr: document.getElementsByName('caddr')[0].value,
            };
            console.log('rdate:',companyData.caddr);
            validateCompanyData(companyData);

            const logoFile = document.getElementsByName('clogo')[0].files[0];
            if (logoFile) {
                handleFileUpload(logoFile);
            }
        }          
          else
          {
            console.log('Redirect to login');
          }
        } catch (error) {
          console.error('Error checking existing data:', error);
        }
      };

      const validateCompanyData = (data) => {
        console.log(data.cname);
    
        if (data.cname.trim() === '' || data.rdate.trim() === '' || data.cmob.trim() === '' || data.omob.trim() === '' || data.lnno.trim() === '' || data.caddr.trim() === '') {
            swal.fire({
                title: 'Warning!',
                text: 'Enter the required values',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return false;
        }
    
        if (!/^[a-zA-Z\s]*$/.test(data.cname)) {
            swal.fire({
                title: 'Warning!',
                text: 'Company name should contain only alphabetic characters',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return false;
        }
    
        if (!/^[0-9]*\.?[0-9]*$/.test(data.omob)) {
            swal.fire({
                title: 'Warning!',
                text: 'Mobile number should contain only digits and a single decimal point',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return false;
        }
    
        if (!/^[6-9]\d{9}$/.test(data.cmob)) {
            swal.fire({
                title: 'Warning!',
                text: 'Office mobile number should contain only 10 digits starting from 6 to 9',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return false;
        }
    
        updateCompanyDetails(data);
    };

      const updateCompanyDetails = async (data) => {
        console.log(data);
        try {
            if (
                data.caddr === '' ||
                data.cmob === '' ||
                data.cname === '' ||
                data.lnno === '' ||
                data.omob === '' ||
                data.rdate === ''
            ) {
                swal.fire({
                    title: 'Warning!',
                    text: 'Enter the required values',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
            } else {
                const response = await fetch(API.updateCompanyDetails, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
    
                const result = await response.json();
    
                if (result.message === 'Company details updated successfully') {
                    swal.fire({
                        title: 'Success!',
                        text: result.message,
                        icon: 'success',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        // Reload the page
                        window.location.reload();
                    });
                } else {
                    console.log('no');
                    swal.fire({
                        title: 'Warning!',
                        text: result.error,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            }
        } catch (error) {
            console.error('Error updating company details:', error);
        }
    };    

    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(API.uploadLogo, {
                method: 'POST',
                body: formData,
            });
            const result1 = await response.json();

            if (result1.message === 'Logo uploaded successfully') {
                console.log('yes');
            } else {
                console.log('no');
            }
        } catch (error) {
            console.error('Error uploading logo:', error);
        }
    };

    const fetchCompanyDetails = async () => {
        try {
            const response = await fetch(API.getCompanyDetails);
            const result = await response.json();
    
            if (result.message === 'Company details retrieved successfully') {
                const companyDetails = result.data;
                console.log(companyDetails);
                // Add one day to the fetched date
                const originalDate = companyDetails.rdate ? new Date(companyDetails.rdate) : null;
                const nextDay = originalDate ? new Date(originalDate.getTime() + (24 * 60 * 60 * 1000)) : null;
                
                // Format the dates to "yyyy-MM-dd"
                // const formattedOriginalDate = originalDate ? originalDate.toISOString().split('T')[0] : '';
                const formattedNextDay = nextDay ? nextDay.toISOString().split('T')[0] : '';
    
                // Populate input fields with retrieved data
                document.getElementsByName('cname')[0].value = companyDetails.cname || '';
                document.getElementsByName('rdate')[0].value = formattedNextDay || '';
                document.getElementsByName('cmob')[0].value = companyDetails.cmob || '';
                document.getElementsByName('omob')[0].value = companyDetails.omob || '';
                document.getElementsByName('lnno')[0].value = companyDetails.lnno || '';
                document.getElementsByName('caddr')[0].value = companyDetails.caddr || '';
                // Populate other fields as needed

                // Display values in the table
                document.getElementById('lnnoValue').innerText = companyDetails.lnno || '';
                document.getElementById('caddrValue').innerText = companyDetails.caddr || '';
                document.getElementById('cmobValue').innerText = companyDetails.cmob || '';
                document.getElementById('omobValue').innerText = companyDetails.omob || '';
                document.getElementById('cnameValue').innerText = companyDetails.cname || '';
                document.getElementById('formattedNextDayValue').innerText = formattedNextDay || '';
            } else {
                console.log('Error retrieving company details:', result.error);
            }
        } catch (error) {
            console.error('Error fetching company details:', error);
        }
    };       
   
    useEffect(() => {
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
        fetchCompanyDetails();   
    }, []);

    const handleSetNowClick = async () => {
        // Move checkExistingData inside the button click to ensure proper order
        await checkExistingData();
    };

    return (
        <div className='bghome'>
            <Header />
            <Header1 />
            <div style={{zoom: 0.8}} className='col-md-12 title'>
                <FaWarehouse className='mb-2' size={22} /> Company Details
            </div>
            <div className='col-md-12 le vh-100' style={{zoom: 0.9}}>
                <div className='col-md-5 m-5 lfb'>
                    <div className='col-md-12 d-flex'>
                        <div className='col-md-6'>
                            <label><b style={{fontWeight: '600'}}>Company Name</b></label><br />
                            <input type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} onChange={handleAlphaInput} name='cname' />
                        </div>
                        <div className='col-md-6'>
                            <label><b style={{fontWeight: '600'}}>Date.of.Reg</b></label><br />
                            <input type='date' style={{margin: '5px 5px', width: '90%', padding: '6px'}} name='rdate' />
                        </div>
                    </div>
                    <div className='col-md-12 d-flex'>
                        <div className='col-md-6'>
                            <label><b style={{fontWeight: '600'}}>Mob</b></label><br />
                            <input type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} onChange={handleNumberInput} name='cmob' />
                        </div>
                        <div className='col-md-6'>
                            <label><b style={{fontWeight: '600'}}>Off.Mob</b></label><br />
                            <input type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} onChange={handleNumberInput} name='omob' />
                        </div>
                    </div>
                    <div className='col-md-12 d-flex'>
                        <div className='col-md-6'>
                        <label><b style={{fontWeight: '600'}}>LN.Number</b></label><br />
                        <input type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} name='lnno' />
                        </div>
                        <div className='col-md-6'>
                        <label><b style={{fontWeight: '600'}}>Company Logo</b></label><br />
                        <input type='file' style={{margin: '5px 5px', width: '90%', padding: '6px'}} name='clogo' />
                        </div>
                    </div>
                    <div className='col-md-12'>
                        <label><b style={{fontWeight: '600'}}>Address</b></label><br />
                        <textarea style={{margin: '5px 5px', width: '95%', padding: '6px'}} name='caddr'></textarea> 
                    </div>
                    <div className='mt-3 me-5 text-end'>
                        <button className='btn' style={{ background: '#004AAD', color: 'white' }} onClick={handleSetNowClick}>Set Now</button>
                    </div>
                </div>
                <div className='col-md-6 m-4'>
                    <div className='fs-4'>
                        <b style={{ fontWeight: '600',marginLeft:'250px' }}>Company Details</b>
                    </div>
                    <div className='col-md-11'>
                        <table className='table table-bordered bg-light text-center m-3'>
                            <tbody>
                                <tr>
                                    <td style={{backgroundColor: '#fff0', fontWeight: '400'}}>
                                        <b>L.N.TN-</b><span id="lnnoValue"></span>
                                    </td>
                                    <td style={{backgroundColor: '#fff0', fontWeight: '400'}}>
                                        <b>Off : </b><span id="omobValue"></span><br />
                                    
                                        <b>Mob : </b><span id="cmobValue"></span><br />
                                    
                                        <b>D.O.R : </b><span id="formattedNextDayValue"></span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{backgroundColor: '#fff0', fontWeight: '400'}} colSpan='2'>
                                        <b><span id="cnameValue"></span></b><br />
                                        <span id="caddrValue"></span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>            
            <Footer />
        </div>
    );
}

export default Compdet;