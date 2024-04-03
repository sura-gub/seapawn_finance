import React, { useEffect, useState } from 'react';
import Header from './header';
import Header1 from './header1';
import aboutimg from './../img/about.png';
import { Link } from 'react-router-dom';
import Footer from './footer';
import API from '../api/API';

function Home() {
    const [companyName, setCompanyName] = useState('');

    useEffect(() => {
        const username = sessionStorage.getItem('username');
        const password = sessionStorage.getItem('password');

        if (!username || !password) {
            window.location.href = '/login';
        }

        fetchCompanyDetails();
    }, []);

    const fetchCompanyDetails = async () => {
        try {
            const response = await fetch(API.companyDetails);

            if (response.ok) {
                const companyDetails = await response.json();

                if (companyDetails && companyDetails.name) {
                    const storedUsername = companyDetails.name;
                    const formattedUsername = storedUsername.replace(/\b\w/g, (char) => char.toUpperCase());
                    setCompanyName(formattedUsername);
                } else {
                    console.error('Error fetching company details: Invalid response format');
                }
            } else {
                console.error('Error fetching company details:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching company details:', error);
        }
    };

    useEffect(() => {
        // Remove scrollbar from the page
        document.body.style.overflow = 'hidden';

        // Re-enable scrolling when the component unmounts
        return () => {
            document.body.style.overflow = 'visible';
        };
    }, []);

    return (
        <div className='bghome'>
            <Header />
            <Header1 />
            <div className='container'>
                <h2 style={{fontSize: '25px', marginBottom: '5px', marginTop: '20px', fontWeight: '450'}}>Welcome to {companyName && <span>{companyName}</span>}</h2>
                <p className='txt3'>Welcome to {companyName && <span>{companyName}</span>}, your trusted partner in navigating the vast seas of finance. At {companyName && <span>{companyName}</span>}, we understand that your financial journey is as unique as the waves that shape the ocean. Whether you're a seasoned investor seeking new opportunities or just setting sail on your financial voyage, our mission is to provide you with the tools, insights, and guidance you need to navigate confidently.</p>
            </div>
            <div className='container col-md-12 welmg1 vh-100'>
                <div className='col-md-5'>
                    <svg  xmlns="http://www.w3.org/2000/svg" style={{ left: '20px',top: '120px', position: 'absolute', zIndex: '0' }} width="600" height="550" viewBox="0 0 200 200" className="svflt">
                        <defs>
                            <radialGradient id="rgrad" cx="50%" cy="50%" r="50%" >
                                <stop offset="0%" style={{stopColor: 'whitesmoke',stopOpacity:'1.00'}} />
                                <stop offset="100%" style={{stopColor: 'lightgray',stopOpacity:'1.00'}} />
                            </radialGradient>
                        </defs>
                        <path  d="M37.7,-15.4C44.8,9.8,43.9,34.4,28.7,47.3C13.5,60.2,-16,61.3,-33.8,48C-51.7,34.7,-57.9,6.9,-50.4,-18.8C-42.8,-44.5,-21.4,-68.2,-3.1,-67.2C15.3,-66.2,30.5,-40.6,37.7,-15.4Z" transform="translate(100 100)" stroke="none" fill="#F2F4F8" />
                    </svg>
                    <img src={aboutimg} alt='' className='welmg' style={{ position: 'relative', zIndex: '1' }} />
                </div>
                <div className='col-md-7'>
                    <h5 style={{fontSize: '25px', fontWeight: '600', color: '#3274c4'}}>{companyName && <span>{companyName}-Finance</span>}<hr /></h5>
                    <p className='txt3'>Certainly! Crafting a compelling slogan for a gold loan finance website like {companyName && <span>{companyName}</span>} is crucial for attracting customers and conveying the essence of your services. Here's a suggestion:</p>
                    <p className='txt3'>"At {companyName && <span>{companyName}</span>} Finance, Your Golden Dreams Take Flight! Unlock the Power of Your Precious Possessions with Swift and Secure Gold Loans. Navigate the Seas of Financial Freedom as We Pledge to Make Your Journey Smooth. {companyName && <span>{companyName}</span>}: Where Trust Meets Treasure, and Your Gold Finds Its True Value. Dive into a World of Confidence, Sail with {companyName && <span>{companyName}</span>} Finance!"</p>                    
                    <p className='txt3'>Feel free to customize it to better fit the tone and message you want to convey on your website.</p>
                    <ul style={{marginLeft: '-13px'}}>
                        <li><span className='txt3'>"{companyName && <span>{companyName}</span>}: Your Compass in the Sea of Finance."</span></li>
                    </ul>
                    <Link to="/loan" style={{textDecoration: 'none'}}><button className="Btna">
                        <svg viewBox="0 0 576 512" height="1em" className="logoIcon"><path d="M309 106c11.4-7 19-19.7 19-34c0-22.1-17.9-40-40-40s-40 17.9-40 40c0 14.4 7.6 27 19 34L209.7 220.6c-9.1 18.2-32.7 23.4-48.6 10.7L72 160c5-6.7 8-15 8-24c0-22.1-17.9-40-40-40S0 113.9 0 136s17.9 40 40 40c.2 0 .5 0 .7 0L86.4 427.4c5.5 30.4 32 52.6 63 52.6H426.6c30.9 0 57.4-22.1 63-52.6L535.3 176c.2 0 .5 0 .7 0c22.1 0 40-17.9 40-40s-17.9-40-40-40s-40 17.9-40 40c0 9 3 17.3 8 24l-89.1 71.3c-15.9 12.7-39.5 7.5-48.6-10.7L309 106z"></path></svg>
                        Apply Loan
                    </button></Link>
                </div>                
            </div>
            <Footer />
        </div>
    );
}

export default Home;
