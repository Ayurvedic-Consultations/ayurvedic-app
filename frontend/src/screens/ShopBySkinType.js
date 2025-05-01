// ShopBySkinType.js
import React from 'react';
import './ShopBySkinType.css'; // Import the specific CSS file for Shop by Skin Type
import homebg from '../media/homebg.png';
import { useNavigate } from 'react-router-dom';

// Import local images
import expertCareImage from '../media/ec.jpg';
import quickReliefImage from '../media/qr.png';
import advancedTechnologyImage from '../media/at.jpg';
import costEffectiveImage from '../media/ce.png';
import doctorsImage from '../media/od.png';
import technologyImage from '../media/ot.jpg';
import successStoriesImage from '../media/cs.jpg';

const ShopBySkinType = () => {
  const navigate = useNavigate();
  
  return (
    <div className="SkinHealth_skinTypeWrapper__InDhG">
      {/* Section Header */}
      <div className="ComponentHeader_componentHeaderDesktop__sNo2H ShopBySkinType_sectionHeader__4dj9l">
        <div className="ComponentHeader_headerTitle__oeo_k">
          <h2 className="title3-bold-d title3-bold-m">Why Choose Us for Treatment?</h2>
        </div>
      </div>
 
      {/* Top section (Benefit Cards) */}
      <div className="ShopBySkinType_container__cvZMd top-section">
        {/* Expert Care Card */}
        <div className="ShopBySkinType_cardContainer__r93Qr ShopBySkinType_shortCard__d3YWU">
          <div className="ShopBySkinType_imageWrapper__AZriZ">
            <img
              alt="Expert Care"
              className="ShopBySkinType_img__SJV_O"
              src={expertCareImage}
            />
          </div>
          <div className="ShopBySkinType_textContainer__fXBb0">
            <div className="ShopBySkinType_title__lstmx">Expert Care</div>
            <div className="ShopBySkinType_description__ltIg9">World-renowned doctors with years of experience</div>
          </div>
        </div>

        {/* Quick Relief Card */}
        <div className="ShopBySkinType_cardContainer__r93Qr ShopBySkinType_shortCard__d3YWU">
          <div className="ShopBySkinType_imageWrapper__AZriZ">
            <img
              alt="Quick Relief"
              className="ShopBySkinType_img__SJV_O"
              src={quickReliefImage}
            />
          </div>
          <div className="ShopBySkinType_textContainer__fXBb0">
            <div className="ShopBySkinType_title__lstmx">Quick Relief</div>
            <div className="ShopBySkinType_description__ltIg9">Pain and bleeding relief within 3 days</div>
          </div>
        </div>

        {/* Advanced Technology Card */}
        <div className="ShopBySkinType_cardContainer__r93Qr ShopBySkinType_shortCard__d3YWU">
          <div className="ShopBySkinType_imageWrapper__AZriZ">
            <img
              alt="Advanced Technology"
              className="ShopBySkinType_img__SJV_O"
              src={advancedTechnologyImage}
            />
          </div>
          <div className="ShopBySkinType_textContainer__fXBb0">
            <div className="ShopBySkinType_title__lstmx">Reliable Treatment</div>
            <div className="ShopBySkinType_description__ltIg9">Highly reliable diagnosis for accurate results</div>
          </div>
        </div>

        {/* Cost-Effective Card */}
        <div className="ShopBySkinType_cardContainer__r93Qr ShopBySkinType_shortCard__d3YWU">
          <div className="ShopBySkinType_imageWrapper__AZriZ">
            <img
              alt="Cost-Effective"
              className="ShopBySkinType_img__SJV_O"
              src={costEffectiveImage}
            />
          </div>
          <div className="ShopBySkinType_textContainer__fXBb0">
            <div className="ShopBySkinType_title__lstmx">Cost-Effective</div>
            <div className="ShopBySkinType_description__ltIg9">Affordable treatment options without compromising on quality</div>
          </div>
        </div>
      </div>

      {/* Bottom Section (Tabbed Navigation) */}
      <div className="ShopBySkinType_container__cvZMd bottom-section">
        {/* Our Technology Tab */}
        <a
          className="ShopBySkinType_cardContainer__r93Qr ShopBySkinType_longCard__JuzwU"
          onClick={() => navigate('/treatments')} // Navigate on click
          style={{ cursor: 'pointer' }}
        >
          <div
            className="ShopBySkinType_imageWrapper__AZriZ"
            style={{
              backgroundImage: `url(${technologyImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
          <div className="ShopBySkinType_textContainer__fXBb0">
            <div className="ShopBySkinType_title__lstmx">Our Treatment</div>
          </div>
        </a>

        {/* Our Doctors Tab */}
        <a
          className="ShopBySkinType_cardContainer__r93Qr ShopBySkinType_longCard__JuzwU"
          onClick={() => navigate('/doctors')} // Navigate on click
          style={{ cursor: 'pointer' }}
        >
          <div
            className="ShopBySkinType_imageWrapper__AZriZ"
            style={{
              backgroundImage: `url(${doctorsImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
          <div className="ShopBySkinType_textContainer__fXBb0">
            <div className="ShopBySkinType_title__lstmx">Our Doctors</div>
          </div>
        </a>

        {/* Our Success Stories Tab */}
        <a
          className="ShopBySkinType_cardContainer__r93Qr ShopBySkinType_longCard__JuzwU"
          href="/skin/products?tab=our-success-stories"
        >
          <div
            className="ShopBySkinType_imageWrapper__AZriZ"
            style={{
              backgroundImage: `url(${successStoriesImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
          <div className="ShopBySkinType_textContainer__fXBb0">
            <div className="ShopBySkinType_title__lstmx">Case Studies</div>
          </div>
        </a>
      </div>
    </div>
  );
};

export default ShopBySkinType;
