import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MedicineCard from './MedicineCard';
import './Medicines.css';
import {
  Search,
  X,
  RefreshCw,
  AlertCircle,
  Loader2,
  ShoppingCart,
  Frown,
} from 'lucide-react';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [categories, setCategories] = useState([]);

  // Fetch medicines on mount
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/medicines`);
        setMedicines(response.data);
        setFilteredMedicines(response.data);

        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.map(med => med.category).filter(Boolean))];
        setCategories(uniqueCategories);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  // Filter and sort medicines
  useEffect(() => {
    let result = [...medicines];

    if (searchTerm) {
      result = result.filter(medicine =>
        medicine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.ingredients?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(medicine => medicine.category === selectedCategory);
    }

    if (priceRange !== 'all') {
      result = result.filter(medicine => {
        const price = medicine.price;
        switch (priceRange) {
          case 'under-500':
            return price < 500;
          case '500-1000':
            return price >= 500 && price <= 1000;
          case '1000-2000':
            return price > 1000 && price <= 2000;
          case 'above-2000':
            return price > 2000;
          default:
            return true;
        }
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name?.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'popularity':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredMedicines(result);
  }, [searchTerm, selectedCategory, priceRange, sortBy, medicines]);

  const addToCart = (medicine) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === medicine._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === medicine._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...medicine, quantity: 1 }];
    });
  };

  const handleQuantityChange = (id, delta) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item._id === id ? { ...item, quantity: Math.max(item.quantity + delta, 0) } : item
      );
      return updatedCart.filter((item) => item.quantity > 0);
    });
  };

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange('all');
    setSortBy('name');
  };

  if (loading) {
    return (
      <div className="ay-meds-page">
        <div className="ay-meds-loading">
          <Loader2 className="ay-meds-spinner" size={32} />
          <p>Loading medicines...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ay-meds-page">
        <div className="ay-meds-error">
          <AlertCircle className="ay-meds-error__icon" size={36} />
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="ay-meds-btn ay-meds-btn--subtle">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ay-meds-page">
      <div className="ay-meds-container">
        {/* Header Section */}
        <div className="ay-meds-header">
          <h1 className="ay-meds-title">Ayurvedic Medicines</h1>
          <p className="ay-meds-subtitle">Natural healing solutions for your wellbeing</p>
        </div>

        {/* Search and Filter Section */}
        <div className="ay-meds-filters">
          <div className="ay-meds-search">
            <Search className="ay-meds-search__icon" size={20} />
            <input
              type="text"
              placeholder="Search medicines by name, ingredients, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ay-meds-search__input"
            />
            {searchTerm && (
              <button className="ay-meds-search__clear" onClick={() => setSearchTerm('')}>
                <X size={20} />
              </button>
            )}
          </div>

          <div className="ay-meds-controls">
            <div className="ay-meds-control">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="ay-meds-select"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="ay-meds-control">
              <label htmlFor="price">Price Range</label>
              <select
                id="price"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="ay-meds-select"
              >
                <option value="all">All Prices</option>
                <option value="under-500">Under ₹500</option>
                <option value="500-1000">₹500 - ₹1,000</option>
                <option value="1000-2000">₹1,000 - ₹2,000</option>
                <option value="above-2000">Above ₹2,000</option>
              </select>
            </div>

            <div className="ay-meds-control">
              <label htmlFor="sort">Sort By</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="ay-meds-select"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>

            <button onClick={resetFilters} className="ay-meds-btn ay-meds-btn--subtle">
              <RefreshCw size={18} />
              Reset
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="ay-meds-results">
          <p>
            Showing <strong>{filteredMedicines.length}</strong> of <strong>{medicines.length}</strong> medicines
          </p>
          {cart.length > 0 && (
            <div className="ay-meds-cart">
              <ShoppingCart size={18} />
              <span>{cart.reduce((acc, item) => acc + item.quantity, 0)} items in cart</span>
            </div>
          )}
        </div>

        {/* Medicine Grid */}
        {filteredMedicines.length > 0 ? (
          <div className="ay-meds-grid">
            {filteredMedicines.map((medicine) => (
              <MedicineCard
                key={medicine._id}
                medicine={medicine}
                cart={cart}
                addToCart={addToCart}
                handleQuantityChange={handleQuantityChange}
              />
            ))}
          </div>
        ) : (
          <div className="ay-meds-empty">
            <Frown className="ay-meds-empty__icon" size={40} />
            <h3>No medicines found</h3>
            <p>Try adjusting your filters or search terms</p>
            <button onClick={resetFilters} className="ay-meds-btn ay-meds-btn--lg">
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Medicines;
