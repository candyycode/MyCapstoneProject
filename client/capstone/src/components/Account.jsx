import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../main";

export default function Account({ token, setToken }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/myaccount`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await response.json();
        setUserData(result);
    } catch (error) {
        console.log(error);
      }
    };
    getUserData();
  }, []);

  async function deleteUser() {
    try {
      const response = await fetch(`${API_URL}/myaccount`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("User could not be deleted.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {
    window.localStorage.removeItem("token");
    setToken({});
  };

  const navigateHome = () => {
    navigate("/");
    setToken({});
  };

  return (
    <>
      <div className="account">
        <h1>Account</h1>
          {token ? (
            // if token is valid display MyCart button, settings button, delete user button
            <>
              <ul className="user">
                  <li key={userData.id}>
                    <h3>Email: {userData.email}</h3>
                    <h3>First Name: {userData.firstname}</h3>
                    <h3>Last Name: {userData.lastname}</h3>
                    <h3>Phone number: {userData.phonenumber}</h3>
                  </li>
              </ul>
              <button onClick={() => navigate("/myCart")}>My Cart</button>
              <button>My Orders</button>
              <button onClick={() => navigate("/UserSettings")}>User Settings</button>
              <button onClick={() => {deleteUser(); navigateHome()}}>Delete User</button>
              <button onClick={() => {logout(); navigateHome()}}>Logout</button>
            </>
          ) : (
            // if token is not valid link to register or login
            <h3>
              Please log in
              <button onClick={() => navigate("/login")}>Login</button>
              or Create
              <button onClick={() => navigate("/register")}>Register</button>
               account
            </h3>
          )
        }
      </div>
    </>
  );
}