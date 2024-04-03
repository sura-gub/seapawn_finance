import React, { useEffect, useState, useRef } from "react";
import Header from "./header";
import Header1 from "./header1";
import Footer from "./footer";
import { FaSitemap } from "react-icons/fa6";
import swal from "sweetalert2";
import API from '../api/API';  // Import the new api.js

function Branch() {
  const [branches, setBranches] = useState([]);
  const [nextBranchId, setNextBranchId] = useState("");
  const [updateValuePopup, setUpdateValuePopup] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [newValueInput, setNewValueInput] = useState("");
  const [newValueInput1, setNewValueInput1] = useState("");
  const [newValueInput2, setNewValueInput2] = useState("");
  const [newValueInput3, setNewValueInput3] = useState("");
  const [newValueInput4, setNewValueInput4] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Adjust as needed

  const popupRef = useRef(null);

  useEffect(() => {
    const username = sessionStorage.getItem("username");
    const password = sessionStorage.getItem("password");`
    const userType = sessionStorage.getItem("userType");
`
    if (!username || !password) {
      // Redirect to login.js if username or password is missing
      window.location.href = "/";
    }

    if (userType === "staff") {
      window.history.back();
    }

    // Fetch branches and set initial input values
    const fetchData = async () => {
      await fetchBranches();

      // Set initial input values based on selected branch data
      const selectedBranchIdFromUrl = window.location.pathname.split("/").pop();
      if (selectedBranchIdFromUrl && selectedBranchIdFromUrl !== "add") {
        const branchId = parseInt(selectedBranchIdFromUrl, 10);
        const selectedBranch = branches.find(
          (branch) => branch.id === branchId
        );
        if (selectedBranch) {
          setSelectedBranchId(selectedBranch.id);
          setNewValueInput(selectedBranch.brch_nm);
          setNewValueInput1(selectedBranch.plc);
          setNewValueInput2(selectedBranch.addr);
          setNewValueInput3(selectedBranch.contact);
          setNewValueInput4(selectedBranch.manager);
          setUpdateValuePopup(true);
        }
      }
    };

    fetchData();
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setUpdateValuePopup(false);
        refreshPage();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupRef]);

  const refreshPage = () => {
    window.location.reload();
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch(API.getBranches);
      if (response.ok) {
        const branchesData = await response.json();
        setBranches(branchesData);
        const lastBranch = branchesData[branchesData.length - 1];
        const lastBranchId = lastBranch ? lastBranch.brch_code : 0;
        setNextBranchId(generateNextBranchId(lastBranchId));
      } else {
        console.error("Failed to fetch branches");
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = branches.slice(indexOfFirstItem, indexOfLastItem);

  // Logic to render page numbers
  const visiblePageNumbers = [];
  for (
    let i = Math.max(1, currentPage - 1);
    i <= Math.min(currentPage + 1, Math.ceil(branches.length / itemsPerPage));
    i++
  ) {
    visiblePageNumbers.push(i);
  }

  // Function to handle page change
  const handleClick = (event, pageNumber) => {
    event.preventDefault();
    setCurrentPage(pageNumber);
  };

  const generateNextBranchId = (lastBranchId) => {
    const numericPart = lastBranchId.replace(/[^\d]/g, "");
    const nextNumericPart = String(Number(numericPart) + 1).padStart(
      numericPart.length,
      "0"
    );
    const prefix = lastBranchId.replace(/\d/g, "");
    return `${prefix}${nextNumericPart}`;
  };

  const handleSave = async () => {
    const branchData = {
      brch_code: document.getElementsByName("bid")[0].value,
      brch_nm: document.getElementsByName("bname")[0].value,
      plc: document.getElementsByName("plc")[0].value,
      addr: document.getElementsByName("addr")[0].value,
      contact: document.getElementsByName("cno")[0].value,
      manager: document.getElementsByName("mname")[0].value,
      sts: "active",
    };

    const fieldNamesMap = {
      brch_nm: "Branch Name",
      plc: "Place",
      addr: "Address",
      contact: "Contact",
      manager: "Manager",
    };
    const requiredFields = ["brch_nm", "plc", "addr", "contact", "manager"];
    const validationErrors = [];
    const isAnyFieldEmpty = requiredFields.some((field) => {
      const fieldValue = branchData[field];
      if (["brch_nm", "manager"].includes(field)) {
        if (/[^a-zA-Z]/.test(fieldValue)) {
          validationErrors.push(`${fieldNamesMap[field]} cannot have numbers.`);
          return true;
        }
      }
      if (["plc"].includes(field)) {
        if (/[^a-zA-Z]/.test(fieldValue)) {
            validationErrors.push(`${fieldNamesMap[field]} should have only alphanumeric characters.`);
            return true;
        }
      }
      if (field === "contact") {
        if (!/^[6-9]\d{9}$/.test(fieldValue)) {
          validationErrors.push(
            `${fieldNamesMap[field]} should be a 10-digit number starting from 6-9.`
          );
          return true;
        }
      }
      if (!fieldValue) {
        validationErrors.push(`All values needed to store the Branch entry.`);
        return true;
      }
      return false;
    });

    if (isAnyFieldEmpty) {
      // Show error notifications for each validation error
      validationErrors.forEach((error) => {
        swal.fire({
          title: "Error!",
          text: error,
          icon: "error",
          confirmButtonText: "OK",
        });
      });
      return; // Stop further execution if any field is empty or invalid
    }

    try {
      const response = await fetch(API.addBranch, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(branchData),
      });

      if (response.ok) {
        swal
          .fire({
            title: "Success!",
            text: "Branch added successfully", // Assuming the server sends a 'message' field in the response
            icon: "success",
            confirmButtonText: "OK",
          })
          .then(() => {
            // Reload the page
            window.location.reload();
          });
      } else {
        console.error("Failed to add branch");
      }
    } catch (error) {
      console.error("Error adding branch:", error);
    }
  };

  const handleStatusChange = async (branchId, newStatus) => {
    try {
      if (newStatus === "delete") {
        const shouldDelete = await swal.fire({
          title: "Are you sure?",
          text: "Do you really want to delete this branch?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel!",
        });

        if (!shouldDelete.value) {
          window.location.reload();
          return; // User canceled deletion
        }

        const response = await fetch(
          `${API.deleteBranch}/${branchId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          swal
            .fire({
              title: "Success!",
              text: "Branch deleted successfully",
              icon: "success",
              confirmButtonText: "OK",
            })
            .then(() => {
              // Reload the page
              window.location.reload();
            });
          setBranches((prevBranches) =>
            prevBranches.filter((branch) => branch.id !== branchId)
          );
        } else {
          console.error("Failed to delete branch");
        }
      } else if (newStatus === "edit") {
        // Fetch the data for the selected branch
        const response = await fetch(
          `${API.getBranch}/${branchId}`
        );
        if (response.ok) {
          const branchData = await response.json();
          setSelectedBranchId(branchData.id);
          setNewValueInput(branchData.brch_nm);
          setNewValueInput1(branchData.plc);
          setNewValueInput2(branchData.addr);
          setNewValueInput3(branchData.contact);
          setNewValueInput4(branchData.manager);
          setUpdateValuePopup(true);
        } else {
          console.error("Failed to fetch branch data for editing");
        }
      } else {
        const response = await fetch(
          `${API.updateBranchStatus}/${branchId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sts: newStatus }),
          }
        );

        if (response.ok) {
          swal
            .fire({
              title: "Success!",
              text: "Status updated successfully", // Assuming the server sends a 'message' field in the response
              icon: "success",
              confirmButtonText: "OK",
            })
            .then(() => {
              // Reload the page
              window.location.reload();
            });
          console.log("Status updated successfully");
        } else {
          console.error("Failed to update status");
        }
      }
    } catch (error) {
      console.error("Error updating/deleting branch:", error);
    }
  };

  const handleUpdateBranch = async () => {
    const isValidAlphabet = /^[a-zA-Z ]+$/.test(newValueInput) && /^[a-zA-Z ]+$/.test(newValueInput4);
    const isValidAlphanumeric = /^[a-zA-Z ]+$/.test(newValueInput1);

    if (!isValidAlphabet) {
      swal.fire({
        title: "Error!",
        text: "Branch Name and Manager should have only alphabet characters.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    if (!isValidAlphanumeric) {
      swal.fire({
        title: "Error!",
        text: "Place should have only alphabet characters.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const response = await fetch(
        `${API.updateBranch}/${selectedBranchId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newBranchName: newValueInput,
            newPlace: newValueInput1,
            newAddress: newValueInput2,
            newContact: newValueInput3,
            newManager: newValueInput4,
          }),
        }
      );

      if (response.ok) {
        swal
          .fire({
            title: "Success!",
            text: "Branch details updated successfully",
            icon: "success",
            confirmButtonText: "OK",
          })
          .then(() => {
            window.location.reload();
            setUpdateValuePopup(false);
            fetchBranches(); // Optionally, re-fetch branches after update
            refreshPage();
          });
      } else {
        console.error("Failed to update branch details");
      }
    } catch (error) {
      console.error("Error updating branch details:", error);
    }
  };

  const handleNumberInput = (e) => {
    const value = e.target.value;
    const isValidInput = /^[0-9]*\.?[0-9]*$/.test(value);

    if (!isValidInput) {
      e.target.value = value.replace(/[^0-9.]/g, "");
    }
  };

  const handleNumberInput1 = (e) => {
    let value = e.target.value;

    // Remove non-numeric characters
    value = value.replace(/[^0-9]/g, "");

    // Ensure the value starts with a digit between 6 and 9
    if (/^[6-9]/.test(value)) {
      // Update the correct state
      setNewValueInput3(value);
    } else {
      // If not valid, set an empty string (you can handle this case differently)
      setNewValueInput3("");
    }
  };

  const handlePopupClose = () => {
    setUpdateValuePopup(false);
    refreshPage();
  };

  return (
    <div className="bghome">
      <Header />
      <Header1 />
      <div style={{ zoom: 0.8 }} className="col-md-12 title">
        <FaSitemap className="mb-2" size={22} /> Add Branches
      </div>
      <div className="col-md-11 le" style={{ zoom: 0.79 }}>
        <div className="col-md-4 mx-4 my-4 lfb">
          <div className="col-md-12 d-flex mb-3">
            <div className="col-md-6">
              <label>
                <b style={{ fontWeight: "600" }}>Branch ID</b>
              </label>
              <br />
              <input
                type="text"
                style={{ margin: "5px 5px", width: "90%", padding: "6px" }}
                name="bid"
                value={nextBranchId ? nextBranchId : "BRH0001"}
                readOnly
              />
            </div>
            <div className="col-md-6">
              <label>
                <b style={{ fontWeight: "600" }}>Branch Name</b>
              </label>
              <br />
              <input
                type="text"
                style={{ margin: "5px 5px", width: "90%", padding: "6px" }}
                name="bname"
              />
            </div>
          </div>
          <div className="col-md-12 d-flex my-2">
            <div className="col-md-6">
              <label>
                <b style={{ fontWeight: "600" }}>Contact Number</b>
              </label>
              <br />
              <input
                type="text"
                style={{ margin: "5px 5px", width: "90%", padding: "6px" }}
                name="cno"
                onChange={handleNumberInput}
              />
            </div>
            <div className="col-md-6">
              <label>
                <b style={{ fontWeight: "600" }}>Place</b>
              </label>
              <br />
              <input
                type="text"
                style={{ margin: "5px 5px", width: "90%", padding: "6px" }}
                name="plc"
              />
            </div>
          </div>
          <div className="col-md-12 d-flex my-3">
            <div className="col-md-6">
              <label>
                <b style={{ fontWeight: "600" }}>Address</b>
              </label>
              <br />
              <textarea
                style={{ margin: "5px 5px", width: "90%", padding: "6px" }}
                rows="3"
                name="addr"
              />
            </div>
            <div className="col-md-6">
              <label>
                <b style={{ fontWeight: "600" }}>Manager Name</b>
              </label>
              <br />
              <input
                type="text"
                style={{ margin: "5px 5px", width: "90%", padding: "6px" }}
                name="mname"
              />
            </div>
          </div>
          <div className="mt-3 me-5 text-center">
            <button
              className="btn"
              style={{ background: "#004AAD", color: "white" }}
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
        <div className="col-md-8">
          <div className="col-md-12">
            <table className="table of table-bordered text-center bg-light m-4 mx-5">
              <thead>
                <tr>
                  <td style={{ background: "#1c6fb7", color: "white" }}>
                    SI.No
                  </td>
                  <td
                    style={{
                      whiteSpace: "nowrap",
                      background: "#1c6fb7",
                      color: "white",
                    }}
                  >
                    Branch Name
                  </td>
                  <td
                    style={{
                      whiteSpace: "nowrap",
                      background: "#1c6fb7",
                      color: "white",
                    }}
                  >
                    Branch Code
                  </td>
                  <td style={{ background: "#1c6fb7", color: "white" }}>
                    Place
                  </td>
                  <td style={{ background: "#1c6fb7", color: "white" }}>
                    Contact
                  </td>
                  <td style={{ background: "#1c6fb7", color: "white" }}>
                    Address
                  </td>
                  <td style={{ background: "#1c6fb7", color: "white" }}>
                    Manager
                  </td>
                  <td style={{ background: "#1c6fb7", color: "white" }}>
                    Status
                  </td>
                </tr>
              </thead>
              <tbody style={{ background: "transparent" }}>
                {currentItems.map((branch, index) => (
                  <tr key={index}>
                    <td style={{ background: "#fff0" }}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td style={{ background: "#fff0" }}>{branch.brch_nm}</td>
                    <td style={{ background: "#fff0" }}>{branch.brch_code}</td>
                    <td style={{ background: "#fff0" }}>{branch.plc}</td>
                    <td style={{ background: "#fff0" }}>{branch.contact}</td>
                    <td style={{ background: "#fff0" }}>{branch.addr}</td>
                    <td style={{ background: "#fff0" }}>{branch.manager}</td>
                    <td style={{ background: "#fff0" }}>
                      {branch.sts.toUpperCase()}
                      <br />
                      <select
                        style={{ margin: "5px", padding: "2px" }}
                        onChange={(e) =>
                          handleStatusChange(branch.id, e.target.value)
                        }
                      >
                        <option value={branch.sts}>-- Status --</option>
                        <option value="active">Active</option>
                        <option value="deactive">Deactive</option>
                        <option value="edit">Edit</option>
                        <option value="delete">Delete</option>
                      </select>
                    </td>
                  </tr>
                ))}
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
                  className={`mx-1 btn ${
                    number === currentPage ? "active" : ""
                  }`}
                >
                  {number}
                </button>
              ))}
              {currentPage < Math.ceil(branches.length / itemsPerPage) && (
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
      </div>
      <div className="fixed-bottom">
        <Footer />
      </div>
      {updateValuePopup && (
        <div className="popup" ref={popupRef}>
          <div className="popup-inner" style={{ margin: "0px 40px" }}>
            <button
              className="btn close-btn mb-1"
              style={{
                padding: "0px 5px",
                marginLeft: "100%",
                backgroundColor: "transparent",
                fontSize: "20px",
                color: "black",
              }}
              onClick={handlePopupClose}
            >
              &times;
            </button>
            <label>Branch Name:</label>
            <input
              type="text"
              value={newValueInput}
              onChange={(e) => setNewValueInput(e.target.value)}
              style={{ padding: "5px", marginBottom: "3px" }}
            />
            <label>Place:</label>
            <input
              type="text"
              onChange={(e) => setNewValueInput1(e.target.value)}
              value={newValueInput1}
              style={{ padding: "5px", marginBottom: "3px" }}
            />
            <label>Contact:</label>
            <input
              type="text"
              value={newValueInput3}
              onChange={handleNumberInput1}
              style={{ padding: "5px", marginBottom: "3px" }}
            />
            <label>Address:</label>
            <textarea
              style={{ padding: "5px", marginBottom: "3px" }}
              onChange={(e) => setNewValueInput2(e.target.value)}
              value={newValueInput2}
            ></textarea>
            <label>Manager:</label>
            <input
              type="text"
              value={newValueInput4}
              onChange={(e) => setNewValueInput4(e.target.value)}
              style={{ padding: "5px", marginBottom: "15px" }}
            />
            <button onClick={handleUpdateBranch}>Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Branch;