import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./components/Home";
import Account from "./components/Account";
import Register from "./components/CreateAccount";
import Login from "./components/Login";
import ProductList from "./components/ProductList";
import ProductDetails from "./components/ProductDetails";
import IndividualCategory from "./components/IndividualCategory";
import MyCart from "./components/MyCart";
import UserSettings from "./components/UserSettings";

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = window.localStorage.getItem("token");

    if (token) {
      setToken(token);
    }
  }, [setToken]);

  return (
    <>
      <div id="container">
        <Navigation token={token} />
        <div id="main menu">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/account"
              element={<Account token={token} setToken={setToken} />}
            />
            <Route
              path="/register"
              element={
                <Register
                  user={user}
                  setUser={setUser}
                  token={token}
                  setToken={setToken}
                />
              }
            />
            <Route
              path="/login"
              element={
                <Login
                  user={user}
                  setUser={setUser}
                  token={token}
                  setToken={setToken}
                />
              }
            />
            <Route path="/products" element={<ProductList />} />
            <Route
              path="/products/:id"
              element={<ProductDetails token={token} />}
            />
            <Route path="/categories/:name" element={<IndividualCategory />} />
            <Route path="/myCart" element={<MyCart token={token} />} />
            <Route
              path="/UserSettings"
              element={<UserSettings token={token} />}
            />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
