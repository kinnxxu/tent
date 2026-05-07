import { useLocation } from 'react-router-dom';
import { Globe, MessageCircle, MonitorPlay, Share2, Mail, Phone, MapPin } from 'lucide-react';
import fineLogo from '../../assets/Fine LOGO.png';
import './Footer.css';

const Footer = () => {
  const location = useLocation();

  if (location.pathname === '/login' || location.pathname === '/profile') return null;

  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-col">
          <div className="footer-logo">
            <img src={fineLogo} alt="Fine Bearing Logo" className="logo-image" />
          </div>
          <p className="footer-desc">
            Leading provider of premium industrial machinery, materials, and specialized tools. Quality and reliability at an international standard.
          </p>
          <div className="social-links">
            <a href="#"><Globe size={20} /></a>
            <a href="#"><MessageCircle size={20} /></a>
            <a href="#"><MonitorPlay size={20} /></a>
            <a href="#"><Share2 size={20} /></a>
          </div>
        </div>



        <div className="footer-col">
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            <li><a href="/about">About Us</a></li>
            <li><a href="/quote">Request a Quote</a></li>
            <li><a href="/brands">Our Brands</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Contact Us</h4>
          <ul className="footer-contact">
            <li><MapPin size={18} /> <span>Link Rd. Dholewal, Ludhiana, 141003</span></li>
            <li><Phone size={18} /> <span>+91-9814109761</span></li>
            <li><Mail size={18} /> <span>sales@finebearing.in</span></li>
          </ul>
        </div>

        <div className="footer-col footer-map-col">
          <h4 className="footer-heading">Our Location</h4>
          <div className="footer-map-container">
            <iframe
              src="https://maps.google.com/maps?width=100%25&amp;height=100%25&amp;hl=en&amp;q=Fine%20Bearing%20%26%20Oil%20Seal%20Store,%20Ludhiana+(Fine%20Bearing)&amp;t=&amp;z=16&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Company Location Map"
            ></iframe>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-content">
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
          <p className="made-with-love">Made with ❤️ by DANS</p>
          <div className="legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
