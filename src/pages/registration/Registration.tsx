import './Registration.css';

function Registration() {
  return (
    <div className="registration-page">
      <form className="root">
        <h2>Create Account</h2>

        <div className="form-group">
          <input className="input" type="email" placeholder="Email" />
        </div>

        <div className="form-group">
          <input className="input" type="text" placeholder="First Name" />
        </div>

        <div className="form-group">
          <input className="input" type="text" placeholder="Last Name" />
        </div>

        <div className="form-group">
          <input className="input" type="password" placeholder="Password" />
        </div>

        <div className="form-group">
          <label>Date of Birth</label>
          <input className="input" type="date" />
        </div>

        <h3>Address Information</h3>

        <div className="form-group">
          <input className="input" type="text" placeholder="Street Address" />
        </div>

        <div className="form-group">
          <input className="input" type="text" placeholder="City" />
        </div>

        <div className="form-group">
          <input className="input" type="text" placeholder="Postal Code" />
        </div>

        <div className="form-group">
          <select className="input">
            <option value="">Select Country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
          </select>
        </div>

        <button className="button" type="submit">
          Sign Up
        </button>

        <div className="login-prompt">
          <span>Already have an account?</span>
          <a href="/login" className="login-link">
            Log In
          </a>
        </div>
      </form>
    </div>
  );
}

export default Registration;
