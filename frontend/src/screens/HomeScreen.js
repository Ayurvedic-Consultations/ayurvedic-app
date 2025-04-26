import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomeScreen.css"; // Import the CSS
import logo from "../media/logo.png"; // Import the logo
import homebg from "../media/homebg.png"; // Import the background image
import QuestionnaireCarousel from "./QuestionnaireCarousel";
import ProductSection from "./productsection";
import ShopBySkinType from "./ShopBySkinType"; // import Shop by Skin Type component
import ShopByConcern from "./ShopByConcern"; // import Shop by Concern component
import TreatmentSection from "./treatmentsection";
import TalkOfTheTown from "./TalkOfTheTown";
import TopTransformationStories from "./TopTransformationStories";
import SuccessRate from "./SuccessRate";
import PlansSection from "./PlansSection";
import RequestCallback from "./RequestCallback";
import WhatToAchieve from "./WhatToAchieve";
import HeroSection from "./HeroSection";
import YogaPositions from "./YogaPostions";
// import Promise from './Promise';
import FitBot from "./FitBot";

function HomeScreen() {
	const navigate = useNavigate();

	const [activeSlide, setActiveSlide] = useState(0);

	const carouselItems = [
		{
			image:
				"https://res.cloudinary.com/dmezmffej/image/upload/v1726465929/Gabit_CGM_1_2.avif",
			alt: "skin-care",
		},
		{
			image:
				"https://res.cloudinary.com/dmezmffej/image/upload/v1725542162/Gabit_CGM_1_1.avif",
			alt: "skin-care",
		},
		{
			image:
				"https://res.cloudinary.com/dmezmffej/image/upload/v1709882418/SkincareAssets/LandingPageCarousel/Skin-combos-for-app-1b.avif",
			alt: "skin-care",
		},
	];

	const handleDotClick = (index) => {
		setActiveSlide(index);
	};

	const handleConsultButtonClick = () => {
		navigate("/signin");
	};

	return (
		<div className="homeScreen" style={{ backgroundImage: `url(${homebg})` }}>
			{/* <div className="topSection">
        <h1 className="h">AYURVEDIC CONSULTATIONS</h1>
        <button className="consult-btn" onClick={handleConsultButtonClick}>
          Consult an Ayurvedic Doctor <br /> Book a Session
        </button>
      </div> */}

			<HeroSection />

			{/* pas section */}

			{/* <section class="concave-section bottomSection">
        <div class="hcontent">
          <QuestionnaireCarousel />
        </div>
      </section> */}

			{/* product section */}
			{/* <ProductSection /> */}

			{/* Benefits section */}
			<ShopBySkinType />

			{/* treatments */}
			<ShopByConcern />

			{/* talk of the town doctor section */}
			<TalkOfTheTown />

			{/* New treatments Section treatment section*/}
			<TreatmentSection />

			<YogaPositions />

			{/* whats hot in gabit.................................................................................... */}
			{/* <section className="NewUserHomePage_skinCarouselSection__NAw7l">
        <div className="SkinCarousel_skinHealth__APvJ6">
          <p className="SkinCarousel_heading__LxBzL title1-bold-m heading2-bold-d">
            What's <span> hot </span> at <span> Gabit</span>
          </p>
          <div className="SkinProductsCarousel_skinProductsCarousel__7voFv">
            <div className="CustomSlick_sliderContainer__fY_xB">
              <div className="slick-slider">
                <div className="slick-list">
                  <div
                    className="slick-track"
                    style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                  >
                    {carouselItems.map((item, index) => (
                      <div
                        key={index}
                        className={`slick-slide ${index === activeSlide ? 'slick-active' : ''}`}
                      >
                        <div className="SkinProductsCarousel_skinProductsCarouselCard__EWrON">
                          <div className="Image_wrapper__bkC8Y">
                            <img
                              alt={item.alt}
                              src={item.image}
                              style={{ width: '100%', height: 'auto' }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <ul className="slick-dots">
                  {carouselItems.map((_, index) => (
                    <li key={index} className={index === activeSlide ? 'slick-active' : ''}>
                      <button onClick={() => handleDotClick(index)}> </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section> */}

			<TopTransformationStories />

			<SuccessRate />

			<PlansSection />

			<RequestCallback />

			{/* <WhatToAchieve />  */}

			{/* <Promise /> */}
		</div>
	);
}

export default HomeScreen;
