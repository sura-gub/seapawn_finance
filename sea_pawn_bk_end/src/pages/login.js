import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './../css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import logout from './../img/logout.png';
import Swal from 'sweetalert2';
import API from '../api/API';  // Import the new api.js
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

function Log() {
    const navigate = useNavigate(); // Create a navigate function for redirection
    const [logoUrl, setLogoUrl] = useState('');
    const [userType, setUserType] = useState('admin'); // Default to 'admin'
    const [branch, setBranch] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [branches, setBranches] = useState([]);

    const handleUserTypeChange = (e) => {
        setUserType(e.target.value);
    };

    const handleBranchChange = (e) => {
        setBranch(e.target.value);
    };

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Check for missing values
        if (!username || !password) {
            Swal.fire('Warning', 'Please enter both username and password', 'warning');
            return;
        }
    
        // If userType is 'staff', check for missing branch
        if (userType === 'staff' && !branch) {
            Swal.fire('Warning', 'Please enter the branch', 'warning');
            return;
        }
    
        // Send the data to the server for authentication
        try {
            const response = await fetch(API.login, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userType, username, password, branch }),
            });
    
            const result = await response.json();
            console.log('Server response:', result);
            sessionStorage.setItem('stfname', result.name);
            console.log(result.name);
    
            if (response.ok) {
                // Display success message
                Swal.fire({
                    title: 'Success',
                    text: 'Login successful',
                    icon: 'success',
                });
    
                // Redirect to home.js page
                // window.location.href = '/home';
    
                // Save username and password in session storage
                sessionStorage.setItem('username', username);
                sessionStorage.setItem('password', password);
                sessionStorage.setItem('userType', userType);
    
                // If userType is 'staff', save brch_id in session storage
                if (userType === 'staff') {
                    const brch_id = branch; // Assuming the server sends brch_id in the response
                    sessionStorage.setItem('brch_id', brch_id);
                } else {
                    const brch_id = 0;
                    sessionStorage.setItem('brch_id', brch_id);
                }
                navigate("/home");
            } else {
                // Display error message
                if (result.error === 'Inactive user not allowed to login') {
                    Swal.fire('Warning', result.error || 'Login failed', 'warning');
                } else {
                    Swal.fire('Error', result.error || 'Login failed', 'error');
                }
            }
        } catch (error) {
            console.error('Error during login:', error);
            Swal.fire('Error', 'An unexpected error occurred', 'error');
        }
    };

    useEffect(() => {
        // Fetch the logo when the component mounts
        fetchLogo();
        fetchBranches();
    }, []);

    const fetchLogo = async () => {
        try {
            const response = await fetch(API.getCompanyLogo);

            if (response.ok) {
                // If the response is successful, set the logo URL
                setLogoUrl(response.url);
            } else {
                console.error('Error fetching company logo:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching company logo:', error);
        }
    };

    const fetchBranches = async () => {
        try {
          const response = await fetch(API.getBranches);
          if (response.ok) {
            const branchesData = await response.json();
            setBranches(branchesData);
          } else {
            console.error('Failed to fetch branches');
          }
        } catch (error) {
          console.error('Error fetching branches:', error);
        }
      };

    return (
        <div className="containerlog">
          
            <div className='coming-page-info-6'>
            {/* <center><div style={{marginTop:'-80px'}} className="logloader"></div></center> */}
                <div className='login-container mt-2'>
                    <div>
                        <div>
                        <Link to={`/`} style={{ marginLeft: '115%' }}><img src={logout} alt='' width={'7%'} height={'10%'} style={{marginTop:'5%'}} /></Link>
                        </div>
                            <div className='mt-3 mb-3'>
                                {logoUrl && <img src={logoUrl} width={'43%'} alt='Company Logo' style={{ marginLeft: '27%' }} />}
                            </div>
                       
                        <form onSubmit={handleSubmit}>
                            {/* Radio buttons for user type */}
                            <div style={{ marginBottom: '2%', marginTop: '1%' }} className='d-flex'>
                                <div style={{ marginRight: '10%', marginLeft: '20%' }}>
                                    <label className='fs-5'>
                                        Admin
                                        <input type='radio' value='admin' checked={userType === 'admin'} onChange={handleUserTypeChange} />
                                    </label>
                                </div>
                                <div style={{ marginLeft: '10%' }}>
                                    <label className='fs-5'>
                                        Staff
                                        <input type='radio' value='staff' checked={userType === 'staff'} onChange={handleUserTypeChange} />
                                    </label>
                                </div>
                            </div>
                            <label style={{ marginBottom: '2%' }} className='fs-6 text-light'><b>Username</b></label>
                            <input className='inputlg' type='text' style={{ marginBottom: '4%' }} name='username' value={username} onChange={handleUsernameChange} autoFocus />
                            <label style={{ marginBottom: '2%' }} className='fs-6 text-light'><b>Password</b></label>
                            <input className='inputlg' type='password' style={{ marginBottom: '8%' }} name='password' value={password} onChange={handlePasswordChange} />
                            {userType === 'staff' && (
                                <div style={{ marginBottom: '2%' }}>
                                    <label className='fs-6'><b>Branch</b></label>
                                    {/* <input
                                        type='text'
                                        style={{ marginBottom: '4%' }}
                                        placeholder='Branch'
                                        name='branch'
                                        value={branch}
                                        onChange={handleBranchChange}
                                    /> */}
                                    <select name='branch' style={{ margin: '5px 5px', width: '90%', padding: '6px' }} onChange={handleBranchChange}>
                                        <option selected disabled>-- Select Branch --</option>
                                        {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>{branch.brch_code}-{branch.brch_nm}</option>))}
                                    </select>
                                </div>
                            )}
                            <div style={{ marginBottom: '6%' }} className='text-center'>
                                <button type='submit' className='pushable'>
                                <span className="shadow"></span>
      <span className="edge"></span>
      <span className="front">Login
      </span>
      </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Log;