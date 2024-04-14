import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../main";

export default function ProductDetails({ token }) {
  const [productDetails, setProductDetails] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  let { id } = useParams();

  useEffect(() => {
    const getProductDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/products/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        console.log("Product Details:", result[0]); // Log the product details object inside the array
        setProductDetails(result[0]); // Set the product details
      } catch (error) {
        console.log(error);
      }
    };
    getProductDetails();
  }, []);

  async function handleClick() {
    try {
      const response = await fetch(`${API_URL}/mycart/cartitems`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: 1,
          product_id: productDetails.id
        }),
      });
      await response.json();
      if (response.ok) {
        setSuccessMessage("Item is added to cart");
      } else {
        setError("Unable to add this item to cart");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div className="ProductDetails">
        <h1>{productDetails.name}</h1>
        <img src={productDetails.imageurl} alt="product image" />
        <h2>Description: {productDetails.description}</h2>
        <p>Price: {productDetails.price}</p>
        {token ? (
          <>
          <button onClick={handleClick}>Add Item</button>
          {successMessage && <p>{successMessage}</p>}
          {error && <p>{error}</p>}
          </>
        ) : (
          <p>This item is available in stock!</p>
        )}
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </>
  );
}