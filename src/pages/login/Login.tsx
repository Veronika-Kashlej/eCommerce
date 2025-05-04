import './Login.css';
function Login() {
  return (
    <div className="login-page">
      <form className="root">
        <h2>Log In</h2>

        <div className="form-group">
          <input className="input" type="email" placeholder="Email" required />
        </div>

        <div className="form-group">
          <input className="input" type="password" placeholder="Password" required />
        </div>

        <button className="button" type="submit">
          Log In
        </button>

        <div className="register-prompt">
          <span>Don't have an account?</span>
          <a href="/register" className="register-link">
            Sign Up
          </a>
        </div>
      </form>
    </div>
  );
}

export default Login;
