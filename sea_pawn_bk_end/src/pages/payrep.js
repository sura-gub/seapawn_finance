import React, { useEffect, useState } from "react";
import Header from "./header";
import Header1 from "./header1";
import Footer from "./footer";
import { FaTicket, FaPrint } from "react-icons/fa6";
import API from '../api/API';  // Import the new api.js

function PaymentRecord() {
  const [currentYear, setCurrentYear] = useState("");
  const [currentMonth, setCurrentMonth] = useState("");
  const [loan, setLoan] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Adjust as needed
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Check if username and password are present in session storage
    const username = sessionStorage.getItem("username");
    const password = sessionStorage.getItem("password");

    if (!username || !password) {
      // Redirect to login.js if username or password is missing
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    // Function to get current year
    const getCurrentYear = () => {
      return new Date().getFullYear();
    };

    // Function to get current month
    const getCurrentMonth = () => {
      return new Date().getMonth() + 1; // Months are zero-based
    };

    setCurrentYear(getCurrentYear());
    setCurrentMonth(getCurrentMonth());
  }, []);

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const response = await fetch(
          `${API.getRecord}?year=${currentYear}&month=${currentMonth}`
        );
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
    console.log(currentYear);
    console.log(currentMonth);

    fetchLoan();
  }, [currentYear, currentMonth]);

  // Function to generate options for months
  const generateMonthOptions = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return (
      <>
        <option value="">Month</option>
        <option value="all">All</option>
        {months.map((month, index) => (
          <option key={index} value={(index + 1).toString().padStart(2, "0")}>
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
    return years.reverse().map((year, index) => (
      <option key={index} value={year}>
        {year}
      </option>
    ));
  };

  // Event handler for changing year
  const handleYearChange = (event) => {
    setCurrentYear(event.target.value);
  };

  // // Event handler for changing month
  // const handleMonthChange = (event) => {
  //     setCurrentMonth(event.target.value);
  // };

  // Function to handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredItems = loan.filter((item) => {
    const searchLower = searchQuery.toLowerCase(); // Convert search query to lowercase
    const itemGlNoLower = item.gl_no.toLowerCase(); // Convert item.gl_no to lowercase
    const itemNameLower = item.name.toLowerCase(); // Convert item.nm to lowercase
    const itemCustMobLower = item.mob.toLowerCase(); // Convert item.cust_mob to lowercase

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
  // console.log(filteredItems);
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

  const fetchCompanyDetails = async () => {
    try {
      const response = await fetch(API.getCompanyDetails);
      const result = await response.json();

      if (result.message === "Company details retrieved successfully") {
        const newCompanyDetails = result.data;

        // Check if the elements exist before setting innerText
        if (document.getElementById("omobValue")) {
          document.getElementById("omobValue").innerText =
            newCompanyDetails.omob || "";
        }
        if (document.getElementById("cmobValue")) {
          document.getElementById("cmobValue").innerText =
            newCompanyDetails.cmob || "";
        }
        if (document.getElementById("lnnoValue")) {
          document.getElementById("lnnoValue").innerText =
            newCompanyDetails.lnno || "";
        }
        if (document.getElementById("cnameValue")) {
          document.getElementById("cnameValue").innerText =
            newCompanyDetails.cname || "";
        }
        if (document.getElementById("caddrValue")) {
          document.getElementById("caddrValue").innerText =
            newCompanyDetails.caddr || "";
        }
      } else {
        console.log("Error retrieving company details:", result.error);
      }

      return result; // Return the result for further handling if needed
    } catch (error) {
      console.error("Error fetching company details:", error);
      return { message: "Error fetching company details", error };
    }
  };

  const handlePrint = async () => {
    try {
      // Fetch company details and store them in the state
      const result = await fetchCompanyDetails();

      if (result.message === "Company details retrieved successfully") {
        // Now you can use the companyDetails variable in the HTML content
        const htmlContent = `
                <html>
                    <head>
                        <title>Payment Report</title>
                        <style>
                            /* Add any additional styling for the printed content */
                            body {
                                font-family: Arial, sans-serif;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-bottom: 20px;
                            }
                            th, td {
                                border: 1px solid #ddd;
                                padding: 8px;
                                text-align: center;
                            }
                        </style>
                    </head>
                    <body>
                        <h1 style='text-align: center; margin-top: 25px;'>${
                          result.data.cname
                        }</h1>
                        <h4 style='text-align: center; margin-top: -15px;'>${
                          result.data.caddr
                        }</h4>                    
                        <table>
                            <thead>
                                <tr>
                                    <th colspan='6'>
                                        <h4 style='text-align: center; margin-top: 5px;'>
                                            Payment Report - ${
                                              currentYear || "All"
                                            }
                                        </h4>
                                    </th>
                                </tr>
                                <tr>
                                    <th>Si.no</th>
                                    <th>Gl.No</th>
                                    <th>Date</th>
                                    <th>Name</th>
                                    <th>Mobile</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${currentItems
                                  .map((Loan, index) => {
                                    const date = new Date(Loan.paid_date);
                                    const dateString =
                                      date.toLocaleDateString("en-GB");
                                    return `
                                        <tr key=${index}>
                                            <td>${index + 1}</td>
                                            <td>${Loan.gl_no}</td>
                                            <td>${dateString}</td>
                                            <td>${Loan.name}</td>
                                            <td>${Loan.mob}</td>
                                            <td>${Loan.paid_amt}</td>
                                        </tr>
                                    `;
                                  })
                                  .join("")}
                            </tbody>
                        </table>
                    </body>
                </html>
            `;

        // Open the print window and write the HTML content
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.print();
          printWindow.close(); // Close the print window after printing
        }
      } else {
        console.log("Error retrieving company details:", result.error);
      }
    } catch (error) {
      console.error("Error printing:", error);
    }
  };

  return (
    <div className="bghome">
      <Header />
      <Header1 />
      <div style={{ zoom: "0.8" }}>
        <div className="col-md-12 title">
          <FaTicket className="mb-1" /> Payment Report
        </div>
        <div className="col-md-10 d-flex" style={{ zoom: 0.9 }}>
          <div className="col-md-6 my-3 ms-5 me-1 text-end">
            <label>
              <b
                style={{
                  fontWeight: "600",
                  marginLeft: "15px",
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
          <div className="col-md-6 my-3 ms-5 me-1 text-end">
            <div className="col-md-12 d-flex">
              <div className="col-md-4">
                <select
                  style={{ margin: "5px 5px", width: "70%" }}
                  value={currentYear}
                  onChange={handleYearChange}
                >
                  {generateYearOptions()}
                </select>
              </div>
              <div className="col-md-4">
                <select
                  style={{ margin: "5px 5px", width: "70%" }}
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(e.target.value)}
                >
                  {generateMonthOptions()}
                </select>
              </div>
              <div className="col-md-4 text-center mt-2 pe-5">
                <FaPrint
                  size={25}
                  style={{ cursor: "pointer" }}
                  onClick={handlePrint}
                />
              </div>
            </div>
          </div>
        </div>
        <div  style={{ zoom: "0.9" }} className="col-md-12 vh-100">
          <table className="table table-bordered bg-light">
            <thead>
              <tr>
                <th
                  className="text-center"
                  style={{ backgroundColor: "#1C6FB7", color: "white" }}
                >
                  Si.no
                </th>
                <th
                  className="text-center"
                  style={{ backgroundColor: "#1C6FB7", color: "white" }}
                >
                  Gl.No
                </th>
                <th
                  className="text-center"
                  style={{ backgroundColor: "#1C6FB7", color: "white" }}
                >
                  Date
                </th>
                <th
                  className="text-center"
                  style={{ backgroundColor: "#1C6FB7", color: "white" }}
                >
                  Name
                </th>
                <th
                  className="text-center"
                  style={{ backgroundColor: "#1C6FB7", color: "white" }}
                >
                  Mobile
                </th>
                <th
                  className="text-center"
                  style={{ backgroundColor: "#1C6FB7", color: "white" }}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((Loan, index) => {
                const date = new Date(Loan.paid_date);
                const dateString = date.toLocaleDateString("en-GB"); // Adjust the locale as needed
                return (
                  <tr key={index} className="text-center">
                    <td style={{ backgroundColor: "#fff0", fontWeight: "400" }}>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td style={{ backgroundColor: "#fff0", fontWeight: "400" }}>
                      {Loan.gl_no}
                    </td>
                    <td style={{ backgroundColor: "#fff0", fontWeight: "400" }}>
                      {dateString}
                    </td>
                    <td
                      style={{
                        backgroundColor: "#fff0",
                        fontWeight: "400",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {Loan.name}
                    </td>
                    <td style={{ backgroundColor: "#fff0", fontWeight: "400" }}>
                      {Loan.mob}
                    </td>
                    <td style={{ backgroundColor: "#fff0", fontWeight: "400" }}>
                      {Loan.paid_amt}
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
    </div>
  );
}

export default PaymentRecord;