import React from 'react';
import './productsection.css';  // Importing the CSS file

const ProductSection = () => {
  return (
    <div className="productSection">
      <div className="productCard">
        <div className="productCardContent">
          <span className="productLabel">INTRODUCING</span>
          <h2 className="productTitle">Gabit Smart Ring</h2>
          <h5 className="productSubTitle">Your complete health loop</h5>
          <div className="productRating">
            <span className="rating">5</span>
            <span className="ratingText">43 Ratings</span>
          </div>
          <div className="productPrice">
            <span className="discountedPrice">₹13110</span>
            <span className="basePrice">₹13800</span>
            <span className="discount">5% off</span>
          </div>
          <p className="emiAvailable">EMI available</p>
          <div className="productFeatures">
            <div className="featureItem">
              <span className="featureTitle">Crafted from titanium</span>
            </div>
            <div className="featureItem">
              <span className="featureTitle">Feather-light experience</span>
            </div>
            <div className="featureItem">
              <span className="featureTitle">Highly accurate</span>
            </div>
          </div>
          <button className="exploreButton">Explore smart ring</button>
        </div>
        <div className="productImage">
          <img
            src="https://res.cloudinary.com/dmezmffej/image/upload/v1721388046/Frame_48098010_2_1.avif"
            alt="Smart Ring"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductSection;
