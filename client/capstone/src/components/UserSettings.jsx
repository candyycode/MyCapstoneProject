import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../main";

export default function UserSettings({ token }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/myaccount`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: `${firstName}`,
          lastName: `${lastName}`,
          phoneNumber: `${phoneNumber}`,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setSuccessMessage("Submitted");
        console.log(result);
      } else {
        setError("Failed to submit");
        console.log(result);
      }
      // reset values for email and password.
      setFirstName("");
      setLastName("");
      setPhoneNumber("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {token ? (
        <div>
          <h1>Please submit a form to update your data</h1>
          <form className="form">
            <label htmlFor={"firstName"} className="firstName">
              First Name:{" "}
              <input
                type={"firstName"}
                value={firstName}
                onChange={(ev) => setFirstName(ev.target.value)}
              />
            </label>
            <label htmlFor={"lastName"} className="lastName">
              Last Name:{" "}
              <input
                type={"lastName"}
                value={lastName}
                onChange={(ev) => setLastName(ev.target.value)}
              />
            </label>
            <label htmlFor={"phoneNumber"} className="phoneNumber">
              Phone Number:{" "}
              <input
                type={"phoneNumber"}
                value={phoneNumber}
                onChange={(ev) => setPhoneNumber(ev.target.value)}
              />
            </label>
            <button type="submit" onClick={handleSubmit}>
              Submit
            </button>
          </form>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      ) : (
        <div>
          <p>If you already have an account, please log in now.</p>
          <button onClick={() => navigate("/login")}>Log in</button>
        </div>
      )}
    </>
  );
}