import React, { useEffect, useState } from "react";
import "./../css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
// import log1 from './../img/logout1.png';
import { CalendarFill } from "react-bootstrap-icons";
import { FaCoins } from "react-icons/fa";
import API from '../api/API';  // Import the new api.js

function Header() {
  const [logoUrl, setLogoUrl] = useState("");
  const [username, setUsername] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [goldRate, setGoldRate] = useState("");
  const [monthlyInterest, setMonthlyInterest] = useState("");

  useEffect(() => {
    // Fetch the logo, username, and current date when the component mounts
    fetchLogo();
    fetchUsername();
    fetchCurrentDate();
    fetchPawnSettings();
  }, []);

  const fetchPawnSettings = async () => {
    try {
      const response = await fetch(API.pawnSettings);

      if (response.ok) {
        const settings = await response.json();

        // Update the state with gold rate and monthly interest from the fetched data
        const goldRate = settings.gold_rate || "N/A";
        const monthlyInterest = settings.pawn_intrest || "N/A";

        setGoldRate(goldRate);
        setMonthlyInterest(monthlyInterest);
      } else {
        console.error("Error fetching pawn settings:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching pawn settings:", error);
    }
  };

  const fetchLogo = async () => {
    try {
      const response = await fetch(API.companyLogo);

      if (response.ok) {
        // If the response is successful, set the logo URL
        setLogoUrl(response.url);
      } else {
        console.error("Error fetching company logo:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching company logo:", error);
    }
  };

  const fetchUsername = async () => {
    try {
      // Assuming your username is stored in the session
      const storedUsername = sessionStorage.getItem("stfname");

      if (storedUsername) {
        // If the username is found in the session, set it in the state with the first letter of each word in uppercase
        const formattedUsername = storedUsername.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        );
        setUsername(formattedUsername);
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };

  const fetchCurrentDate = () => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    setCurrentDate(formattedDate);
  };

  const handleLogout = () => {
    // Clear all values stored in the session
    sessionStorage.clear();
    // Redirect to the login page or perform any other necessary actions after logout
    window.location.replace("/"); // Example of redirecting to the login page
  };

  return (
    <div className="d-flex bg-light">
      <div className="mt-1">
        {logoUrl && (
          <img
            src={logoUrl}
            width={"23%"}
            alt="Company Logo"
            style={{ marginLeft: "8%" }}
          />
        )}
      </div>
      <div style={{ marginRight: "10%" }} className="mt-2 dd">
        <table
          style={{
            background: "darkgray",
            color: "#142b6e",
            border: "1px solid white",
            letterSpacing: "1px",
            fontSize: "12px",
            wordSpacing: "6px",
            whiteSpace: "nowrap",
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: "3px" }}>
                {" "}
                Date <CalendarFill />
              </td>
              <td
                style={{
                  padding: "3px",
                  border: "1px solid #ffffff",
                  background: "lightgray",
                }}
              >
                {" "}
                {currentDate}
              </td>
              <td style={{ padding: "3px" }}>
                {" "}
                Gold Rate <FaCoins />
              </td>
              <td
                style={{
                  padding: "3px",
                  border: "1px solid #ffffff",
                  background: "lightgray",
                }}
              >
                ₹ {goldRate}
              </td>
              <td style={{ padding: "3px" }}> Monthly Interest %</td>
              <td
                style={{
                  padding: "3px",
                  border: "1px solid #ffffff",
                  background: "lightgray",
                }}
              >
                {monthlyInterest}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        style={{ marginLeft: "auto", marginRight: "2%", whiteSpace: "nowrap" }}
        className="d-flex"
      >
        <p className="my-2 dd">
          Welcome <b>{username}!</b>
        </p>
        &nbsp;
        {/* <a href='login'><button className='btn' style={{marginBottom:'2px',marginTop:'2px',background: '#004AAD',height:'37px', color: 'white', cursor: 'pointer'}}><img src={log1} alt='' width={'18px'} height={'18px'} /> Logout</button></a> */}
        <a style={{ textDecoration: "none" }} href="login">
          <button className="cssbuttons-io-button" onClick={handleLogout}>
            Logout
            <div className="icon">
              <svg
                height="24"
                width="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 0h24v24H0z" fill="none"></path>
                <path
                  d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
          </button>
        </a>
      </div>
    </div>
  );
}

export default Header;