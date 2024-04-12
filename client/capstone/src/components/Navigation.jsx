import { Link } from "react-router-dom";

export default function Navigation({ token }) {
  return (
    <div id="navbar">
      {token ? (
        <>
          <Link to="/" className="nav">
            Home
          </Link>
          <Link to="/products" className="nav">
            Products
          </Link>
          <Link to="/account" className="nav">
            Account
          </Link>
          <Link to="/myCart" className="nav">
            My Cart
          </Link>
        </>
      ) : (
        <>
          <Link to="/" className="nav">
            Home
          </Link>
          <Link to="/products" className="nav">
            Products
          </Link>
          <Link to="/login" className="nav">
            Login
          </Link>
          <Link to="/register" className="nav">
            Register
          </Link>
        </>
      )}
    </div>
  );
}