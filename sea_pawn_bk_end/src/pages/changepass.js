import React, { useEffect,useState } from 'react';
import Header from './header';
import Header1 from './header1';
import Footer from './footer';
import { FaWarehouse } from "react-icons/fa";
import swal from 'sweetalert2';
import API from '../api/API';  // Import the new api.js
import { BiShow, BiHide } from 'react-icons/bi';

function Changepass() {

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

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    const handlePasswordChange = async () => {
        // Check if new password and confirm password match
        if (newPassword !== confirmPassword) {
            swal.fire({
                title: 'Warning!',
                text: 'New password and confirm password do not match', // Assuming the server sends a 'message' field in the response
                icon: 'warning',
                confirmButtonText: 'OK'
            }).then(() => {
                // Reload the page
                window.location.reload();
            });
            return;
        }

        // Make API call to update password
        try {
            const response = await fetch(API.updatePassword, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: sessionStorage.getItem('username'),
                    oldPassword,
                    newPassword,
                    confirmPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {                
                swal.fire({
                    title: 'Success!',
                    text: data.message, // Assuming the server sends a 'message' field in the response
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Reload the page
                    window.location.reload();
                });
                // Optionally, you can redirect the user to another page
            } else {                
                swal.fire({
                    title: 'Warning!',
                    text: data.error, // Assuming the server sends a 'message' field in the response
                    icon: 'warning',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Reload the page
                    window.location.reload();
                });
            }
        } catch (error) {
            console.error('Error updating password:', error);
        }
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleTogglePasswordVisibility1 = () => {
        setShowPassword1(!showPassword1);
    };

    const handleTogglePasswordVisibility2 = () => {
        setShowPassword2(!showPassword2);
    };

    return (
        <div className='bghome'>
            <Header />
            <Header1 />
            <div style={{zoom: 0.8}} className='col-md-12 title'>
                <FaWarehouse className='mb-2' size={22} /> Change Password
            </div>
            <div className='vh-100'>
            <div style={{marginTop:'50px',width:'500px'}} className='chngfrm text-center col-md-6 lfb'>
                <div className='col-md-12'>
                    <label style={{marginBottom: '5px', marginLeft: '10px'}}><b style={{fontWeight: '600'}}>Old Password</b></label><br />
                    <input type={showPassword ? 'text' : 'password'} style={{margin: '5px 0px', marginLeft: '10px', width: '60%', padding: '6px'}} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} autoFocus />
                    <div className='eye-icon' onClick={handleTogglePasswordVisibility}>
                        {showPassword ? <BiShow /> : <BiHide />}
                    </div>
                </div>
                <div className='col-md-12'>
                    <div className='mb-3'>
                        <label style={{marginBottom: '5px', marginLeft: '10px'}}><b style={{fontWeight: '600'}}>New Password</b></label><br />
                        <input  type={showPassword1 ? 'text' : 'password'} style={{margin: '5px 0px', marginLeft: '10px', width: '60%', padding: '6px'}} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        <div className='eye-icon1' onClick={handleTogglePasswordVisibility1}>
                            {showPassword ? <BiShow /> : <BiHide />}
                        </div>
                    </div>
                    <div className='mt-4'>
                        <label style={{marginBottom: '5px', marginLeft: '10px'}}><b style={{fontWeight: '600'}}>Confirm Password</b></label><br />
                        <input  type={showPassword2 ? 'text' : 'password'} style={{margin: '5px 0px', marginLeft: '10px', width: '60%', padding: '6px'}} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        <div className='eye-icon2' onClick={handleTogglePasswordVisibility2}>
                            {showPassword ? <BiShow /> : <BiHide />}
                        </div>
                    </div>
                </div>            
                <div className='col-md-12 text-center mt-4'>
                    <button className='btn' style={{ background: '#004AAD', color: 'white' }} onClick={handlePasswordChange}>Set Now</button>
                </div>       
                </div>     </div>
            <Footer />
        </div>
    );
}

export default Changepass;