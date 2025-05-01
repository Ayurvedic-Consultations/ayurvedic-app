import React from 'react';
import './ShopByConcern.css'; // Keeping the existing CSS

// Import images for different health concerns (Replace with actual images if available)
import digestiveHealthImage from '../media/digestive2.jpg';
import respiratoryHealthImage from '../media/respiratory.jpg';
import skinCareImage from '../media/skincare.jpg';
import jointHealthImage from '../media/joint.jpg';
import cardiovascularHealthImage from '../media/heart.jpg';
import mentalHealthImage from '../media/stress.jpg';
import DiabitiesImage from '../media/diabeties.jpg';

const Treatments = () => {
  return (
    <div className="SkinHealth_skinConcernWrapper__4RStK"> 
      <div className="ComponentHeader_componentHeaderDesktop__sNo2H ShopByConcern_sectionHeader__CLeME">
        <div className="header-content">
          <div className="ComponentHeader_headerTitle__oeo_k">
            <h2 className="title3-bold-d title3-bold-m">
              Explore Ayurvedic Treatments for Various Health Concerns
            </h2>
            <h4>
              Discover holistic solutions curated by expert doctors for optimal well-being.
            </h4>
          </div>
          {/* CTA Section aligned to the right */}
          <div className="cta-wrapper">
            <a href="/treatments" className="cta-button">Explore All Treatments <span className="arrow">›</span></a>
          </div>
        </div>
      </div>


      {/* Top section (Main categories with images) */}
      <div className="ShopByConcern_container__ZcaN3 top-section">
        <a className="ShopByConcern_cardContainer__Y1toh" href="/treatment/Digestive%20Health">
          <div className="ShopByConcern_textContainer__i6UMp">
            <h4 className="ShopByConcern_title__aV3sc">Digestive Health</h4>
          </div>
          <div className="ShopByConcern_imageWrapper__pz_iH" style={{ backgroundImage: `url(${digestiveHealthImage})` }}></div>
        </a>

        <a className="ShopByConcern_cardContainer__Y1toh" href="/treatment/Respiratory%20Health">
          <div className="ShopByConcern_textContainer__i6UMp">
            <h4 className="ShopByConcern_title__aV3sc">Respiratory Health</h4>
          </div>
          <div className="ShopByConcern_imageWrapper__pz_iH" style={{ backgroundImage: `url(${respiratoryHealthImage})` }}></div>
        </a>

        <a className="ShopByConcern_cardContainer__Y1toh" href="/treatment/Skin%20Care">
          <div className="ShopByConcern_textContainer__i6UMp">
            <h4 className="ShopByConcern_title__aV3sc">Skin Care</h4>
          </div>
          <div className="ShopByConcern_imageWrapper__pz_iH" style={{ backgroundImage: `url(${skinCareImage})` }}></div>
        </a>

        <a className="ShopByConcern_cardContainer__Y1toh" href="/treatment/Joint%20and%20Bone%20Health">
          <div className="ShopByConcern_textContainer__i6UMp">
            <h4 className="ShopByConcern_title__aV3sc">Joint And Bone Health</h4>
          </div>
          <div className="ShopByConcern_imageWrapper__pz_iH" style={{ backgroundImage: `url(${jointHealthImage})` }}></div>
        </a>
      </div>

      {/* Bottom section (More categories without images) */}
      <div className="ShopByConcern_container__ZcaN3 bottom-section">
        <a className="ShopByConcern_cardContainer__Y1toh" href="/treatment/Cardiovascular%20Health">
          <div className="ShopByConcern_imageWrapper__pz_iH" style={{ backgroundImage: `url(${cardiovascularHealthImage})` }}></div>
          <div className="ShopByConcern_textContainer__i6UMp">
            <h4 className="ShopByConcern_title__aV3sc">Cardiovascular Health</h4>
          </div>
        </a>

        <a className="ShopByConcern_cardContainer__Y1toh" href="/treatment/Mental%20Health%20and%20Wellness">
          <div className="ShopByConcern_imageWrapper__pz_iH" style={{ backgroundImage: `url(${mentalHealthImage})` }}></div>
          <div className="ShopByConcern_textContainer__i6UMp">
            <h4 className="ShopByConcern_title__aV3sc">Mental Health & Wellness</h4>
          </div>
        </a>

        <a className="ShopByConcern_cardContainer__Y1toh" href="/treatment/Metabolic%20and%20Endocrine%20Health">
          <div className="ShopByConcern_imageWrapper__pz_iH" style={{ backgroundImage: `url(${DiabitiesImage})` }}></div>
          <div className="ShopByConcern_textContainer__i6UMp">
            <h4 className="ShopByConcern_title__aV3sc">Metabolic and Endocrine Health</h4>
          </div>
        </a>

      </div>


    </div>
  );
};

export default Treatments;