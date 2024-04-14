import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../main";

const Login = ({ user, setUser, token, setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLoginSuccess = (token, email) => {
    window.localStorage.setItem("token", token);
    setToken(token);
    attemptLoginWithToken();
    setUser(email);
    setSuccessMessage("Login success");
  };

  const handleLoginFailure = (errorMessage) => {
    setError(errorMessage);
    console.error("Login error:", errorMessage);
  };

  const attemptLoginWithToken = async () => {
    const token = window.localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const result = await response.json();
        console.log(result);
      } catch (error) {
        console.error("Token validation error:", error.message);
        window.localStorage.removeItem("token");
      }
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify(credentials),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to login. Please check your credentials.");
      }

      const result = await response.json();
      handleLoginSuccess(result.token, credentials.email);
    } catch (error) {
      handleLoginFailure("An error occurred while logging in. Please try again later.");
    }
  };

  const submit = (ev) => {
    ev.preventDefault();
    login({ email, password });
  };

  const logout = () => {
    window.localStorage.removeItem("token");
    setToken({});
  };

  return (
    <>
      {!token ? (
        <div>
          <h1>Login</h1>
          {error && <p>{error}</p>}
          {successMessage && <p>{successMessage}</p>}
          <form className="form" onSubmit={submit}>
            <label htmlFor="email" className="email">
              Email address:{" "}
              <input
                type="email"
                id="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                autoComplete="email" // Add autocomplete attribute
              />
            </label>
            <label htmlFor="password" className="password">
              Password:{" "}
              <input
                type="password"
                id="password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                autoComplete="current-password" // Add autocomplete attribute
              />
            </label>
            <button disabled={!email || !password}>Login</button>
          </form>
          <div className="container">
            <p>If you do not have an account, create one below!</p>
            <button onClick={() => navigate("/register")}>Create Account</button>
          </div>
        </div>
      ) : (
        <div>
          <h1>Logged in as {user}</h1>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </>
  );
};

export default Login;