import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Use Link for client-side routing
import { FaHome, FaDoorOpen, FaUsers, FaCogs,FaMoneyBillWave } from "react-icons/fa";
import { FaTicket, FaCreditCard,  FaSitemap } from "react-icons/fa6";
import { IoIosPeople } from "react-icons/io";
import { BsCalculatorFill } from "react-icons/bs";
import mn from './../img/menu-bar.png';
function Header1() {
  const iconStyle = {
    marginBottom: '3px', // Add margin bottom for the icons
  };
  const largerIconStyle = {
    ...iconStyle,
    fontSize: '1.2em', // Adjust the font size to make it slightly bigger
  };
    const linkStyle = {
        display: 'block',
        padding: '5px 5px',
        textShadow: 'none',
        letterSpacing: '0.5px',
        fontWeight: '550',
        textTransform: 'capitalize',
        textDecoration: 'none',
        color: 'black',
        margin: '5px 5px',
      };
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
      const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
      };
      const userType = sessionStorage.getItem('userType');
    return(
      <nav className={`navbar ${mobileMenuOpen ? 'mobile-menu-open' : ''}`} style={{ padding: '0.1%' }}>
      <img src={mn} width={'30px'} height={'30px'} className='mn' onClick={toggleMobileMenu} alt="Menu" />
      <ul className={`nav-list ${mobileMenuOpen ? 'mobile-menu' : ''}`} style={{ marginBottom: '0px', paddingLeft: '40px' }}>
        {userType === 'admin' && (
          <>
          <li className="nav-item">
            <Link to="/home" className="nav-link" style={{ padding: '0px 7px', color: 'rgb(84, 75, 122)' }}><FaHome style={iconStyle} /> Home </Link>
          </li>
        <li className="nav-item">
          <Link to="/loan" className="nav-link" style={{padding: '0px 7px',color: 'rgb(84, 75, 122)'}}><FaDoorOpen style={iconStyle} /> New Loan Entry </Link>
        </li>
        <li className="nav-item">
          <span className="nav-link" style={{padding: '0px 7px',cursor: 'pointer'}}><span style={{color: 'rgb(84, 75, 122)'}}><FaUsers style={iconStyle} /> Customers</span>
          <ul className="sub-menu" style={{marginLeft: '-30px',marginTop: '6px',paddingLeft: '0px',zIndex:'1059'}}>
              <li><Link to="/activecust" style={linkStyle}>Active Customer Details</Link></li>
              <li><Link to="/ccust" style={linkStyle}>Closed Customer</Link></li>
              <li><Link to="/allcust" style={linkStyle}>All Customer</Link></li>
            </ul>
          </span>
        </li>
        <li className="nav-item">
          <span className="nav-link" style={{padding: '0px 7px',cursor: 'pointer'}}><span style={{color: 'rgb(84, 75, 122)'}}><FaCreditCard style={iconStyle} /> Advance and Release</span>
            <ul className="sub-menu" style={{marginTop: '6px',paddingLeft: '0px',zIndex:'1059'}}>
              <li><Link to="/paynow" style={linkStyle}>Pay now</Link></li>
              <li><Link to="/payrep" style={linkStyle}>Payment Report</Link></li>
              <li><Link to="/outrep" style={linkStyle}>Outstanding Report</Link></li>
            </ul>
          </span>
        </li>
        <li className="nav-item">
          <span className="nav-link" style={{padding: '0px 7px',cursor: 'pointer'}}><span style={{color: 'rgb(84, 75, 122)'}}><FaCogs style={iconStyle} /> Settings</span>
            <ul className="sub-menu" style={{marginLeft: '-30px',marginTop: '6px',paddingLeft: '0px'}}>
              <li><Link to="/artlist" style={linkStyle}>Set Details of Articles</Link></li>
              <li><Link to="/intset" style={linkStyle}>Interest Settings</Link></li>
              <li><Link to="/compdet" style={linkStyle}>Set Company Details</Link></li>
              <li><Link to="/changepass" style={linkStyle}>Set Password</Link></li>
              <li><Link to="/openbal" style={linkStyle}>First Opening-Balance</Link></li>
            </ul>
          </span>
        </li>
        <li className="nav-item">
          <span className="nav-link" style={{padding: '0px 7px',cursor: 'pointer'}}><span style={{color: 'rgb(84, 75, 122)'}}><FaTicket style={iconStyle} /> Income/Expense</span>
            <ul className="sub-menu" style={{marginLeft: '-20px',marginTop: '6px',paddingLeft: '0px'}}>
              <li><Link to="/inexp" style={linkStyle}>Add Income/Expense</Link></li>
              <li><Link to="/voucher" style={linkStyle}>Day/Month Book Diary</Link></li>
            </ul>
          </span>
        </li>
        <li className="nav-item">
          <Link to="/examt" className="nav-link" style={{padding: '0px 7px',color: 'rgb(84, 75, 122)'}}><FaMoneyBillWave style={iconStyle} /> Extra Amount </Link>
        </li>
        <li className="nav-item">
          <Link to="/calc" className="nav-link" style={{padding: '0px 7px',color: 'rgb(84, 75, 122)'}}><BsCalculatorFill style={iconStyle} /> Calculator </Link>
        </li>
        <li className="nav-item">
          <Link to="/branch" className="nav-link" style={{padding: '0px 7px',color: 'rgb(84, 75, 122)'}}><FaSitemap style={iconStyle} /> Branches </Link>
        </li>
        <li className="nav-item">
          <Link to="/staff" className="nav-link" style={{padding: '0px 7px',color: 'rgb(84, 75, 122)'}}><IoIosPeople style={largerIconStyle} /> Staff </Link>
        </li>
        </>
        )}
        {userType === 'staff' && (
          <>
          <li className="nav-item">
            <Link to="/home" className="nav-link" style={{ padding: '0px 7px', color: 'rgb(84, 75, 122)' }}><FaHome style={iconStyle} /> Home </Link>
          </li>
        <li className="nav-item">
          <Link to="/loan" className="nav-link" style={{padding: '0px 7px',color: 'rgb(84, 75, 122)'}}><FaDoorOpen style={iconStyle} /> New Loan Entry </Link>
        </li>
        <li className="nav-item">
          <span className="nav-link" style={{padding: '0px 7px'}}><span style={{color: 'rgb(84, 75, 122)'}}><FaUsers style={iconStyle} /> Customers</span>
          <ul className="sub-menu" style={{paddingLeft: '0px',zIndex:'1059'}}>
              <li><Link to="/activecust" style={linkStyle}>Active Customer Details</Link></li>
              <li><Link to="/ccust" style={linkStyle}>Closed Customer</Link></li>
              <li><Link to="/allcust" style={linkStyle}>All Customer</Link></li>
            </ul>
          </span>
        </li>
        <li className="nav-item">
          <span className="nav-link" style={{padding: '0px 7px'}}><span style={{color: 'rgb(84, 75, 122)'}}><FaCreditCard style={iconStyle} /> Advance and Release</span>
            <ul className="sub-menu" style={{paddingLeft: '0px',zIndex:'1059'}}>
              <li><Link to="/paynow" style={linkStyle}>Pay now</Link></li>
              <li><Link to="/payrep" style={linkStyle}>Payment Report</Link></li>
              <li><Link to="" style={linkStyle}>Outstanding Report</Link></li>
            </ul>
          </span>
        </li>
        <li className="nav-item">
          <span className="nav-link" style={{padding: '0px 7px'}}><span style={{color: 'rgb(84, 75, 122)'}}><FaCogs style={iconStyle} /> Settings</span>
            <ul className="sub-menu" style={{paddingLeft: '0px'}}>
              <li><Link to="/artlist" style={linkStyle}>Set Details of Articles</Link></li>
              <li><Link to="/intset" style={linkStyle}>Interest Settings</Link></li>
              <li><Link to="" style={linkStyle}>Set Company Details</Link></li>
              <li><Link to="" style={linkStyle}>Set Password</Link></li>
              <li><Link to="" style={linkStyle}>First Opening-Balance</Link></li>
            </ul>
          </span>
        </li>
        <li className="nav-item">
          <span className="nav-link" style={{padding: '0px 7px'}}><span style={{color: 'rgb(84, 75, 122)'}}><FaTicket style={iconStyle} /> Income/Expense</span>
            <ul className="sub-menu" style={{paddingLeft: '0px'}}>
              <li><Link to="/inexp" style={linkStyle}>Add Income/Expense</Link></li>
              <li><Link to="" style={linkStyle}>Day/Month Book Diary</Link></li>
            </ul>
          </span>
        </li>
        <li className="nav-item">
          <Link to="/examt" className="nav-link" style={{padding: '0px 7px',color: 'rgb(84, 75, 122)'}}><FaMoneyBillWave style={iconStyle} /> Extra Amount </Link>
        </li>
        <li className="nav-item">
          <Link to="/calc" className="nav-link" style={{padding: '0px 7px',color: 'rgb(84, 75, 122)'}}><BsCalculatorFill style={iconStyle} /> Calculator </Link>
        </li>
        <li className="nav-item">
          <Link to="" className="nav-link" style={{padding: '0px 7px',color: 'rgb(84, 75, 122)'}}><FaSitemap style={iconStyle} /> Branches </Link>
        </li>
        <li className="nav-item">
          <Link to="" className="nav-link" style={{padding: '0px 7px',color: 'rgb(84, 75, 122)'}}><IoIosPeople style={largerIconStyle} /> Staff </Link>
        </li>
        </>
        )}
      </ul>
    </nav>
    );
}
export default Header1;