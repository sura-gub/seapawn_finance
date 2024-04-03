import React, { useEffect, useState } from "react";
import Header from "./header";
import Header1 from "./header1";
import Footer from "./footer";
import { BsCalculatorFill } from "react-icons/bs";
import swal from "sweetalert2";

function Calc() {
  const [selectedDept, setSelectedDept] = useState("noneed");
  const [startDate, setStartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [timeDifference, setTimeDifference] = useState("");
  const [simpleInterest, setSimpleInterest] = useState();
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [showSimpleInterest, setShowSimpleInterest] = useState(false);
  const [year, setyear] = useState();
  const [month, setmonth] = useState();
  const [hmonth, sethmonth] = useState();
  const [day, setday] = useState();
  const [ninety, setNinety] = useState(0);
  const [remainingDays, setRemainingDays] = useState(0);
  const [remainingInterest, setRemainingInterest] = useState(0);
  const [ninetyInterest, setNinetyInterest] = useState(0);

  const handleDeptChange = (e) => {
    setSelectedDept(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleReturnDateChange = (e) => {
    setReturnDate(e.target.value);
  };

  const calculateTimeDifference = () => {
    if (!startDate || !returnDate) {
      swal.fire({
        title: "Warning!",
        text: "Please enter both start date and return date.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }
    const startDateTime = new Date(startDate).getTime();
    const returnDateTime = new Date(returnDate).getTime();

    if (
      !isNaN(startDateTime) &&
      !isNaN(returnDateTime) &&
      startDateTime <= returnDateTime
    ) {
      const differenceInMilliseconds = returnDateTime - startDateTime;
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
      const totalDays = Math.floor(
        differenceInMilliseconds / (24 * 60 * 60 * 1000)
      );

      setTimeDifference(` ${years} years, ${months} months, ${days} days`);
      calculateSimpleInterest(totalDays);
    } else {
      setTimeDifference(
        "Invalid dates. Please make sure the return date is after the start date."
      );
    }
  };

  const calculateSimpleInterest = (totalDays) => {
    const amountValue = parseFloat(document.getElementById("amount").value);
    const interestRateValue = parseFloat(
      document.getElementById("interest").value
    );

    if (
      isNaN(amount) ||
      isNaN(interestRate) ||
      amount <= 0 ||
      interestRate <= 0
    ) {
      setSimpleInterest(0);
      setShowSimpleInterest(false);
      swal.fire({
        title: "Warning!",
        text: "Please enter valid amount and interest rate.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    if (!isNaN(amountValue) && !isNaN(interestRateValue)) {
      if (selectedDept === "need" && totalDays > 90) {
        let updatedTotalDays = totalDays;
        const remainingDays = totalDays - 90;
        setRemainingDays(remainingDays);
        updatedTotalDays = 90;
        setNinety(updatedTotalDays);
        const currentYear = new Date().getFullYear();
        const currentYearTotalDays = getTotalDaysInYear(currentYear);
        const calculatedInterest = Math.round(
          (amountValue * interestRateValue * (updatedTotalDays * 1.0139) * 12) /
            36500
        );
        const remainingInterest = Math.round(
          (amountValue * 1.4 * (remainingDays * 1.0139) * 12) / 36500
        );
        const totalInterest = calculatedInterest + remainingInterest;
        const oneyear = Math.round(
          amountValue * ((interestRateValue / 100) * 12)
        );
        const onemonth = Math.round(amountValue * (interestRateValue / 100));
        const oneday = Math.round(
          amountValue *
            ((((interestRateValue / 100) * 12) / currentYearTotalDays) * 1.0139)
        );
        const hday = oneday * 15;
        sethmonth(hday);
        setyear(oneyear);
        setmonth(onemonth);
        setday(oneday);
        setNinetyInterest(calculatedInterest);
        setRemainingInterest(remainingInterest);
        setSimpleInterest(totalInterest);
        setShowSimpleInterest(true);
      } else {
        let updatedTotalDays = totalDays;
        if (totalDays < 15) {
          updatedTotalDays = 15;
        }
        const currentYear = new Date().getFullYear();
        const currentYearTotalDays = getTotalDaysInYear(currentYear);

        const calculatedInterest = Math.round(
          (amountValue * interestRateValue * (updatedTotalDays * 1.0139) * 12) /
            36500
        );

        const oneyear = Math.round(
          amountValue * ((interestRateValue / 100) * 12)
        );

        const onemonth = Math.round(amountValue * (interestRateValue / 100));

        const oneday = Math.round(
          amountValue *
            ((((interestRateValue / 100) * 12) / currentYearTotalDays) * 1.0139)
        );

        const hday = oneday * 15;
        sethmonth(hday);
        setyear(oneyear);
        setmonth(onemonth);
        setday(oneday);
        setRemainingDays(0);
        setNinety(0);
        setNinetyInterest(0);
        setRemainingInterest(0);
        setSimpleInterest(calculatedInterest);
        setShowSimpleInterest(true); // Show simpleInterest content
      }
    } else {
      setSimpleInterest(0);
      setShowSimpleInterest(false); // Hide simpleInterest content
    }
  };

  const getTotalDaysInYear = (year) => {
    const startDate = new Date(year, 0, 1); // January 1st of the current year
    const endDate = new Date(year + 1, 0, 1); // January 1st of the next year

    const differenceInMilliseconds = endDate - startDate;
    const totalDays1 = Math.floor(
      differenceInMilliseconds / (24 * 60 * 60 * 1000)
    );

    return totalDays1;
  };

  useEffect(() => {
    // Check if username and password are present in session storage
    const username = sessionStorage.getItem("username");
    const password = sessionStorage.getItem("password");

    if (!username || !password) {
      // Redirect to login.js if username or password is missing
      window.location.href = "/";
    }
  }, []);

  const handleNumberInput = (e) => {
    const value = e.target.value;
    const isValidInput = /^[0-9]*\.?[0-9]*$/.test(value);

    if (!isValidInput) {
      e.target.value = value.replace(/[^0-9.]/g, "");
    }

    if (e.target.id === "amount") {
      setAmount(parseFloat(e.target.value));
    } else if (e.target.id === "interest") {
      setInterestRate(parseFloat(e.target.value));
    }
  };

  return (
    <div className="bghome">
      <Header />
      <Header1 />
      <div style={{ zoom: 0.8 }} className="col-md-12 title">
        <BsCalculatorFill className="mb-2" size={22} /> Calculator
      </div>
      <div className="col-md-12 le vh-100 ms-4">
        <div className="col-md-6 my-4 lfb">
          <div className="col-md-12 d-flex mb-3 my-4">
            <div className="col-md-6">
              <label>
                <b style={{ fontWeight: "600" }}>Gold Given Date</b>
              </label>
              <input type="date" onChange={handleStartDateChange} style={{ margin: "5px 5px", width: "90%", padding: "6px" }} />
            </div>
            <div className="col-md-6">
              <label>
                <b style={{ fontWeight: "600" }}>Return Date</b>
              </label>
              <input type="date" onChange={handleReturnDateChange} style={{ margin: "5px 5px", width: "90%", padding: "6px" }} />
            </div>
          </div>
          <div className="col-md-12 d-flex mt-3">
            <div className="col-md-6">
              <label>
                <b style={{ fontWeight: "600" }}>Amount</b>
              </label>
              <input type="text" id="amount" onChange={handleNumberInput} style={{ margin: "5px 5px", width: "90%", padding: "6px" }} />
            </div>
            <div className="col-md-6">
              <label>
                <b style={{ fontWeight: "600" }}>Interest (%)</b>
              </label>
              <input type="text" id="interest" onChange={handleNumberInput} style={{ margin: "5px 5px", width: "90%", padding: "6px" }} />  
            </div>
          </div>
          <div className="col-md-12 mt-1">
            <p className="ms-2">
              If cash is not paid on time, 1.4 % interest will be charged after
              3 months
            </p>
            <div className="form-check d-flex">
              <input type="radio" className="btn-check" id="noneed" name="dept" value="noneed" checked={selectedDept === "noneed"} autoComplete="off" onChange={handleDeptChange} />
              <label className="btn btn-outline-secondary mx-4" htmlFor="noneed" >
                No Need
              </label>
              <input type="radio" className="btn-check" id="need" name="dept" value="need" checked={selectedDept === "need"} autoComplete="off" onChange={handleDeptChange} />
              <label className="btn btn-outline-secondary" htmlFor="need">
                Need
              </label>
            </div>
          </div>
          <div className="me-5 text-end">
            <button className="btn" style={{ background: "#004AAD", color: "white" }} onClick={calculateTimeDifference} >
              View
            </button>
          </div>
        </div>
        <div className="col-md-6 ms-4" style={{ zoom: "0.9" }}>
          <div className="fs-4 text-center">
            <b style={{ fontWeight: "400", marginRight: "75px" }}>
              Calculate Details
            </b>
          </div>
          <div className="col-md-10 ms-4">
            <table className="table table-bordered">
                <thead className="text-center">
                    <tr>
                        <td colSpan="2">
                            <b style={{ fontWeight: "600" }}>Amount :</b>
                            {amount} <b style={{ fontWeight: "600" }}>Interest :</b>
                            {interestRate}%
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <b style={{ fontWeight: "600" }}>Time Difference :</b>
                            {timeDifference}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <b style={{ fontWeight: "600" }}>
                                First 3 month tot days :
                            </b>
                            {ninety}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <b style={{ fontWeight: "600" }}>
                                After 3 month tot days :
                            </b>
                            {remainingDays}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <b style={{ fontWeight: "600" }}>
                                Fisrt 3 month interest with 1.2% :
                            </b>
                            {ninetyInterest}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <b style={{ fontWeight: "600" }}>
                                After 3 month interest with 1.4% :
                            </b>
                            {remainingInterest}
                        </td>
                    </tr>
                    <tr style={{ display: showSimpleInterest ? "table-row" : "none" }} >
                        <td colSpan="2">
                            <b>Amount :</b> {amount} + <b>Interest : </b>
                            {simpleInterest} = <b>Total :</b> {amount + simpleInterest}
                        </td>
                    </tr>
                </thead>
                <tbody className="text-center">
                    <tr>
                        <td colSpan="2">
                            <b style={{ fontWeight: "700", fontSize: "19px" }}>Rules</b>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <b style={{ fontWeight: "600" }}>Time Period</b>
                        </td>
                        <td>
                            <b style={{ fontWeight: "600" }}>Total Amount</b>
                        </td>
                    </tr>
                    <tr>
                        <td>1 Year</td>
                        <td>Rs.{year}</td>
                    </tr>
                    <tr>
                        <td>1 Month</td>
                        <td>Rs.{month}</td>
                    </tr>
                    <tr>
                        <td>1 Day</td>
                        <td>Rs.{day}</td>
                    </tr>
                    <tr>
                        <td>Min - 15 Days</td>
                        <td>Rs.{hmonth}</td>
                    </tr>
                </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className='fixed-bottom'>
        <Footer />
      </div>
    </div>
  );
}

export default Calc;