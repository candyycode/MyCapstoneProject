import { useState, useEffect } from "react";
import { API_URL } from "../main";
import { useNavigate } from "react-router-dom";

export default function CategoryList() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);
        if (response.ok) {
          const json = await response.json();
          setCategories(json);
        } else {
          throw new Error("Failed to fetch categories");
        }
      } catch (error) {
        console.error(error);
      }
    };
    getCategories();
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    navigate(`/categories/${category}`);
  };

  return (
    <div className="categories-dropdown" style={{ marginTop: "50px" }}>
      <select
        value={selectedCategory}
        onChange={(e) => handleCategoryChange(e.target.value)}
      >
        <option value="">Select Category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.name}>
            {category.name.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}