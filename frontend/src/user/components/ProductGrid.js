import React, { useState, useEffect } from "react";
import { LuSearch } from "react-icons/lu";
import ProductCard from "./ProductCard";
import { useLaptopStore } from "../../lib/laptopStore";
import "./ProductGrid.css";

export default function ProductGrid() {
  const { laptops, brands, loading, error, fetchLaptops } = useLaptopStore();
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [sortBy, setSortBy] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch laptops on component mount
  useEffect(() => {
    fetchLaptops();
  }, [fetchLaptops]);

  const filteredLaptops = laptops
    .filter((laptop) => {
      const brandMatch = selectedBrand === "All" || laptop.brand === selectedBrand;
      const priceMatch = laptop.price >= priceRange[0] && laptop.price <= priceRange[1];
      const searchMatch = searchTerm === "" || 
        laptop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        laptop.brand.toLowerCase().includes(searchTerm.toLowerCase());
      return brandMatch && priceMatch && searchMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const clearFilters = () => {
    setSelectedBrand("All");
    setPriceRange([0, 3000]);
    setSortBy("name");
  };

  const handlePriceChange = (e, index) => {
    const newRange = [...priceRange];
    newRange[index] = Number(e.target.value);
    setPriceRange(newRange);
  };

  return (
    <div className="product-grid-container">
      <div className="sidebar">
        <div className="filter-card">
          <div className="filter-header">
            <h3>Filters</h3>
            <button className="clear-btn" onClick={clearFilters}>Clear All</button>
          </div>

          {/* Brand */}
          <div className="filter-section">
            <label>Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              {brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Price range */}
          <div className="filter-section">
            <label>Price Range: ${priceRange[0]} - ${priceRange[1]}</label>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="3000"
                step="100"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(e, 0)}
              />
              <input
                type="range"
                min="0"
                max="3000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(e, 1)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product list */}
      <div className="products-section">
        <div className="products-header">
          <h2>Laptops ({filteredLaptops.length} products)</h2>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search laptops..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon"><LuSearch/></span>
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {error && !loading && (
          <div className="error-state">
            <p>{error}</p>
          </div>
        )}

        <div className="products-grid">
          {filteredLaptops.map((laptop) => (
            <ProductCard key={laptop.id} laptop={laptop} />
          ))}
        </div>

        {filteredLaptops.length === 0 && (
          <div className="no-results">
            <p>No laptops found matching your criteria.</p>
            <button className="clear-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
