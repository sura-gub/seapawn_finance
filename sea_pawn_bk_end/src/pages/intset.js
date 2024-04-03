import React, { useEffect,useState } from 'react';
import Header from './header';
import Header1 from './header1';
import Footer from './footer';
import { FaWarehouse } from "react-icons/fa";
import swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import API from '../api/API';  // Import the new api.js

function Intset() {

    useEffect(() => {
        // Check if username and password are present in session storage
        const username = sessionStorage.getItem('username');
        const password = sessionStorage.getItem('password');

        if (!username || !password) {
            // Redirect to login.js if username or password is missing
            window.location.href = '/';
        }
        fetchPawnSettings();        
    }, []);

    const [pawnSettingDetails, setPawnSettingDetails] = useState({
        pawnInterest: '',
        koottuvatti: '',
        koottuvattiInterest: ''
    });

    const fetchPawnSettings = () => {
        // Make a request to the server to fetch pawn_settings
        fetch(API.fetchPawnSettings)
            .then(response => response.json())
            .then(data => {
                // Set the fetched data in the state
                setFormData({
                    minterest: data.pawn_intrest,
                    ainterest: data.afterthree_intrest,
                    gr: data.gold_rate,
                    Koottuvatti: data.kootuvatti_for_all_mem_yes_no,
                    kinterest: data.kootuvatti_intrest_for_all_mem,
                    postc: data.postalchrge
                });
                setPawnSettingDetails({
                    pawnInterest: data.pawn_intrest,
                    koottuvatti: data.kootuvatti_for_all_mem_yes_no,
                    koottuvattiInterest: data.kootuvatti_intrest_for_all_mem
                });
            })
            .catch(error => {
                console.error('Error:', error);
                // Handle error, e.g., show an error message
            });
    };

    const [formData, setFormData] = useState({
        minterest: '',
        ainterest: '',
        gr: '',
        Koottuvatti: '',
        kinterest: '',
        postc: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Check if the input field is related to numbers and apply validation
        if (isNumberInputField(name)) {
            const isValidNumberInput = /^[0-9]*\.?[0-9]*$/.test(value);
            setFormData((prevData) => ({
                ...prevData,
                [name]: isValidNumberInput ? value : prevData[name]
            }));
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const isNumberInputField = (fieldName) => {
        // Specify the fields for which number validation should be applied
        const numberInputFields = ['minterest', 'ainterest', 'gr', 'kinterest', 'postc'];
        return numberInputFields.includes(fieldName);
    };

    const handleSubmit = () => {
        // Make a request to the server to update or insert pawn_settings

        if (
            formData.minterest === '' ||
            formData.Koottuvatti === '' ||
            formData.ainterest === '' ||
            formData.gr === '' ||
            formData.kinterest === '' ||
            formData.postc === ''
        ) {
            swal.fire({
                title: 'Warning!',
                text: 'Enter the required values',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return; // Stop execution if validation fails
        }

        fetch(API.updatePawnSettings, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
          .then(response => response.json())
          .then(data => {
            console.log('Success:', data);
            swal.fire({
                title: 'Success!',
                text: data.message, // Assuming the server sends a 'message' field in the response
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                // Reload the page
                window.location.reload();
            });
          })
          .catch(error => {
            console.error('Error:', error);
            // Handle error, e.g., show an error message
            swal.fire({
                title: 'Error!',
                text: 'There was an error while processing your request. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            console.error('Error:', error);
        });
      };

    return (
        <div className='bghome'>
            <Header />
            <Header1 />
                <div style={{zoom: 0.8}} className='col-md-12 title'>
                    <FaWarehouse className='mb-2' size={22} /> Interest Setting
                </div>
                <div className='col-md-12 le vh-100' style={{zoom: 0.9}}>
                    <div className='col-md-6 m-5 lfb'>
                        <div className='col-md-12 d-flex'>
                            <div className='col-md-6'>
                                <label><b style={{fontWeight: '600'}}>Monthly Interest (%)</b></label><br />
                                <input type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.minterest} onChange={(e) => handleInputChange({ target: { name: 'minterest', value: e.target.value } })} />
                            </div>
                            <div className='col-md-6'>
                                <label><b style={{fontWeight: '600'}}>After 3-Monthly Intrest (%)</b></label><br />
                                <input type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.ainterest} onChange={(e) => handleInputChange({ target: { name: 'ainterest', value: e.target.value } })} />
                            </div>
                        </div>
                        <div className='col-md-12 d-flex'>
                            <div className='col-md-6'>
                                <label><b style={{fontWeight: '600'}}>Gold Rate (Rs.)</b></label><br />
                                <input type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.gr} onChange={(e) => handleInputChange({ target: { name: 'gr', value: e.target.value } })} />
                            </div>
                            <div className='col-md-6'>
                                <label><b style={{fontWeight: '600'}}>Koottuvatti For All Member</b></label><br />
                                <select style={{ margin: '5px 5px', width: '90%', padding: '6px' }} value={formData.Koottuvatti} onChange={(e) => handleInputChange({ target: { name: 'Koottuvatti', value: e.target.value } })} >
                                    <option value="" disabled> -- Koottuvatti For All Member --</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                        </div>
                        <div className='col-md-12 d-flex'>
                            <div className='col-md-6'>
                                <label><b style={{fontWeight: '600'}}>Koottuvatti Intrest For All Member (%)</b></label><br />
                                <input type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.kinterest} onChange={(e) => handleInputChange({ target: { name: 'kinterest', value: e.target.value } })} />
                            </div>
                            <div className='col-md-6'>
                                <label><b style={{fontWeight: '600'}}>Postel Charge Per Year (Rs.)</b></label><br />
                                <input type='text' style={{margin: '5px 5px', width: '90%', padding: '6px'}} value={formData.postc} onChange={(e) => handleInputChange({ target: { name: 'postc', value: e.target.value } })} />
                            </div>
                        </div>
                        <div className='mt-3 me-5 text-end'>
                            <button className='btn' style={{ background: '#004AAD', color: 'white' }} onClick={handleSubmit}>Set Now</button>
                        </div>
                    </div>
                    <div className='col-md-5'>
                        <div className='col-md-11 m-4'>
                            <div className='fs-4'>
                                <b style={{ fontWeight: '600',marginLeft:'180px'}}>Pawn Setting Details</b>
                            </div>
                            <table className='table table-bordered bg-light text-center m-3'>
                                <tbody>
                                    <tr>
                                        <td style={{backgroundColor: '#fff0', fontWeight: '400'}} colSpan='2'><b>Pawn Interest :: </b>{pawnSettingDetails.pawnInterest} %</td>
                                    </tr>
                                    <tr>
                                        <td style={{backgroundColor: '#fff0', fontWeight: '400'}}><b>Koottuvatti :: </b>{pawnSettingDetails.koottuvatti}</td>
                                        <td style={{backgroundColor: '#fff0', fontWeight: '400'}}><b>Koottuvatti Interest :: </b>{pawnSettingDetails.koottuvattiInterest} %</td>
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

export default Intset;