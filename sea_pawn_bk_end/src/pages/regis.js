import React from "react";
import { Link } from 'react-router-dom';
import logout from './../img/logout.png';
import Swal from "sweetalert2"; // Import SweetAlert
import "sweetalert2/dist/sweetalert2.css"; // Import SweetAlert styles
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import "./../css/style.css";
import log from "./../img/seapawn_logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import API from '../api/API';  // Import the new api.js

function Cmpregis() {
  const navigate = useNavigate(); // Create a navigate function for redirection

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
      const response = await fetch(API.regis, {
        method: "POST",
        body: formData,
        mode: "cors",
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData.message);

        if (responseData.message === "Registration successful") {
          // Show SweetAlert on successful registration
          Swal.fire({
            icon: "success",
            title: "Registration Successful",
            text: "Your registration was successful!",
          }).then((result) => {
            if (result.isConfirmed) {
              // Check if the server response indicates redirection
              navigate("/login");
            }
          });
        } else {
          console.error("Registration failed");
        }
      } else {
        console.error("Registration failed");
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };
  

  return (
    <div className="containerlog">
    <div className="coming-page-info-6">
    {/* <center><div className="logloader"></div></center> */}
      <div className="login-container" style={{ marginTop: "-10px",zoom:"0.8" }}>
      <div>
                        <Link to={`/`} style={{ marginLeft: '115%' }}><img src={logout} alt='' width={'7%'} height={'10%'} style={{marginTop:'5%'}} /></Link>
                        </div>
        <div className="text-center">
          <img src={log} alt="" width={"50%"} style={{ marginBottom: "3%", marginTop: "8%" }} />
        </div>
        <div className="text-center">
          <label style={{ marginBottom: "3%" }} className="fs-5"> 
            <b>YOUR COMPANY DETAILS</b>
          </label>
        </div>
        <form onSubmit={handleSubmit}>
          <label style={{ marginBottom: "1%" }} className="fs-6 text-light">
            <b>Company Name</b>
          </label>
          <input className='inputlg' type="text" style={{ marginBottom: "4%" }} placeholder="Company Name" name="companyName" />
          <label style={{ marginBottom: "1%" }} className="fs-6 text-light">
            <b>Company logo</b>
          </label>
          <br />
          <input className='inputlg' type="file" style={{ marginBottom: "4%" }} name="logo" />
          <label style={{ marginBottom: "1%" }} className="fs-6 text-light">
            <b>Registration Date</b>
          </label>
          <input className='inputlg' type="date" style={{ marginBottom: "4%" }} placeholder="rdate" name="rdate" />
          <label style={{ marginBottom: "1%" }} className="fs-6 text-light">
            <b>Username</b>
          </label>
          <input className='inputlg' type="text" style={{ marginBottom: "4%" }} placeholder="Username" name="username" />
          <label style={{ marginBottom: "1%" }} className="fs-6 text-light">
            <b>Password</b>
          </label>
          <input className='inputlg' type="password" style={{ marginBottom: "6%" }} placeholder="Password" name="password" />
          <div className="text-center" style={{ marginBottom: "6%" }}>
          <button type='submit' className='pushable'>
                                <span className="shadow"></span>
      <span className="edge"></span>
      <span className="front">Sign in</span>
      </button>
      
          </div>
        </form>
      </div>
    </div>
    </div>
  );
}

export default Cmpregis;