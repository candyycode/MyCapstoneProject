import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../main";

export default function CreateAccount({ user, setUser, token, setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = (ev) => {
    ev.preventDefault();
    CreateAccount({ email, password });
  };

  const CreateAccount = async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        body: JSON.stringify(credentials),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      if (response.ok) {
        window.localStorage.setItem("token", result.token);
        setSuccessMessage(
          "Account created. Please log in to your account"
        );
        setToken(result.token);
        setUser(email);
      } else {
        setError("Failed to create account");
      }
    } catch (error) {
      console.log(error);
    }
  };

  function validateForm() {
    if (password.length < 5) {
      alert(
        "Password must contain at least 5 characters."
      );
      return;
    }
    if (email == password) {
      alert("Password cant be the same as email.");
      return;
    }
  }

  return (
    <>
      {token ? (
        <h1>Logged in as {user}</h1>
      ) : (
        <div className="login">
          <h1>Create Account</h1>
          {error && <p>{error}</p>}
          {successMessage && <p>{successMessage}</p>}
          <form className="form" onSubmit={submit}>
            <label htmlFor={"email"} className="email">
              Email address:{" "}
              <input
                type={"email"}
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
              />
            </label>
            <label htmlFor={"password"} className="password">
              Password:{" "}
              <input
                type={"password"}
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
              />
            </label>
            <button
              disabled={!email || !password}
              type="submit"
              onClick={() => {
                validateForm();
              }}
            >
              Register
            </button>
          </form>
          <p>If you already have an account, please log into your account now.</p>
          <button onClick={() => navigate("/login")}>Log in</button>
        </div>
      )}
    </>
  );
}