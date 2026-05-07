import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Clock, Award, Eye, EyeOff, MessageCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import fineLogo from '../../assets/Fine LOGO.png';
import './auth.css';

const Auth = () => {
  const navigate = useNavigate();

  // Navigation State
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      navigate('/');
    }
  }, [navigate]);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'phone'

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleModeChange = (mode) => {
    setAuthMode(mode);
    setErrorMsg('');
    setSuccessMsg('');
    setIsOtpSent(false);
  };

  // ─── Twilio: Phone OTP Login ─────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) return setErrorMsg('Please enter a valid phone number');

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('http://weekend-production-4177.up.railway.app/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsOtpSent(true);
        setSuccessMsg('OTP sent successfully!');
      } else {
        setErrorMsg(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setErrorMsg('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return setErrorMsg('Please enter the 6-digit OTP');

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('http://weekend-production-4177.up.railway.app/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', 'user');
        localStorage.setItem('isAdminAuthenticated', 'false');
        setSuccessMsg('Login successful! Redirecting...');
        setTimeout(() => window.location.href = '/', 1000);
      } else {
        setErrorMsg(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setErrorMsg('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Twilio: Phone OTP Signup ─────────────────────────────────────
  const handleSendSignupOtp = async (e) => {
    e.preventDefault();
    if (!phone) return setErrorMsg('Please enter a valid phone number');
    if (!name) return setErrorMsg('Please enter your full name');

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('http://weekend-production-4177.up.railway.app/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsOtpSent(true);
        setSuccessMsg('OTP sent successfully!');
      } else {
        setErrorMsg(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setErrorMsg('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySignupOtp = async (e) => {
    e.preventDefault();
    if (!otp) return setErrorMsg('Please enter the 6-digit OTP');

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('http://weekend-production-4177.up.railway.app/api/auth/register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name, company }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', 'user');
        localStorage.setItem('isAdminAuthenticated', 'false');
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => window.location.href = '/', 1000);
      } else {
        setErrorMsg(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setErrorMsg('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Firebase: Login ──────────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    console.log("Starting login process for:", email.trim());

    try {
      let userObj = null;
      let role = 'user';
      let isAdmin = false;
      let backendToken = null;

      // 1. Primary Auth Attempt: Backend (Handles Admin & Staff)
      try {
        console.log("Attempting backend login...");
        const backendRes = await fetch('http://weekend-production-4177.up.railway.app/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email.trim(), password }),
        });

        const backendData = await backendRes.json();
        console.log("Backend response status:", backendRes.status);

        if (backendRes.ok) {
          console.log("Backend login SUCCESS. Data:", backendData);
          backendToken = backendData.token;
          userObj = backendData.user;
          role = userObj.role?.toLowerCase() || 'user';
          isAdmin = role === 'admin';

          localStorage.setItem('token', backendToken);
          localStorage.setItem('user', JSON.stringify(userObj));
          localStorage.setItem('role', role);
          localStorage.setItem('isAdminAuthenticated', isAdmin ? 'true' : 'false');

          setSuccessMsg(`${role.toUpperCase()} login successful! Redirecting…`);
          setTimeout(() => window.location.href = '/', 1000);
          return; // Stop here, we are logged in via backend
        } else {
          console.warn("Backend login REJECTED:", backendData.message);
          // If the backend specifically found a match but password was wrong, don't fallback to Firebase
          if (backendRes.status === 401) {
            throw new Error(backendData.message || 'Invalid credentials.');
          }
        }
      } catch (backendErr) {
        if (backendErr.message === 'Invalid credentials.') throw backendErr;
        console.warn('Backend connection issue or generic error. Checking Firebase...', backendErr);
      }

      // 2. Secondary Auth Attempt: Firebase (For normal customers)
      console.log("Attempting Firebase login fallback...");
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const fbUser = userCredential.user;
        console.log("Firebase login SUCCESS:", fbUser.email);

        userObj = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email.split('@')[0],
          role: 'user'
        };
        role = 'user';

        localStorage.setItem('user', JSON.stringify(userObj));
        localStorage.setItem('role', role);
        localStorage.setItem('isAdminAuthenticated', 'false');

        setSuccessMsg("Customer login successful! Redirecting…");
        setTimeout(() => window.location.href = '/', 1000);
      } catch (firebaseErr) {
        console.error("Firebase Auth failed:", firebaseErr);
        throw new Error('Invalid email or password.');
      }

    } catch (err) {
      console.error("Auth process failed:", err);
      setErrorMsg(err.message || "An unexpected error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Firebase: Email/Password Signup ─────────────────────────────────────
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!termsAccepted) {
      setErrorMsg('Please accept the Terms of Service to continue.');
      return;
    }
    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      localStorage.setItem('isAdminAuthenticated', 'false');
      setSuccessMsg('Account created! Redirecting…');
      setTimeout(() => window.location.href = '/', 1000);
    } catch (err) {
      setErrorMsg(friendlyError(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      localStorage.setItem('isAdminAuthenticated', 'false');
      setSuccessMsg('Signed in with Google! Redirecting…');
      setTimeout(() => window.location.href = '/', 1000);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(friendlyError(err.code));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const friendlyError = (code) => {
    switch (code) {
      case 'auth/email-already-in-use': return 'This email is already registered. Try logging in.';
      case 'auth/invalid-email': return 'Please enter a valid email address.';
      case 'auth/weak-password': return 'Password must be at least 6 characters.';
      case 'auth/user-not-found': return 'No account found with this email.';
      case 'auth/wrong-password': return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests': return 'Too many attempts. Please wait a moment.';
      case 'auth/invalid-credential': return 'Invalid email or password. Please try again.';
      default: return 'Something went wrong. Please try again.';
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="desktop-back-btn"
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>
        <div className="auth-brand-content">
          <div className="auth-brand-logo">
            <img src={fineLogo} alt="Fine Bearing Logo" className="logo-image" style={{ height: '50px' }} />
          </div>
          <h1>Industrial Solutions You Can Trust</h1>
          <p className="subtitle">
            Access genuine bearings, seals, hydraulics, and machinery components with fast support and reliable sourcing.
          </p>
          <ul className="auth-trust-list">
            <li className="auth-trust-item"><Award size={14} strokeWidth={2.5} /> Genuine Industrial Brands</li>
            <li className="auth-trust-item"><Clock size={14} strokeWidth={2.5} /> Fast Inquiry Support</li>
            <li className="auth-trust-item"><ShieldCheck size={14} strokeWidth={2.5} /> Trusted Quality & Supply</li>
          </ul>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mobile-back-btn"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
          <div className="auth-tabs" data-mode={authMode}>
            <button className={`auth-tab ${authMode === 'login' ? 'active' : ''}`} onClick={() => handleModeChange('login')}>Log In</button>
            <button className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`} onClick={() => handleModeChange('signup')}>Sign Up</button>
          </div>

          {errorMsg && <div className="auth-alert auth-alert-error">{errorMsg}</div>}
          {successMsg && <div className="auth-alert auth-alert-success">{successMsg}</div>}

          {authMode === 'login' ? (
            <>
              <div className="auth-header">
                <h2>Welcome Back</h2>
                <p>Login to access products, pricing, and business inquiries.</p>
              </div>

              <div className="auth-method-toggle" style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  className={`method-btn ${loginMethod === 'email' ? 'active' : ''}`}
                  onClick={() => { setLoginMethod('email'); setIsOtpSent(false); }}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: loginMethod === 'email' ? '#1e293b' : 'white', color: loginMethod === 'email' ? 'white' : '#64748b', cursor: 'pointer', fontWeight: '600' }}
                >
                  Email
                </button>
                <button
                  type="button"
                  className={`method-btn ${loginMethod === 'phone' ? 'active' : ''}`}
                  onClick={() => setLoginMethod('phone')}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: loginMethod === 'phone' ? '#1e293b' : 'white', color: loginMethod === 'phone' ? 'white' : '#64748b', cursor: 'pointer', fontWeight: '600' }}
                >
                  Phone
                </button>
              </div>

              {loginMethod === 'email' ? (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="form-group">
                    <label className="form-label">Email or Username</label>
                    <input type="text" className="form-input" placeholder="Email or Admin Username" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="form-input-wrapper">
                      <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn-submit" disabled={isLoading}>
                    {isLoading ? 'Logging in…' : <><span>Log In</span><ArrowRight size={18} className="btn-icon" /></>}
                  </button>
                </form>
              ) : (
                <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91XXXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isOtpSent || isLoading}
                      required
                    />
                  </div>

                  {isOtpSent && (
                    <div className="form-group">
                      <label className="form-label">Enter 6-Digit OTP</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="123456"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                      />
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', cursor: 'pointer' }} onClick={handleSendOtp}>
                        Didn't receive code? Resend
                      </p>
                    </div>
                  )}

                  <button type="submit" className="btn-submit" disabled={isLoading}>
                    {isLoading ? 'Please wait…' : (
                      isOtpSent ?
                        <><span>Verify & Login</span><ArrowRight size={18} className="btn-icon" /></> :
                        <><span>Send OTP</span><ArrowRight size={18} className="btn-icon" /></>
                    )}
                  </button>

                  {isOtpSent && (
                    <button
                      type="button"
                      onClick={() => setIsOtpSent(false)}
                      style={{ width: '100%', background: 'none', border: 'none', color: '#64748b', marginTop: '10px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Change Phone Number
                    </button>
                  )}
                </form>
              )}
            </>
          ) : (
            <>
              <div className="auth-header">
                <h2>Create Account</h2>
                <p>Join Fine Bearing & Oil Seal Store for exclusive benefits.</p>
              </div>

              <div className="auth-method-toggle" style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  className={`method-btn ${loginMethod === 'email' ? 'active' : ''}`}
                  onClick={() => { setLoginMethod('email'); setIsOtpSent(false); }}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: loginMethod === 'email' ? '#1e293b' : 'white', color: loginMethod === 'email' ? 'white' : '#64748b', cursor: 'pointer', fontWeight: '600' }}
                >
                  Email
                </button>
                <button
                  type="button"
                  className={`method-btn ${loginMethod === 'phone' ? 'active' : ''}`}
                  onClick={() => setLoginMethod('phone')}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: loginMethod === 'phone' ? '#1e293b' : 'white', color: loginMethod === 'phone' ? 'white' : '#64748b', cursor: 'pointer', fontWeight: '600' }}
                >
                  Phone
                </button>
              </div>

              {loginMethod === 'email' ? (
                <form onSubmit={handleSignupSubmit}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company Name (Optional)</label>
                    <input type="text" className="form-input" placeholder="ACME Corp" value={company} onChange={(e) => setCompany(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="form-input-wrapper">
                      <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </div>
                    </div>
                  </div>
                  <div className="terms-checkbox" style={{ marginBottom: '1.5rem' }}>
                    <label className="checkbox-label" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                      <span style={{ fontSize: '0.8125rem' }}>I agree to the Terms of Service and Privacy Policy.</span>
                    </label>
                  </div>
                  <button type="submit" className="btn-submit" disabled={isLoading || !termsAccepted}>
                    {isLoading ? 'Creating Account…' : <><span>Sign Up</span><ArrowRight size={18} className="btn-icon" /></>}
                  </button>
                </form>
              ) : (
                <form onSubmit={isOtpSent ? handleVerifySignupOtp : handleSendSignupOtp}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} disabled={isOtpSent || isLoading} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company Name (Optional)</label>
                    <input type="text" className="form-input" placeholder="ACME Corp" value={company} onChange={(e) => setCompany(e.target.value)} disabled={isOtpSent || isLoading} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91XXXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isOtpSent || isLoading}
                      required
                    />
                  </div>

                  {isOtpSent && (
                    <div className="form-group">
                      <label className="form-label">Enter 6-Digit OTP</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="123456"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                      />
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', cursor: 'pointer' }} onClick={handleSendSignupOtp}>
                        Didn't receive code? Resend
                      </p>
                    </div>
                  )}

                  <button type="submit" className="btn-submit" disabled={isLoading}>
                    {isLoading ? 'Please wait…' : (
                      isOtpSent ?
                        <><span>Verify & Register</span><ArrowRight size={18} className="btn-icon" /></> :
                        <><span>Send OTP Verification</span><ArrowRight size={18} className="btn-icon" /></>
                    )}
                  </button>

                  {isOtpSent && (
                    <button
                      type="button"
                      onClick={() => setIsOtpSent(false)}
                      style={{ width: '100%', background: 'none', border: 'none', color: '#64748b', marginTop: '10px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Change Details
                    </button>
                  )}
                </form>
              )}
            </>
          )}

          <div className="auth-divider">or continue with</div>
          <button type="button" className="btn-google" onClick={handleGoogleSignIn} disabled={isLoading}>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
