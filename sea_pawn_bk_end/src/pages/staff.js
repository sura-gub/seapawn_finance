import React, { useEffect,useState } from 'react';
import Header from './header';
import Header1 from './header1';
import Footer from './footer';
import { IoIosPeople } from 'react-icons/io';
import { FaEye } from "react-icons/fa";
import swal from 'sweetalert2';
import API from '../api/API';  // Import the new api.js

function Staff() {

    const [nextStaffId, setNextStaffId] = useState('');
    const [staffs, setStaffs] = useState([]);
    const [branches, setBranches] = useState([]);
    const [editedStaff, setEditedStaff] = useState({
      paswd: '',
      plce: '',
      addr: '',
      contno: '',
      name: '',
      doj: '',
      salry: '',
      brch_id: '',
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Adjust as needed

  useEffect(() => {
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

    fetchBranches();
    fetchStaffs();
  }, );

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

  const fetchStaffs = async () => {
    try {
      const response = await fetch(API.getStaffs);
      if (response.ok) {
        const staffsData = await response.json();
        // Exclude the first entry (admin) when finding the last staff
        const nonAdminStaffs = staffsData.filter(staff => staff.us_nm !== 'admin');
        const lastStaff = nonAdminStaffs[nonAdminStaffs.length - 1];
        const lastStaffId = lastStaff ? lastStaff.us_nm : 0;
        setNextStaffId(generateNextStaffId(lastStaffId));
        setStaffs(nonAdminStaffs);
      } else {
        console.error('Failed to fetch staff');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };
  const indexOfLastItem = currentPage * itemsPerPage;
   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
   const currentItems = staffs.slice(indexOfFirstItem, indexOfLastItem);

    // Logic to render page numbers
    const visiblePageNumbers = [];
    for (
        let i = Math.max(1, currentPage - 1);
        i <= Math.min(currentPage + 1, Math.ceil(staffs.length / itemsPerPage));
        i++
    ) {
        visiblePageNumbers.push(i);
    }

    // Function to handle page change
    const handleClick = (event, pageNumber) => {
        event.preventDefault();
        setCurrentPage(pageNumber);
    };

  const generateNextStaffId = (lastStaffId) => {
    const numericPart = lastStaffId.replace(/[^\d]/g, '');
    const nextNumericPart = String(Number(numericPart) + 1).padStart(numericPart.length, '0');
    const prefix = lastStaffId.replace(/\d/g, '');
    return `${prefix}${nextNumericPart}`;
  };

  const handleSave = async () => {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const staffData = {
        us_nm: document.getElementsByName('sid')[0].value,
        paswd: document.getElementsByName('lp')[0].value,
        plce: document.getElementsByName('plc')[0].value,
        addr: document.getElementsByName('addr')[0].value,
        contno: document.getElementsByName('cno')[0].value,
        name: document.getElementsByName('snm')[0].value,
        doj: document.getElementsByName('doj')[0].value,
        salry: document.getElementsByName('slry')[0].value,
        brch_id: document.getElementsByName('brh')[0].value,
        active_dactive: 'active',
        dept: 'staff',
        dte: currentDate,
        ln_no: '',
        off_no: '',
        licence: '',
    };

    const fieldNamesMap = {
      name: 'Staff Name',
      plce: 'Place',
      addr: 'Address',
      contno: 'Contact',
      salry: 'Salary',
  };

  const requiredFields = ['paswd', 'plce', 'addr', 'contno', 'name', 'doj', 'salry'];
  const validationErrors = [];

  const isAnyFieldEmpty = requiredFields.some(field => {
      const fieldValue = staffData[field];

      if (['name'].includes(field)) {
          if (/[^a-zA-Z]/.test(fieldValue)) {
              validationErrors.push(`${fieldNamesMap[field]} cannot have numbers.`);
              return true;
          }
      }

      if (['plce'].includes(field)) {
          if (/[^a-zA-Z]/.test(fieldValue)) {
              validationErrors.push(`${fieldNamesMap[field]} should have only alphanumeric characters.`);
              return true;
          }
      }

      if (field === 'contno') {
          if (!/^[6-9]\d{9}$/.test(fieldValue)) {
              validationErrors.push(`${fieldNamesMap[field]} should be a 10-digit number starting from 6-9.`);
              return true;
          }
      }

      if (!fieldValue) {
          validationErrors.push(`All values needed to store the Staff entry.`);
          return true;
      }

      return false;
  });

  if (isAnyFieldEmpty) {
      // Show error notifications for each validation error
      validationErrors.forEach(error => {
          swal.fire({
              title: 'Error!',
              text: error,
              icon: 'error',
              confirmButtonText: 'OK'
          });
      });
      return; // Stop further execution if any field is empty or invalid
  }

    try {
        const response = await fetch(API.addStaff, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(staffData),
        });

        if (response.ok) {
            swal.fire({
                title: 'Success!',
                text: 'Staff added successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                // Reload the page
                window.location.reload();
            });
            console.log('Staff added successfully');
        } else {
            const errorResponse = await response.json();
            console.error('Failed to add Staff:', errorResponse);
        }
    } catch (error) {
        console.error('Error adding Staff:', error);
    }
  };

  const [selectedStaff, setSelectedStaff] = useState(null);

  const handleViewDetails = async (staffId) => {
    try {
      // Find the staff with the clicked ID
      const clickedStaff = staffs.find((staff) => staff.us_nm === staffId);
  
      // Fetch branch details for the selected staff's branch ID
      const branchResponse = await fetch(`${API.getBranch}/${clickedStaff.brch_id}`);
      if (branchResponse.ok) {
        const branchData = await branchResponse.json();
        const formattedDOJ = new Date(clickedStaff.doj).toLocaleDateString();
        console.log(formattedDOJ);

        // Update the selectedStaff with branch details and formatted date
        setSelectedStaff({
          ...clickedStaff,
          id: clickedStaff.us_nm, // Add this line to set the 'id' property
          branchDetails: `${branchData.brch_code} - ${branchData.brch_nm}`,
          doj: formattedDOJ,
        });
        
      } else {
        console.error('Failed to fetch branch details');
      }
    } catch (error) {
      console.error('Error fetching staff or branch details:', error);
    }
  };

  const handleNumberInput = (e) => {
    const value = e.target.value;
    const isValidInput = /^[0-9]*\.?[0-9]*$/.test(value);

    if (!isValidInput) {
      e.target.value = value.replace(/[^0-9.]/g, '');
    }
  };

  const handleStatusChange = async (staffId, newStatus) => {    
    try {
        const response = await fetch(`${API.updateStaffStatus}/${staffId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ active_dactive: newStatus }),
          });
  
          if (response.ok) {
              swal.fire({
              title: 'Success!',
              text: 'Status updated successfully', // Assuming the server sends a 'message' field in the response
              icon: 'success',
              confirmButtonText: 'OK'
          }).then(() => {
              // Reload the page
              window.location.reload();
          });
            console.log('Status updated successfully');
          } else {
            console.error('Failed to update status');
          }
        } catch (error) {
            console.error('Error updating/deleting branch:', error);
          }
        };

  // Function to handle edit/delete option click
  const handleActionOptionClick = (staffId, mode) => {
    // setSelectedStaffIdForAction(staffId);
    // setActionMode(mode);

    // Add logic for showing a confirmation dialog for delete
    if (mode === 'delete') {
      swal.fire({
        title: 'Delete Confirmation',
        text: 'Are you sure you want to delete this staff?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
      }).then((result) => {
        if (result.isConfirmed) {
          // Call the function to handle staff deletion
          handleDeleteStaff(staffId);
        } else {
          // Reset the selected staff
          setSelectedStaff(null);
          window.location.reload();        
        }
      });
    }
    else 
    {
      handleEditClick(staffId);
    }
  };

  // Function to handle staff deletion
  const handleDeleteStaff = async (staffId) => {
    try {
      const response = await fetch(`${API.deleteStaff}/${staffId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        swal.fire({
          title: 'Deleted!',
          text: 'Staff has been deleted.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          // Reload the page
          window.location.reload();
        });
      } else {
        console.error('Failed to delete staff');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  // Function to handle edit option click
  const handleEditClick = (staffId) => {
    // Find the staff with the clicked ID
    const clickedStaff = staffs.find((staff) => staff.us_nm === staffId);
    
    // Populate the editedStaff state with the details of the selected staff
    setEditedStaff({
      paswd: clickedStaff.paswd,
      plce: clickedStaff.plce,
      addr: clickedStaff.addr,
      contno: clickedStaff.contno,
      name: clickedStaff.name,
      doj: clickedStaff.formattedDOJ,
      salry: clickedStaff.salry,
      brch_id: clickedStaff.brch_id,
    });

    // Open the edit modal
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
  
    // Validation logic
    const validationErrors = [];
  
    if (!value.trim()) {
      validationErrors.push('All values must be filled.');
    }
  
    if (['name'].includes(name)) {
      if (/[^a-zA-Z]/.test(value)) {
        validationErrors.push('Staff Name cannot have numbers.');
      }
    }
  
    if (['plce'].includes(name)) {
      if (/[^a-zA-Z]/.test(value)) {
        validationErrors.push('Place should have only alphanumeric characters.');
      }
    }
  
    if (name === 'contno') {
      if (!/^[6-9]\d{9}$/.test(value)) {
        validationErrors.push('Contact Number should be a 10-digit number starting from 6-9.');
      }
    }
  
    // Add more validation rules as needed
    // Show error notifications for each validation error
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        swal.fire({
          title: 'Error!',
          text: error,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      });
      return; // Stop further execution if any validation error
    }
  
    // If validation passes, update the state
    setEditedStaff((prevEditedStaff) => ({
      ...prevEditedStaff,
      [name]: value,
    }));
  };  

  // Function to handle edit form submission
  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`${API.updateStaff}/${selectedStaff.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedStaff),
      });

      if (response.ok) {
        swal.fire({
          title: 'Success!',
          text: 'Staff details updated successfully',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          // Reload the page
          window.location.reload();
        });
      } else {
        console.error('Failed to update staff details');
      }
    } catch (error) {
      console.error('Error updating staff details:', error);
    }

    // Close the edit modal
    setIsEditModalOpen(false);
  };

  const handlePopupClose = () => {
    setIsEditModalOpen(false);
    refreshPage();
  };

  const refreshPage = () => {
    window.location.reload();
  };

    return (
        <div className='bghome'>
            <Header />
            <Header1 />
            <div style={{zoom: 0.8}} className='col-md-12 title'>
                <IoIosPeople className='mb-1' size={25} /> Add Staff
            </div>
            <div className='col-md-11 le' style={{ zoom: 0.8 }}>
                <div className='col-md-5 mx-4 my-4 lfb'>
                    <div className='col-md-12 d-flex mb-3'>
                        <div className='col-md-6 ms-4'>
                            <label>
                                <b style={{ fontWeight: '600' }}>Staff User ID</b>
                            </label>
                            <br />
                            <input type='text' style={{ margin: '5px 5px', width: '90%', padding: '6px' }} name='sid' value={nextStaffId ? nextStaffId: 'STF0001'} readOnly />
                        </div>
                        <div className='col-md-6'>
                            <label>
                                <b style={{ fontWeight: '600' }}>Login Password</b>
                            </label>
                            <br />
                            <input type='password' style={{ margin: '5px 5px', width: '90%', padding: '6px' }} name='lp' />
                        </div>
                    </div>
                    <div className='col-md-12 d-flex mb-3'>
                        <div className='col-md-6 ms-4'>
                            <label>
                                <b style={{ fontWeight: '600' }}>Staff Name</b>
                            </label>
                            <br />
                            <input type='text' style={{ margin: '5px 5px', width: '90%', padding: '6px' }} name='snm' />
                        </div>
                        <div className='col-md-6'>
                            <label>
                                <b style={{ fontWeight: '600' }}>Contact Number</b>
                            </label>
                            <br />
                            <input type='text' style={{ margin: '5px 5px', width: '90%', padding: '6px' }} name='cno' onChange={handleNumberInput} />
                        </div>
                    </div>
                    <div className='col-md-12 d-flex mb-3'>
                        <div className='col-md-6 ms-4'>
                            <label>
                                <b style={{ fontWeight: '600' }}>Place</b>
                            </label>
                            <br />
                            <input type='text' style={{ margin: '5px 5px', width: '90%', padding: '6px' }} name='plc' />
                        </div>
                        <div className='col-md-6'>
                            <label>
                                <b style={{ fontWeight: '600' }}>Address</b>
                            </label>
                            <br />
                            <textarea style={{ margin: '5px 5px', width: '90%', padding: '6px' }} rows='3' name='addr'></textarea>
                        </div>
                    </div>
                    <div className='col-md-12 d-flex mb-3'>
                        <div className='col-md-6 ms-4'>
                            <label>
                                <b style={{ fontWeight: '600' }}>Date of Joining</b>
                            </label>
                            <br />
                            <input type='date' style={{ margin: '5px 5px', width: '90%', padding: '6px' }} name='doj' />
                        </div>
                        <div className='col-md-6'>
                            <label>
                                <b style={{ fontWeight: '600' }}>Salary</b>
                            </label>
                            <br />
                            <input type='text' style={{ margin: '5px 5px', width: '90%', padding: '6px' }} name='slry' onChange={handleNumberInput} />
                        </div>
                    </div>
                    <div className='col-md-12 d-flex mb-3'>
                        <div className='col-md-6 ms-4'>
                            <label>
                                <b style={{ fontWeight: '600' }}>Branch</b>
                            </label>
                            <br />
                            <select name='brh' style={{ margin: '5px 5px', width: '90%', padding: '6px' }}>
                                {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>{branch.brch_code}-{branch.brch_nm}</option>))}
                            </select>
                        </div>
                        <div className='col-md-6 text-center mt-4' style={{marginLeft: '14%'}}>
                            <button className='btn' style={{ background: '#004AAD', color: 'white', padding: '6px 20px' }} onClick={handleSave} > Save </button>
                        </div>
                    </div>
                </div>
                <div className='col-md-7'>
                    <div className='col-md-12 mt-4 m-5 mx-5'>
                        <table className='table table-bordered bg-light text-center'>
                        <thead>
                            <tr>
                            <td style={{ background: '#1c6fb7',color:'white' }}>SI.No</td>
                            <td style={{ whiteSpace: 'nowrap', background: '#1c6fb7',color:'white' }}>Staff Name</td>
                            <td style={{ whiteSpace: 'nowrap', background: '#1c6fb7',color:'white' }}>User ID</td>
                            <td style={{ background: '#1c6fb7',color:'white' }}>Contact</td>                            
                            <td style={{ background: '#1c6fb7',color:'white' }}>Status</td>
                            <td style={{ background: '#1c6fb7',color:'white' }}>View More</td>
                            </tr>
                        </thead>
                        <tbody style={{ background: 'transparent', verticalAlign: 'middle' }}>
                            {currentItems.map((staff, index) => (
                                <tr key={index}>
                                    <td style={{ background: '#fff0' }}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td style={{ background: '#fff0' }}>{staff.name}</td>
                                    <td style={{ background: '#fff0' }}>{staff.us_nm}</td>
                                    <td style={{ background: '#fff0' }}>{staff.contno}</td>
                                    <td style={{ background: '#fff0', padding: '0rem 0.7rem' }}>
                                        {staff.active_dactive.toUpperCase()}<br />
                                        <select style={{ margin: '5px', padding: '2px' }} onChange={(e) => handleStatusChange(staff.id, e.target.value)}>
                                            <option value={staff.active_dactive}>-- Status --</option>
                                            <option value='active'>Active</option>
                                            <option value='deactive'>Deactive</option>
                                        </select>
                                    </td>
                                    <td style={{ background: '#fff0' }}><FaEye size={20} style={{cursor: 'pointer'}} onClick={() => handleViewDetails(staff.us_nm)} /></td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    <div className='text-center mt-2'>
                        {currentPage > 1 && (
                            <button onClick={(e) => handleClick(e, currentPage - 1)} className='mx-1 btn'>
                                Previous
                            </button>
                        )}
                        {visiblePageNumbers.map(number => (
                            <button key={number} onClick={(e) => handleClick(e, number)} className={`mx-1 btn ${number === currentPage ? 'active' : ''}`}>
                                {number}
                            </button>
                        ))}
                        {currentPage < Math.ceil(staffs.length / itemsPerPage) && (
                            <button onClick={(e) => handleClick(e, currentPage + 1)} className='mx-1 btn'>
                                Next
                            </button>
                        )}
                    </div>
                    </div>
                </div>
            </div>
            {selectedStaff && (
                <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',}} >
                    <div style={{background: '#fff', padding: '20px', borderRadius: '8px', width: '400px',}} >
                      <div className="modal-header1">
                        <b>Staff Details</b>
                        <button onClick={() => setSelectedStaff(null)} style={{ position: 'relative', left: '32%'}} className='btn close-button'>X</button>
                      </div>                        
                        <table className='table'>
                            <tbody>
                                <tr>
                                    <td>Name</td>
                                    <td>{selectedStaff.name}</td>
                                </tr>
                                <tr>
                                    <td>User ID</td>
                                    <td>{selectedStaff.us_nm}</td>
                                </tr>
                                <tr>
                                    <td>Passcode</td>
                                    <td>{selectedStaff.paswd}</td>
                                </tr>
                                <tr>
                                    <td>Mobile</td>
                                    <td>{selectedStaff.contno}</td>
                                </tr>
                                <tr>
                                    <td>Place</td>
                                    <td>{selectedStaff.plce}</td>
                                </tr>
                                <tr>
                                    <td>Address</td>
                                    <td>{selectedStaff.addr}</td>
                                </tr>
                                <tr>
                                    <td>DOJ</td>
                                    <td>{selectedStaff.doj}</td>
                                </tr>
                                <tr>
                                    <td>Salary</td>
                                    <td>{selectedStaff.salry}</td>
                                </tr>
                                <tr>
                                    <td>Branch</td>
                                    <td>{selectedStaff.branchDetails}</td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Actions</td>
                                    <td>
                                      <select style={{ margin: '5px', padding: '2px' }} onChange={(e) => handleActionOptionClick(selectedStaff.id, e.target.value)}>
                                        <option value='0'>-- Actions --</option>
                                        <option value='edit'>Edit</option>
                                        <option value='delete'>Delete</option>
                                      </select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {isEditModalOpen && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '400px', }}>
                  <form>
                    <div className='mb-3 modal-header1'>
                      <label><b>Edit Staff Details</b></label>                      
                      <button onClick={() => handlePopupClose()} className='btn' style={{position: 'relative', left: '25%'}} > X </button>
                    </div>
                    <div className='mb-3'>
                      <label>Name</label>
                      <input type='text' name='name' value={editedStaff.name} onChange={handleEditInputChange} />
                    </div>
                    <div className='mb-3'>
                      <label>Login Password</label>
                      <input type='password' name='paswd' value={editedStaff.paswd} onChange={handleEditInputChange} />
                    </div>
                    <div className='mb-3'>
                      <label>Mobile</label>
                      <input type='number' name='contno' value={editedStaff.contno} onChange={handleEditInputChange} />
                    </div>
                    <div className='mb-3'>
                      <label>Place</label>
                      <input type='text' name='plce' value={editedStaff.plce} onChange={handleEditInputChange} />
                    <div className='mb-3'>
                      <label>Address</label>
                      <textarea name='addr' value={editedStaff.addr} onChange={handleEditInputChange} />
                    </div>
                    <div className='mb-3'>
                      <label>Date of Joining</label>
                      <input type='date' name='doj' value={editedStaff.formattedDOJ} onChange={handleEditInputChange} />
                    </div>
                    <div className='mb-3'>
                      <label>Salary</label>
                      <input type='number' name='salry' value={editedStaff.salry} onChange={handleEditInputChange} />
                    </div>
                    <div className='mb-3'>
                      <label>Branch Name</label>
                      <select name='brch_id' value={editedStaff.brch_id} onChange={handleEditInputChange}>
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>{branch.brch_code}-{branch.brch_nm}</option>
                        ))}
                      </select>
                    </div>
                    </div>
                    <div className='text-center'>
                      <button type='button' className='btn' style={{ background: '#004AAD', color: 'white', padding: '6px 20px' }} onClick={handleEditSubmit}> Save </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            <div className='fixed-bottom'>
              <Footer />
            </div>
        </div>
    );
}

export default Staff;