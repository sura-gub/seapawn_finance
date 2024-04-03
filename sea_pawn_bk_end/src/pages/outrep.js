import React, { useEffect, useState } from "react";
import { CiViewList } from "react-icons/ci";
import Popup from "./Popup";
import Header from "./header";
import Header1 from "./header1";
import Footer from "./footer";
import { FaTicket } from "react-icons/fa6";
import API from "../api/API"; // Import the new api.js

function OutstandingRecord() {
  const [loan, setLoan] = useState([]);
  const [loans, setLoans] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Adjust as needed
  const [searchQuery, setSearchQuery] = useState("");
  const [showPopup1, setShowPopup1] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [content, setContent] = useState("");

  useEffect(() => {
    // Check if username and password are present in session storage
    const username = sessionStorage.getItem("username");
    const password = sessionStorage.getItem("password");
    const userType = sessionStorage.getItem("userType");

    if (!username || !password) {
      // Redirect to login.js if username or password is missing
      window.location.href = "/";
    }

    if (userType === "staff") {
      window.history.back();
    }
  }, []);

  useEffect(() => {
    // Calculate total paid and balance amount
    const newTotalPaid = loan.reduce(
      (acc, curr) => acc + parseFloat(curr.tot_paid),
      0
    );
    const newTotalBalance = loan.reduce(
      (acc, curr) => acc + parseFloat(curr.cur_bala),
      0
    );
    setTotalPaid(newTotalPaid);
    setTotalBalance(newTotalBalance);
  }, [loan]);

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const response = await fetch(API.getLoans);
        if (response.ok) {
          const loanData = await response.json();
          setLoan(loanData);
          console.log(loanData);
        } else {
          console.error("Failed to fetch loan");
        }
      } catch (error) {
        console.error("Error fetching loan:", error);
      }
    };

    fetchLoan();
  }, []);

  const handleEditClick1 = (id) => {
    fetchLoanBySearch(id); // Pass the selected ID to fetchLoans
    fetchCompanyDetails();
    setShowPopup1(true);
    setShowDetails(true);
  };

  const handlePopupClose = () => {
    setShowPopup1(false);
  };

  const fetchLoanBySearch = async (id) => {
    try {
      const response = await fetch(`${API.getLoanBySearches}/${id}`);
      if (response.ok) {
        const loanData = await response.json();
        // Format date before setting the state
        const formattedLoanData = {
          ...loanData,
          dt: new Date(loanData.dt).toLocaleDateString("en-GB"), // Adjust the locale as needed
          third_mnth_start_dt: new Date(
            loanData.third_mnth_start_dt
          ).toLocaleDateString("en-GB"),
        };
        setLoans(formattedLoanData);
        await fetchArtBySearch1(formattedLoanData.id);
      } else {
        console.error("Failed to fetch loan by search");
      }
    } catch (error) {
      console.error("Error fetching loan by search:", error);
    }
  };

  const fetchArtBySearch1 = async (id) => {
    try {
      const response = await fetch(`${API.getLoanBySearchess}/${id}`);
      if (response.ok) {
        const loanData1 = await response.json();
        let arttContent = "";

        if (Array.isArray(loanData1)) {
          arttContent = loanData1
            .map((item) => `${item.arti}(${item.grm}gm)`)
            .join(", ");
          setContent(arttContent);
        }
      } else {
        console.error("Failed to fetch loan by search");
      }
    } catch (error) {
      console.error("Error fetching loan by search:", error);
    }
  };

  const fetchCompanyDetails = async () => {
    try {
      const response = await fetch(API.getCompanyDetails);
      const result = await response.json();

      if (result.message === "Company details retrieved successfully") {
        const companyDetails = result.data;

        document.getElementById("omobValue").innerText =
          companyDetails.omob || "";
        document.getElementById("cmobValue").innerText =
          companyDetails.cmob || "";
        document.getElementById("lnnoValue").innerText =
          companyDetails.lnno || "";
        document.getElementById("cnameValue").innerText =
          companyDetails.cname || "";
        document.getElementById("caddrValue").innerText =
          companyDetails.caddr || "";
      } else {
        console.log("Error retrieving company details:", result.error);
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
    }
  };

  // Function to handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredItems = loan.filter((item) => {
    const searchLower = searchQuery.toLowerCase(); // Convert search query to lowercase
    const itemGlNoLower = item.gl_no.toLowerCase(); // Convert item.gl_no to lowercase
    const itemNameLower = item.nm.toLowerCase(); // Convert item.nm to lowercase
    const itemCustMobLower = item.cust_mob.toLowerCase(); // Convert item.cust_mob to lowercase

    // Check if the lowercase version of item.gl_no, item.nm, or item.cust_mob contains the lowercase search query
    return (
      itemGlNoLower.includes(searchLower) ||
      itemNameLower.includes(searchLower) ||
      itemCustMobLower.includes(searchLower)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // Logic to render page numbers
  const visiblePageNumbers = [];
  for (
    let i = Math.max(1, currentPage - 1);
    i <=
    Math.min(currentPage + 1, Math.ceil(filteredItems.length / itemsPerPage));
    i++
  ) {
    visiblePageNumbers.push(i);
  }

  // Function to handle page change
  const handleClick = (event, pageNumber) => {
    event.preventDefault();
    setCurrentPage(pageNumber);
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
    <div className="bghome">
      <Header />
      <Header1 />
      <div style={{ zoom: "0.8" }}>
        <div className="col-md-12 title">
          <FaTicket className="mb-1" /> Outstanding Report
        </div>
        <div className="col-md-10 osear">
          <div className="col-md-6 my-4 ms-5 me-1">
            <div className="col-md-12 d-flex">
              <div className="col-md-6">
                <label>
                  <b>Total Income : </b>
                  {totalPaid}
                </label>
              </div>
              {/* <div className='col-md-4'>
                                <label><b>Balance Amount : </b>{totalBalance - totalPaid}</label>
                            </div> */}
              <div className="col-md-6" style={{ whiteSpace: "nowrap" }}>
                <label>
                  <b>Total Outstanding Amount : </b>
                  {totalBalance}
                </label>
              </div>
            </div>
          </div>
          <div className="col-md-6 my-3 ms-5 me-1 text-center">
            <label>
              <b
                style={{
                  fontWeight: "600",
                  marginLeft: "125px",
                  fontSize: "20px",
                }}
              >
                Search :{" "}
              </b>
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search..."
              style={{ margin: "5px 5px", width: "30%", padding: "6px" }}
            />
          </div>
        </div>
        <div style={{ zoom: "0.9" }} className="col-md-12 vh-100">
          <table className="table table-bordered bg-light">
            <thead>
              <tr>
                <th
                  className="text-center"
                  style={{
                    backgroundColor: "#1C6FB7",
                    color: "white",
                    fontWeight: "700",
                  }}
                >
                  Si.no
                </th>
                <th
                  className="text-center"
                  style={{
                    backgroundColor: "#1C6FB7",
                    color: "white",
                    fontWeight: "700",
                  }}
                >
                  Gl.No
                </th>
                <th
                  className="text-center"
                  style={{
                    backgroundColor: "#1C6FB7",
                    color: "white",
                    fontWeight: "700",
                  }}
                >
                  Name
                </th>
                <th
                  className="text-center"
                  style={{
                    backgroundColor: "#1C6FB7",
                    color: "white",
                    fontWeight: "700",
                  }}
                >
                  Mobile
                </th>
                <th
                  className="text-center"
                  style={{
                    backgroundColor: "#1C6FB7",
                    color: "white",
                    fontWeight: "700",
                  }}
                >
                  View
                </th>
                <th
                  className="text-center"
                  style={{
                    backgroundColor: "#1C6FB7",
                    color: "white",
                    fontWeight: "700",
                  }}
                >
                  Total Paid
                </th>
                <th
                  className="text-center"
                  style={{
                    backgroundColor: "#1C6FB7",
                    color: "white",
                    fontWeight: "700",
                  }}
                >
                  Balance Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((Loan, index) => {
                return (
                  <tr key={index} className="text-center">
                    <td style={{ backgroundColor: "#fff0", fontWeight: "400" }}>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td style={{ backgroundColor: "#fff0", fontWeight: "400" }}>
                      {Loan.gl_no}
                    </td>
                    <td
                      style={{
                        backgroundColor: "#fff0",
                        fontWeight: "400",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {Loan.nm}
                    </td>
                    <td style={{ backgroundColor: "#fff0", fontWeight: "400" }}>
                      {Loan.cust_mob}
                    </td>
                    <td
                      style={{ backgroundColor: "#fff0", fontWeight: "400" }}
                      className="text-center"
                    >
                      <CiViewList
                        size={32}
                        onClick={() => handleEditClick1(Loan.id)}
                      />
                    </td>
                    <td style={{ backgroundColor: "#fff0", fontWeight: "400" }}>
                      {Loan.tot_paid}
                    </td>
                    <td style={{ backgroundColor: "#fff0", fontWeight: "400" }}>
                      {Loan.cur_bala}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="text-center mt-2">
            {currentPage > 1 && (
              <button
                onClick={(e) => handleClick(e, currentPage - 1)}
                className="mx-1 btn"
              >
                Previous
              </button>
            )}
            {visiblePageNumbers.map((number) => (
              <button
                key={number}
                onClick={(e) => handleClick(e, number)}
                className={`mx-1 btn ${number === currentPage ? "active" : ""}`}
              >
                {number}
              </button>
            ))}
            {currentPage < Math.ceil(filteredItems.length / itemsPerPage) && (
              <button
                onClick={(e) => handleClick(e, currentPage + 1)}
                className="mx-1 btn"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
      <div className='fixed-bottom'>
      <Footer />
      </div>
      {showPopup1 && (
        <Popup onClose={handlePopupClose}>
          <div className="mb-2 modal-header1">
            <button
              onClick={handlePopupClose}
              className="btn"
              style={{ position: "relative", left: "45%" }}
            >
              {" "}
              X{" "}
            </button>
          </div>
          <div
            className={showDetails ? "col-md-11" : "dnone"}
            style={{ fontSize: "14px", whiteSpace: "nowrap" }}
          >
            <table className="table table-bordered border-dark text-center m-3">
              <tbody>
                <tr>
                  <td style={{ backgroundColor: "#fff0", fontWeight: "400" }}>
                    <b>L.N.TN-</b>
                    <span id="lnnoValue"></span>
                  </td>
                  <td style={{ backgroundColor: "#fff0", fontWeight: "400" }}>
                    <b>Off : </b>
                    <span id="omobValue"></span>
                    <br />
                    <b>Mob : </b>
                    <span id="cmobValue"></span>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{ backgroundColor: "#fff0", fontWeight: "400" }}
                    colSpan="2"
                  >
                    <b>
                      <span id="cnameValue"></span>
                    </b>
                    <br />
                    <span id="caddrValue"></span>
                  </td>
                </tr>
                <tr>
                  <td style={{ backgroundColor: "#fff0", fontWeight: "400" }}>
                    <b>Name : </b>
                    {loans && loans.nm}
                  </td>
                  <td style={{ backgroundColor: "#fff0", fontWeight: "400" }}>
                    <b>Date : </b>
                    {loans && loans.dt}
                    <br />
                    <b>Gl.No : </b>
                    {loans && loans.gl_no}
                  </td>
                </tr>
                <tr>
                  <td style={{ backgroundColor: "#fff0", fontWeight: "400" }}>
                    <b>Mobile : </b>
                    {loans && loans.cust_mob}
                  </td>
                  <td style={{ backgroundColor: "#fff0", fontWeight: "400" }}>
                    <b>Place : </b>
                    {loans && loans.place}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan="2"
                    style={{ backgroundColor: "#fff0", fontWeight: "400" }}
                  >
                    <b>Address of Pawner : </b>
                    {loans && loans.addr}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan="2"
                    style={{ backgroundColor: "#fff0", fontWeight: "400" }}
                  >
                    <b>Amount : </b>
                    {loans && loans.amt} (
                    {convertAmountToWords(loans && loans.amt)} Only /-)
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan="2"
                    style={{ backgroundColor: "#fff0", fontWeight: "400" }}
                  >
                    <b>Details of Articles : </b>
                    {content}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan="2"
                    style={{ backgroundColor: "#fff0", fontWeight: "400" }}
                  >
                    <b>Weight : </b>
                    {loans && loans.weight}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan="2"
                    style={{ backgroundColor: "#fff0", fontWeight: "400" }}
                  >
                    <b>Approximate Value : </b>
                    {loans && loans.aprox_value}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan="2"
                    style={{ backgroundColor: "#fff0", fontWeight: "400" }}
                  >
                    <b>Period agree : </b>
                    {loans && loans.period_agree}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <span
            className={showDetails ? "col-md-11" : "dnone"}
            style={{ fontSize: "14px" }}
          >
            Calculation
          </span>
          <div
            className={showDetails ? "col-md-11 mb-5" : "dnone"}
            style={{ fontSize: "14px" }}
          >
            <table className="table table-bordered border-dark text-center m-3">
              <tbody>
                <tr>
                  <td style={{ backgroundColor: "#fff0", fontWeight: "400" }}>
                    <b>Time Period</b>
                  </td>
                  <td style={{ backgroundColor: "#fff0", fontWeight: "400" }}>
                    <b>Time Amount</b>
                  </td>
                </tr>
                <tr>
                  <td
                    className="text-start"
                    style={{ backgroundColor: "#fff0", fontWeight: "400" }}
                  >
                    <b>1 Year</b>
                  </td>
                  <td
                    className="text-start"
                    style={{ backgroundColor: "#fff0", fontWeight: "400" }}
                  >
                    {loans && loans.one_yr_amt}
                  </td>
                </tr>
                <tr>
                  <td
                    className="text-start"
                    style={{ backgroundColor: "#fff0", fontWeight: "400" }}
                  >
                    <b>1 Month</b>
                  </td>
                  <td
                    className="text-start"
                    style={{ backgroundColor: "#fff0", fontWeight: "400" }}
                  >
                    {loans && loans.one_mnth_amt}
                  </td>
                </tr>
                <tr>
                  <td
                    className="text-start"
                    style={{ backgroundColor: "#fff0", fontWeight: "400" }}
                  >
                    <b>1 Day</b>
                  </td>
                  <td
                    className="text-start"
                    style={{ backgroundColor: "#fff0", fontWeight: "400" }}
                  >
                    {loans && loans.one_day_amt}
                  </td>
                </tr>
                <tr>
                  <td
                    className="text-start"
                    style={{ backgroundColor: "#fff0", fontWeight: "400" }}
                  >
                    <b>Min - 15 Days</b>
                  </td>
                  <td
                    className="text-start"
                    style={{ backgroundColor: "#fff0", fontWeight: "400" }}
                  >
                    {loans && loans.seven_day_amt}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Popup>
      )}
    </div>
  );
}

export default OutstandingRecord;
