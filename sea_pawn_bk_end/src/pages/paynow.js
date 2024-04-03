import React, { useEffect, useState, useRef } from "react";
import Header from "./header";
import Header1 from "./header1";
import Footer from "./footer";
import { FaTicket } from "react-icons/fa6";
import swal from "sweetalert2";
import NumericInput from "./numericinput";
import API from "../api/API"; // Import the new api.js

function PayNow() {
  const [loan, setLoan] = useState([]);
  const [searchMode, setSearchMode] = useState("");
  const [selectedSearchOption, setSelectedSearchOption] = useState([]);
  const [searchOptions, setSearchOptions] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [showDetails1, setShowDetails1] = useState(false);
  const [showDetails2, setShowDetails2] = useState(false);
  const [artt, setArtt] = useState([]);
  const [payy, setPayy] = useState([]);
  const [total, setTotal] = useState("");
  const [timeDifference, setTimeDifference] = useState("");
  const [row_id, setRow_id] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showPopup1, setShowPopup1] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDate1, setSelectedDate1] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [artDetail, setArtDetail] = useState("");
  const [id, setId] = useState("");
  const [glno, setGlno] = useState("");
  const [nm, setNm] = useState("");
  const [num, setNum] = useState("");
  const [pint, setPint] = useState("");
  const [amt, setAmt] = useState("");
  const [totamt, setTotamt] = useState("");
  const [kvatti, setKvatti] = useState("");
  const [kvattiint, setKvattiInt] = useState("");
  const [kvattiamt, setKvattiAmt] = useState("");
  const [days, setDays] = useState("");
  const [int, setInt] = useState("");
  const [int01, setInt01] = useState("");
  const [content, setContent] = useState("");
  const [ldate, setLdate] = useState("");
  const [ldate1, setLdate1] = useState("");

  useEffect(() => {
    // Check if username and password are present in session storage
    const username = sessionStorage.getItem("username");
    const password = sessionStorage.getItem("password");

    if (!username || !password) {
      // Redirect to login.js if username or password is missing
      window.location.href = "/";
    }

    fetchCompanyDetails();
  }, []);

  useEffect(() => {
    // This effect will run whenever showDetails changes
    if (showDetails) {
      setShowDetails1(true);
    } else {
      setShowDetails1(false);
    }
  }, [showDetails]); // Dependency array ensures the effect runs when showDetails changes

  useEffect(() => {
    const fetchSearchOptions = async () => {
      try {
        if (
          searchMode === "mob" ||
          searchMode === "glno" ||
          searchMode === "name"
        ) {
          const response = await fetch(
            `${API.getSearchOptions}?mode=${searchMode}`
          );
          if (response.ok) {
            const optionsData = await response.json();
            setSearchOptions(optionsData.options);
          } else {
            console.error("Failed to fetch search options");
          }
        }
      } catch (error) {
        console.error("Error fetching search options:", error);
      }
    };

    fetchSearchOptions();
  }, [searchMode]);

  const handleSearchModeChange = (e) => {
    setSearchMode(e.target.value);
  };

  const handleArticle = (e) => {
    setArtDetail(e.target.value);
  };

  const handleSearchButtonClick = () => {
    setArtDetail("");
    setPaymentAmount("");
    setSelectedDate("");
    setSelectedDate1("");
    fetchLoanBySearch();
  };

  useEffect(() => {
    if (loan.length > 0) {
      // Log values here after the 'loan' state has been updated
      console.log("1", id);
      console.log("3", glno);
      console.log("4", nm);
      console.log("5", num);
      console.log("6", pint);
      console.log("7", amt);
      console.log("8", totamt);
      console.log("9", kvatti);
      console.log("10", kvattiamt);
      console.log("11", kvattiint);
      console.log("12", row_id);
    }
  }, [
    loan,
    id,
    glno,
    nm,
    num,
    pint,
    amt,
    totamt,
    kvattiint,
    kvattiamt,
    kvatti,
    row_id,
  ]);

  const fetchLoanBySearch = async () => {
    try {
      const response = await fetch(
        `${API.getLoanBySearchh}?mode=${searchMode}&value=${selectedSearchOption}`
      );
      if (response.ok) {
        const loanData = await response.json();
        if (loanData.length === 0) {
          setShowDetails(false);
          setShowDetails1(false);
          setShowDetails2(false);
          // Display SweetAlert notification here
          swal.fire({
            icon: "info",
            title: "Customer Account Closed",
            text: 'This customer\'s account is closed. Please check the "Closed Customer" option or There is no such Customer',
          });
        } else {
          sessionStorage.setItem("mode", searchMode);
          sessionStorage.setItem("value", selectedSearchOption);
          setShowDetails(true);
          setLoan(loanData);
          loanData.forEach((item) => fetchArtBySearch(item.id));
          loanData.forEach((item) => fetchPayBySearch(item.id));
          loanData.forEach((item) => setId(item.id));
          loanData.forEach((item) => setGlno(item.gl_no));
          loanData.forEach((item) => setNm(item.nm));
          loanData.forEach((item) => setNum(item.cust_mob));
          loanData.forEach((item) => setPint(item.pawn_intrest));
          loanData.forEach((item) => setAmt(item.amt));
          loanData.forEach((item) => setTotamt(item.tot_paid));
          loanData.forEach((item) => setKvatti(item.kootuvatti_yes_or_no));
          loanData.forEach((item) => setKvattiInt(item.koottuvatti_intrest));
          loanData.forEach((item) => setKvattiAmt(item.kootuvatti_amt));
        }
      } else {
        console.error("Failed to fetch loan by search");
      }
    } catch (error) {
      console.error("Error fetching loan by search:", error);
    }
  };

  const fetchPayBySearch = async (id) => {
    try {
      const response = await fetch(`${API.getPayBySearch}/${id}`); // Corrected endpoint name
      if (response.ok) {
        const PayData = await response.json();
        setShowDetails1(true);
        setPayy(PayData); // Set the fetched loan data directly
        console.log("14", PayData);
        // const datee = new Date(PayData[0].paid_date).toLocaleDateString("en-GB")
        const datee = new Date(PayData[0].paid_date);
        const dateString = datee.toLocaleDateString("en-GB");
        // const dateString1 = datee.toISOString().split('T')[0];
        const parts = dateString.split("/");
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        const newFormattedDate = `${year}-${month}-${day}`;
        setLdate(newFormattedDate);
        setLdate1(newFormattedDate);
        console.log("datee", newFormattedDate);
      } else {
        setShowDetails1(false);
        let ldate1 = new Date();

        // Handle edge case: When the incremented day exceeds the number of days in the month
        const year = ldate1.getFullYear();
        const month = String(ldate1.getMonth() + 1).padStart(2, "0"); // Month starts from 0
        const day = String(ldate1.getDate()).padStart(2, "0");

        const newFormattedDate = `${year}-${month}-${day}`;
        setLdate1(newFormattedDate);
        console.log("datee", newFormattedDate);
      }
    } catch (error) {
      console.error("Error fetching loan by search:", error);
    }
  };

  const fetchArtBySearch = async (id) => {
    try {
      const response = await fetch(`${API.getLoanBySearchess}/${id}`); // Corrected endpoint name
      if (response.ok) {
        const loanData = await response.json();
        setArtt(loanData); // Set the fetched loan data directly
        loanData.forEach((item) => setRow_id(item.row_id));
        console.log("2", loanData);
        let arttContent = "";

        if (Array.isArray(loanData)) {
          arttContent = loanData
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

  const handlePopupClose = () => {
    setShowPopup(false);
    setShowPopup1(false);
  };

  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
        setShowPopup1(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupRef]);

  // Function to handle date input change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleAmountChange = (e) => {
    setPaymentAmount(e.target.value);
  };

  const handleIntoneChange = (e) => {
    setPint(e.target.value);
  };

  const handleIntoneChange1 = (e) => {
    console.log("Selected pint:", pint);
    setShowPopup1(false);
  };

  const handlePayment = async () => {
    if (selectedDate1 === "") {
      setShowDetails2(false);
      if (paymentAmount > 0 && artDetail !== "") {
        setShowPopup(true);
        console.log("Selected Date:", selectedDate1);
        console.log("Article Detail:", artDetail);
      } else {
        // Show warning message for incorrect input
        swal.fire({
          title: "Warning!",
          text:
            artDetail === ""
              ? "Enter the article detail"
              : "Payment amount cannot be Zero or negative",
          icon: "warning",
          confirmButtonText: "OK",
        });
      }
    } else {
      try {
        if (paymentAmount <= 0 || artDetail === "") {
          console.log("paymentAmount", paymentAmount);
          // Show warning message for incorrect input
          swal.fire({
            title: "Warning!",
            text:
              artDetail === ""
                ? "Enter the article detail"
                : "Payment amount cannot be Zero or negative",
            icon: "warning",
            confirmButtonText: "OK",
          });
        } else {
          console.log("paymentAmount", paymentAmount);
          // Send data to server
          const response = await fetch(API.pay, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              pawn_ticket_id: id,
              glno: glno,
              nm: nm,
              num: num,
              pint: pint,
              amt: total, // Assuming 'total' contains the total amount
              date: selectedDate1,
              artDetail: artDetail,
              intamount: int01,
              paidamount: paymentAmount,
              total_paid: totamt, // Assuming 'total' contains the total amount
              kvattiint: kvattiint,
              kvattiamt: kvattiamt,
              kvatti: kvatti,
            }),
          });
          if (response.status === 400) {
            // Specific notification message from server
            const data = await response.json();
            swal.fire({
              icon: "info",
              title: "Notification",
              text: data.error,
            });
          } else if (!response.ok) {
            // Other errors
            throw new Error("Failed to insert payment amount");
          } else {
            // Success
            const data = await response.json();
            console.log(data.message); // Log the server response
            swal
              .fire({
                icon: "success",
                title: "Success",
                text: data.message,
              })
              .then(() => {
                // Reload the page
                setArtDetail("");
                setPaymentAmount("");
                setSelectedDate("");
                setSelectedDate1("");
                setLdate("");
                fetchLoannBySearch(searchMode, selectedSearchOption);
              });
          }
        }
      } catch (error) {
        console.error("Error:", error.message);
        // Show generic error message and reload the page
        swal
          .fire({
            icon: "error",
            title: "Error",
            text: "Failed to insert payment details",
          })
          .then(() => {
            // Reload the page
            window.location.reload();
          });
      }
    }
  };

  const handlePayment1 = async () => {
    if (paymentAmount > 0 && artDetail !== "") {
      setShowPopup(true);
      console.log("Selected Date:", selectedDate1);
    } else {
      // Show warning message for incorrect input
      swal.fire({
        title: "Warning!",
        text:
          artDetail === ""
            ? "payment amount cannot be Zero or negative"
            : "Enter thearticle detail",
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  };

  const fetchLoannBySearch = async (searchMode, selectedSearchOption) => {
    try {
      const response = await fetch(
        `${API.getLoanBySearchh}?mode=${searchMode}&value=${selectedSearchOption}`
      );
      if (response.ok) {
        const loanData = await response.json();
        if (loanData.length === 0) {
          setShowDetails(false);
          setShowDetails1(false);
        } else {
          setShowDetails(true);
          setLoan(loanData);
          loanData.forEach((item) => fetchArtBySearch(item.id));
          loanData.forEach((item) => fetchPayBySearch(item.id));
          loanData.forEach((item) => setId(item.id));
          loanData.forEach((item) => setGlno(item.gl_no));
          loanData.forEach((item) => setNm(item.nm));
          loanData.forEach((item) => setNum(item.cust_mob));
          loanData.forEach((item) => setPint(item.pawn_intrest));
          loanData.forEach((item) => setAmt(item.amt));
          loanData.forEach((item) => setTotamt(item.tot_paid));
          loanData.forEach((item) => setKvatti(item.kootuvatti_yes_or_no));
          loanData.forEach((item) => setKvattiInt(item.koottuvatti_intrest));
          loanData.forEach((item) => setKvattiAmt(item.kootuvatti_amt));
        }
      } else {
        console.error("Failed to fetch loan by search");
      }
    } catch (error) {
      console.error("Error fetching loan by search:", error);
    }
  };

  const buttonText = selectedDate1 === "" ? "Set Date" : "Pay Now";

  useEffect(() => {
    if (buttonText === "Pay Now") {
      setShowDetails2(true);
    } else {
      setShowDetails2(false);
    }
  }, [buttonText]);

  useEffect(() => {
    if (!loan || loan.length === 0) {
      // Handle the case where loan is empty or undefined
      return;
    }

    // Check if date difference exceeds one month
    const currentDate = selectedDate ? new Date(selectedDate) : new Date();
    console.log("currentDate", currentDate);
    const loanDate = new Date(loan[0]?.dt); // Assuming loan[0] is the first loan in the list
    console.log("loanDate", loanDate);
    const differenceInMilliseconds = currentDate - loanDate;
    console.log(
      "differenceInMilliseconds gtfwegtfwe",
      differenceInMilliseconds
    );
    const differenceInDays = differenceInMilliseconds / (1000 * 3600 * 24);
    const years = Math.floor(
      differenceInMilliseconds / (365 * 24 * 60 * 60 * 1000)
    );
    const months = Math.floor(
      (differenceInMilliseconds % (365 * 24 * 60 * 60 * 1000)) /
        (30 * 24 * 60 * 60 * 1000)
    );
    const days = Math.floor(
      (differenceInMilliseconds % (30 * 24 * 60 * 60 * 1000)) /
        (24 * 60 * 60 * 1000)
    );
    setDays(differenceInDays);
    setTimeDifference(` ${years} years, ${months} months, ${days} days`);
    const amtt = parseFloat(loan[0].amt); // Assuming amt is a property of the loan object
    const int = pint ? parseFloat(pint) : parseFloat(loan[0].pawn_intrest); // Assuming pawn_intrest is a property of the loan object
    setInt(int);
    const int1 = parseFloat(loan[0].pawn_intrest);
    const totall = parseFloat(loan[0].tot_paid);

    console.log("16: days", differenceInDays);

    if (differenceInDays < 15) {
      const days = 15;
      const intt = ((amtt * int * (days * 1.0139) * 12) / 36500).toFixed(0);
      setInt01(intt);
      const tt = amtt + parseFloat(intt);
      const total_amt = tt - totall;
      console.log("13", totall);
      console.log("15", total_amt);
      setTotal(total_amt);
    } else {
      var timeDifference = Math.max(
        15.2085,
        years * 365 + months * 30.4171 + days * 1.0139
      );
      console.log("timeDifference", timeDifference);

      if (int !== int1) {
        const extraTime = timeDifference - 90;
        const intt1 = ((amtt * int1 * 90 * 12) / 36500).toFixed(0);
        console.log("intt1", intt1);
        const intt2 = ((amtt * int * extraTime * 12) / 36500).toFixed(0);
        console.log("intt2", intt2);
        const intt = (parseInt(intt1) + parseInt(intt2)).toFixed(0);
        console.log("intt", intt);
        setInt01(intt);
      } else {
        const intt = ((amtt * int * timeDifference * 12) / 36500).toFixed(0);
        console.log("intt", intt);
        setInt01(intt);
      }

      const tt = parseInt(amtt) + parseInt(int01);
      console.log("17", tt);
      const total_amt = (tt - totall).toFixed(0);
      console.log("13", totall);
      console.log("15", total_amt);
      setTotal(total_amt);
    }
  }, [loan, selectedDate, pint, int01]);

  // Function to set date
  const handleSetDate1 = () => {
    // Implement logic here, e.g., you might want to store the selected date in state
    const sdate = new Date(selectedDate);
    const ldate1 = new Date(ldate);
    console.log("ldate1", ldate1);
    const differenceInMilliseconds1 = sdate - ldate1;
    console.log("differenceInMilliseconds1differenceInMilliseconds1",differenceInMilliseconds1);
    var differenceInDays1 = differenceInMilliseconds1 / (1000 * 3600 * 24);
    console.log("daysgsdfgfgrgdfgdfgdf",days);

    // Check the value of the radio button
    const radioButtonValue = document.querySelector(
      'input[name="option"]:checked'
    ).value;
    if (isNaN(differenceInDays1) || differenceInDays1 === 0) {
      differenceInDays1 = days;
    }
    console.log("differenceInDays1", differenceInDays1);
    if (radioButtonValue === "yes" && differenceInDays1 > 90) {
      setShowPopup1(true);
    } else if (radioButtonValue === "yes" && differenceInDays1 <= 90) {
      setShowPopup1(false);
      swal.fire({
        title: "Warning!",
        text: "You can't provide any high interest below 3 months gap",
        icon: "info",
        confirmButtonText: "OK",
      });
    } else {
      setShowPopup1(false);
    }

    setShowPopup(false);
    setSelectedDate1(selectedDate);
    // Close modal or take further action
  };

  const handleDeletePayment = async (index) => {
    let deletedPayment;
    let updatedPayy;
    console.log("payyy.length", payy.length);
    if (index === 0) {
      // If the clicked payment is the last one, show a confirmation alert
      const confirmDelete = await swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this payment?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel",
      });

      if (!confirmDelete.value) {
        // User canceled deletion
        return;
      }

      // If the clicked payment is the last one, delete it
      deletedPayment = payy[index];
      updatedPayy = payy.slice(0, -1);
      // Update the state with the modified payy array
      setPayy(updatedPayy);
      console.log("Deleted payment:", deletedPayment);
      console.log("Remaining payments:", updatedPayy);

      // Send the deleted payment details to the server
      try {
        const response = await fetch(API.deletePayment, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deletedPayment),
        });
        if (response.ok) {
          console.log(
            "Deleted payment details sent to the server successfully"
          );
          swal
            .fire({
              icon: "success",
              title: "Success",
              text: "Deleted the payment details successfully",
            })
            .then(() => {
              // Reload the page
              setArtDetail("");
              setPaymentAmount("");
              setSelectedDate("");
              setSelectedDate1("");
              setLdate("");
              fetchLoannBySearch(searchMode, selectedSearchOption);
            });
        } else {
          console.error("Failed to send deleted payment details to the server");
        }
      } catch (error) {
        console.error(
          "Error sending deleted payment details to the server:",
          error
        );
      }
    } else {
      // If the clicked payment is not the last one, log a message
      console.log(
        "You can't delete other payment details except the last one."
      );
      swal.fire({
        icon: "info",
        title: "Notification",
        text: "You can't delete other payment details except the last one.",
      });
      // Assign the original payy array to updatedPayy
      updatedPayy = payy;
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
          <FaTicket className="mb-1" /> Payment
        </div>
        <div className="col-md-12 le" style={{ zoom: 0.9 }}>
          <div className="col-md-5 my-3 ms-5 me-1">
            <div className="col-md-12 d-flex  my-4 mx-3">
              <div className="col-md-5">
                <label>
                  <b style={{ fontWeight: "600", marginLeft: "15px" }}>Mode</b>
                </label>
                <select
                  style={{ margin: "5px 5px", width: "85%", padding: "6px" }}
                  value={searchMode}
                  onChange={handleSearchModeChange}
                >
                  <option value="" disabled>
                    -- Select --
                  </option>
                  <option value="mob">Mobile Number</option>
                  <option value="glno">Gl. Number</option>
                  <option value="name">Name</option>
                </select>
              </div>
              <div
                className="col-md-5 text-center"
                style={{ marginTop: "2.9%" }}
              >
                <input
                  list="searchOptions"
                  style={{ margin: "5px 5px", width: "90%", padding: "4px" }}
                  onChange={(e) => setSelectedSearchOption(e.target.value)}
                  className="inputstyle"
                />
                <datalist id="searchOptions">
                  {searchOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </datalist>
              </div>
              <div
                className="col-md-1 text-center"
                style={{ marginTop: "2.9%" }}
              >
                <button
                  className="btn btn-primary w-100"
                  onClick={handleSearchButtonClick}
                >
                  PAY
                </button>
              </div>
            </div>
            <div
              className={showDetails ? "col-md-11" : "dnone"}
              style={{ fontSize: "18px" }}
            >
              <table className="table bg-light table-bordered text-center m-3">
                <tbody>
                  <tr>
                    <td
                      colSpan="2"
                      style={{ backgroundColor: "#fff0", fontWeight: "400" }}
                    >
                      <label>
                        If cash is not paid on time,
                        <br /> Higher interest will be charged after 3 months.
                        Paying on time?
                      </label>
                      <br />
                      <label
                        className="me-3 mt-2"
                        style={{ verticalAlign: "yes", fontSize: "20px" }}
                      >
                        <input
                          type="radio"
                          name="option"
                          value="yes"
                          style={{ transform: "scale(1.5)" }}
                        />
                        Yes
                      </label>
                      <label
                        className="ms-3 mt-2"
                        style={{ verticalAlign: "yes", fontSize: "20px" }}
                      >
                        <input
                          type="radio"
                          name="option"
                          value="no"
                          style={{ transform: "scale(1.5)" }}
                          defaultChecked
                        />
                        No
                      </label>
                    </td>
                  </tr>
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
                    {loan.map((Loan, index) => {
                      const date = new Date(Loan.dt);
                      const dateString = date.toLocaleDateString("en-GB"); // Adjust the locale as needed

                      return (
                        <React.Fragment key={index}>
                          <td
                            key={`name_${index}`}
                            style={{
                              backgroundColor: "#fff0",
                              fontWeight: "400",
                              verticalAlign: "middle",
                            }}
                          >
                            <b>Name : </b>
                            {Loan.nm}{" "}
                            <span style={{ color: "green", fontWeight: "700" }}>
                              -{" "}
                              {Loan.status.charAt(0).toUpperCase() +
                                Loan.status.slice(1).toLowerCase()}
                            </span>
                          </td>
                          <td
                            key={`date_${index}`}
                            style={{
                              backgroundColor: "#fff0",
                              fontWeight: "400",
                            }}
                          >
                            <b>Date : </b>
                            {dateString}
                            <br />
                            <b>Gl.No : </b>
                            {Loan.gl_no}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                  <tr>
                    {loan.map((Loan, index) => {
                      return (
                        <React.Fragment key={index}>
                          <td
                            key={`name_${index}`}
                            style={{
                              backgroundColor: "#fff0",
                              fontWeight: "400",
                            }}
                          >
                            <b>Mobile : </b>
                            {Loan.cust_mob}
                          </td>
                          <td
                            key={`date_${index}`}
                            style={{
                              backgroundColor: "#fff0",
                              fontWeight: "400",
                            }}
                          >
                            <b>Place : </b>
                            {Loan.place}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                  <tr>
                    {loan.map((Loan, index) => {
                      return (
                        <React.Fragment key={index}>
                          <td
                            key={`name_${index}`}
                            style={{
                              backgroundColor: "#fff0",
                              fontWeight: "400",
                            }}
                            colSpan="2"
                            className="text-start"
                          >
                            <b>Address of Pawner : </b>
                            {Loan.addr}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                  <tr>
                    {loan.map((Loan, index) => {
                      return (
                        <React.Fragment key={index}>
                          <td
                            key={`name_${index}`}
                            style={{
                              backgroundColor: "#fff0",
                              fontWeight: "400",
                            }}
                            colSpan="2"
                            className="text-start"
                          >
                            <b>Amount : </b>
                            <span
                              style={{ color: "red", fontWeight: "bolder" }}
                            >
                              {Loan.amt} ({convertAmountToWords(Loan.amt)} Only
                              /-)
                            </span>
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                  <tr>
                    <td
                      style={{ backgroundColor: "#fff0", fontWeight: "400" }}
                      colSpan="2"
                      className="text-start"
                    >
                      <b>Details of Articles : </b>
                      <span style={{ color: "red", fontWeight: "bolder" }}>
                        {content}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    {loan.map((Loan, index) => {
                      return (
                        <React.Fragment key={index}>
                          <td
                            key={`name_${index}`}
                            style={{
                              backgroundColor: "#fff0",
                              fontWeight: "400",
                            }}
                            colSpan="2"
                            className="text-start"
                          >
                            <b>Weight : </b>
                            <span
                              style={{ color: "red", fontWeight: "bolder" }}
                            >
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
                          <td
                            key={`name_${index}`}
                            style={{
                              backgroundColor: "#fff0",
                              fontWeight: "400",
                            }}
                            colSpan="2"
                            className="text-start"
                          >
                            <b>Approximate value : </b>
                            <span
                              style={{ color: "red", fontWeight: "bolder" }}
                            >
                              {Loan.aprox_value}
                            </span>
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                  <tr>
                    <td
                      className="text-start"
                      style={{ backgroundColor: "#fff0", fontSize: "17px" }}
                    >
                      <b>(P.T.O)</b>
                    </td>
                    <td
                      className="text-start"
                      style={{ backgroundColor: "#fff0", fontSize: "17px" }}
                    >
                      <b>Manager</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <span
              className={showDetails ? "col-md-11" : "dnone"}
              style={{
                fontSize: "25px",
                paddingLeft: "350px",
                fontWeight: "600",
              }}
            >
              Calculation
            </span>
            <div
              className={showDetails ? "col-md-11 mb-5" : "dnone"}
              style={{ fontSize: "18px" }}
            >
              <table className="table table-bordered bg-light text-center m-3">
                <tbody>
                  <tr>
                    {loan.map((Loan, index) => {
                      return (
                        <React.Fragment key={index}>
                          <td
                            key={`name_${index}`}
                            style={{
                              backgroundColor: "#fff0",
                              fontWeight: "400",
                            }}
                            colSpan="2"
                            className="text-center"
                          >
                            <b>Amount : </b>
                            <span
                              style={{ color: "blue", fontWeight: "bolder" }}
                            >
                              Rs. {Loan.amt}
                            </span>
                            &nbsp;&nbsp;
                            <b>Interest : </b>
                            <span
                              style={{ color: "blue", fontWeight: "bolder" }}
                            >
                              {Loan.pawn_intrest}%
                            </span>
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                  <tr>
                    <th
                      style={{
                        backgroundColor: "#fff0",
                        fontWeight: "400",
                        fontSize: "18px",
                      }}
                      className="text-start"
                    >
                      <b>Time Period</b>
                    </th>
                    <th
                      style={{
                        backgroundColor: "#fff0",
                        fontWeight: "400",
                        fontSize: "18px",
                      }}
                      className="text-start"
                    >
                      <b>Total Amount</b>
                    </th>
                  </tr>
                  <tr>
                    <td
                      style={{
                        backgroundColor: "#fff0",
                        fontWeight: "bolder",
                        fontSize: "18px",
                      }}
                      className="text-start"
                    >
                      1 year
                    </td>
                    {loan.map((Loan, index) => {
                      return (
                        <React.Fragment key={index}>
                          <td
                            key={`name_${index}`}
                            style={{
                              backgroundColor: "#fff0",
                              fontWeight: "600",
                            }}
                            className="text-start"
                          >
                            <span>{Loan.one_yr_amt}</span>
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                  <tr>
                    <td
                      style={{
                        backgroundColor: "#fff0",
                        fontWeight: "bolder",
                        fontSize: "18px",
                      }}
                      className="text-start"
                    >
                      1 month
                    </td>
                    {loan.map((Loan, index) => {
                      return (
                        <React.Fragment key={index}>
                          <td
                            key={`name_${index}`}
                            style={{
                              backgroundColor: "#fff0",
                              fontWeight: "600",
                            }}
                            className="text-start"
                          >
                            <span>{Loan.one_mnth_amt}</span>
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                  <tr>
                    <td
                      style={{
                        backgroundColor: "#fff0",
                        fontWeight: "bolder",
                        fontSize: "18px",
                      }}
                      className="text-start"
                    >
                      1 day
                    </td>
                    {loan.map((Loan, index) => {
                      return (
                        <React.Fragment key={index}>
                          <td
                            key={`name_${index}`}
                            style={{
                              backgroundColor: "#fff0",
                              fontWeight: "600",
                            }}
                            className="text-start"
                          >
                            <span>{Loan.one_day_amt}</span>
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                  <tr>
                    <td
                      style={{
                        backgroundColor: "#fff0",
                        fontWeight: "bolder",
                        fontSize: "18px",
                      }}
                      className="text-start"
                    >
                      Min - 15 day
                    </td>
                    {loan.map((Loan, index) => {
                      return (
                        <React.Fragment key={index}>
                          <td
                            key={`name_${index}`}
                            style={{
                              backgroundColor: "#fff0",
                              fontWeight: "600",
                            }}
                            className="text-start"
                          >
                            <span>{Loan.seven_day_amt}</span>
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-md-6 my-3 mx-5">
            <div className={showDetails ? "col-md-12 d-flex pnr" : "dnone"}>
              <div className="col-md-4 text-center">
                <label>
                  <b style={{ fontWeight: "700" }}>Withdraw Article</b>
                </label>
                <br />
                <select
                  style={{ margin: "5px 5px", width: "90%" }}
                  value={artDetail}
                  onChange={handleArticle}
                >
                  <option value="" disabled>
                    -- Select --
                  </option>
                  <option value="adv">Advance</option>
                  <option value="rall">Release All</option>
                  {artt.map((arttt, index) => (
                    <option
                      key={index}
                      value={arttt.id}
                      style={{
                        color: arttt.drop_stus === "yes" ? "red" : "black",
                      }}
                      disabled={arttt.drop_stus === "yes"}
                    >
                      {arttt.arti} ({arttt.grm}grm)
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4 text-center">
                <label>
                  <b style={{ fontWeight: "700" }}>Amount</b>
                </label>
                <br />
                <NumericInput
                  id="amount"
                  name="amount"
                  value={paymentAmount}
                  style={{ margin: "5px 5px", width: "90%", padding: "6px" }}
                  onChange={handleAmountChange}
                />
              </div>
              <div
                className="col-md-4 text-center"
                style={{ marginTop: "2.5%" }}
              >
                <button className="btn btn-primary" onClick={handlePayment}>
                  {buttonText}
                </button>
              </div>
            </div>
            <div
              style={{
                color: "red",
                backgroundColor: "white",
                fontSize: "20px",
                border: "1px solid",
                borderColor: "salmon",
                height: "50px",
                paddingTop: "8px",
                paddingLeft: "30px",
              }}
              className={
                showDetails ? "col-md-10 d-flex m-3 py-2 ps-2" : "dnone"
              }
            >
              {totamt !== 0 ? (
                <>
                  <span
                    className={showDetails ? "col-md-4 text-start" : "dnone"}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {timeDifference}
                  </span>
                  <span
                    className={showDetails ? "col-md-2 text-center" : "dnone"}
                  >
                    interest: {int}
                  </span>
                  <span
                    className={showDetails ? "col-md-3 text-center" : "dnone"}
                  >
                    Total Paid: {totamt}
                  </span>
                  <span
                    className={showDetails ? "col-md-3 text-center" : "dnone"}
                  >
                    Total due: {total}
                  </span>
                </>
              ) : (
                <>
                  <span
                    className={showDetails ? "col-md-4 text-start" : "dnone"}
                  >
                    {timeDifference}
                  </span>
                  <span
                    className={showDetails ? "col-md-4 text-center" : "dnone"}
                  >
                    interest: {int}
                  </span>
                  <span
                    className={showDetails ? "col-md-4 text-center" : "dnone"}
                  >
                    Total due: {total}
                  </span>
                </>
              )}
              <button
                className={showDetails2 ? "btn btn-primary ms-3" : "dnone"}
                onClick={handlePayment1}
                style={{ whiteSpace: "nowrap", paddingBottom: "30px" }}
              >
                Change Date
              </button>
            </div>
            <div
              className={showDetails1 ? "col-md-11 mb-5" : "dnone"}
              style={{ fontSize: "18px" }}
            >
              {payy.map((Pay, index) => {
                const date = new Date(Pay.paid_date);
                const dateString = date.toLocaleDateString("en-GB"); // Adjust the locale as needed
                return (
                  <table
                    key={index}
                    className="table table-bordered bg-light text-center m-3"
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                          colSpan="8"
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-around",
                            }}
                          >
                            <div
                              style={{ marginLeft: "40%", marginRight: "35%" }}
                            >
                              <b>Payment Receipt</b>
                            </div>
                            <div>
                              <button
                                className="btn"
                                style={{
                                  paddingTop: "0px",
                                  paddingBottom: "0px",
                                }}
                                onClick={() => handleDeletePayment(index)}
                              >
                                <b style={{ fontSize: "larger" }}>&times;</b>
                              </button>
                            </div>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                        >
                          <b>Si.no</b>
                        </td>
                        <td
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                        >
                          <b>Date</b>
                        </td>
                        <td
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                        >
                          <b>Withdraw</b>
                        </td>
                        <td
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                        >
                          <b>Article</b>
                        </td>
                        <td
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                        >
                          <b>Weight</b>
                        </td>
                        <td
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                        >
                          <b>Amount</b>
                        </td>
                        <td
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                        >
                          <b>Interest</b>
                        </td>
                        <td
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                        >
                          <b>Total</b>
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                        >
                          {index + 1}
                        </td>
                        <td
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                        >
                          {dateString}
                        </td>
                        <td
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                        >
                          {Pay.article}
                        </td>
                        <td
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                        >
                          {Pay.article}
                        </td>
                        <td
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                        >
                          {Pay.weight}
                        </td>
                        <td
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                        >
                          {Pay.payable_amt}
                        </td>
                        <td
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                        >
                          {Pay.interest}
                        </td>
                        <td
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                        >
                          {Pay.payable_amt}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan="8"
                          className="text-end"
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                        >
                          <b>Paid Amount : </b>
                          {Pay.paid_amt}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan="8"
                          className="text-end"
                          style={{
                            backgroundColor: "#fff0",
                            fontWeight: "400",
                          }}
                        >
                          <b>Balance Amount : </b>
                          {Pay.bal_amt}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed-bottom">
        <Footer />
      </div>
      {showPopup && (
        <div>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "8px",
                width: "575px",
              }}
              ref={popupRef}
            >
              <div className="text-end">
                <button onClick={handlePopupClose} className="btn">
                  {" "}
                  X{" "}
                </button>
              </div>
              <div
                style={{
                  color: "red",
                  backgroundColor: "white",
                  fontSize: "14px",
                  border: "4px solid",
                  borderColor: "red",
                  whiteSpace: "nowrap",
                }}
                className={
                  showDetails ? "col-md-12 d-flex py-2 ps-2 pe-2 my-2" : "dnone"
                }
              >
                {totamt !== 0 ? (
                  <>
                    <span
                      className={showDetails ? "col-md-4 text-start" : "dnone"}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {timeDifference}
                    </span>
                    <span
                      className={showDetails ? "col-md-2 text-center" : "dnone"}
                    >
                      interest: {int}
                    </span>
                    <span
                      className={showDetails ? "col-md-3 text-center" : "dnone"}
                    >
                      Total Paid: {totamt}
                    </span>
                    <span
                      className={showDetails ? "col-md-3 text-center" : "dnone"}
                    >
                      Total due: {total}
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className={showDetails ? "col-md-4 text-start" : "dnone"}
                    >
                      {timeDifference}
                    </span>
                    <span
                      className={showDetails ? "col-md-4 text-center" : "dnone"}
                    >
                      interest: {int}
                    </span>
                    <span
                      className={showDetails ? "col-md-4 text-center" : "dnone"}
                    >
                      Total due: {total}
                    </span>
                  </>
                )}
              </div>
              <div className="text-center">
                <label>
                  <b
                    style={{
                      fontWeight: "400",
                      position: "relative",
                      right: "150%",
                    }}
                  >
                    Enter the Date :{" "}
                  </b>
                </label>
                <input
                  type="date"
                  className="my-2"
                  value={selectedDate}
                  onChange={handleDateChange}
                  style={{ margin: "5px 5px", width: "90%", padding: "6px" }}
                  min={ldate1}
                />
                <button className="btn btn-primary" onClick={handleSetDate1}>
                  Set Date
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPopup1 && (
        <div>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "8px",
                width: "575px",
              }}
              ref={popupRef}
            >
              <div className="text-end">
                <button onClick={handlePopupClose} className="btn">
                  {" "}
                  X{" "}
                </button>
              </div>
              <div className="col-md-12 d-flex py-2 ps-2 pe-2 my-2">
                <NumericInput
                  id="intone"
                  name="intone"
                  value={pint}
                  style={{ margin: "5px 5px", width: "90%", padding: "6px" }}
                  onChange={handleIntoneChange}
                />
                <button
                  className="btn btn-primary"
                  style={{ whiteSpace: "nowrap" }}
                  onClick={handleIntoneChange1}
                >
                  Set Interest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PayNow;