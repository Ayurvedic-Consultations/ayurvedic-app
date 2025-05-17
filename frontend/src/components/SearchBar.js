import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("doctor");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) return setSuggestions([]);
      try {
        const res = await fetch(`http://localhost:8080/api/search?s=${query}&type=${type}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };

    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [query, type]);

  const handleSelect = (item) => {
    switch (type) {
      case "doctor":
        navigate(`/doctor-detail?id=${item.id}`);
        break;
      case "medicine":
        navigate(`/medicines?q=${item.name}`);
        break;
      case "blogs-videos":
        navigate(`/blogs?q=${item.title || item.name}`);
        break;
      case "diet-yoga":
      case "disease":
        navigate(`/treatment/${item.name}`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="search-signin">
      <div className="search-bar">
        <div className="dropdown">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="doctor">Doctor</option>
            <option value="disease">Diseases</option>
            <option value="medicine">Medicines</option>
            <option value="diet-yoga">Diet And Yoga</option>
            <option value="blogs-videos">Blogs</option>
          </select>
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((item, i) => (
              <li key={i} onClick={() => handleSelect(item)}>
                {item.name || item.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchBar;

