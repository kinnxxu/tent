import React from 'react';
import fineLogo from '../../assets/Fine LOGO.png';
import './about.css';

const About = () => {
  return (
    <div className="about-screen">
      <div className="container">
        <header className="page-header">
          <h1>About Fine Bearing</h1>
          <p>Excellence in Industrial Power Transmission Since 1995.</p>
        </header>
        
        <div className="content-grid">
          <div className="text-content">
            <h2>Our Legacy</h2>
            <p>Fine Bearing & Oil Seal Store has been a trusted partner for industrial enterprises across the nation. We specialize in the procurement and distribution of high-precision bearings, oil seals, and power transmission components.</p>
            
            <h2>Our Mission</h2>
            <p>To empower industrial productivity by providing high-quality, genuine components with unparalleled technical support and supply chain efficiency.</p>
            
            <div className="stats">
              <div className="stat-item"><h3>25+</h3><p>Years Experience</p></div>
              <div className="stat-item"><h3>10k+</h3><p>Products</p></div>
              <div className="stat-item"><h3>5k+</h3><p>Clients</p></div>
            </div>
          </div>
          <div className="image-content">
            <img src={fineLogo} alt="Fine Bearing Logo" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
