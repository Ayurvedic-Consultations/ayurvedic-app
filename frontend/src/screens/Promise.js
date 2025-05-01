import React from 'react';
import './Promise.css';

const PromiseSection = () => {
  return (
    <section className="new-user-homepage-promise">
      <div className="promise-section">
        {/* Background Images */}
        <img
          alt="Gabit Promise top background"
          loading="lazy"
          className="promise-bg-images promise-bg1"
          src="https://assets.prod.gabit.com/2024-12-13-6f29653/_next/static/media/PromiseBgTop.896beda4.webp"
        />
        <img
          alt="Gabit Promise bottom background"
          loading="lazy"
          className="promise-bg-images promise-bg2"
          src="https://assets.prod.gabit.com/2024-12-13-6f29653/_next/static/media/PromiseBgBottom.e24cdd3f.webp"
        />

        <div className="promise-custom-container">
          <div className="promise-content">
            <div className="promise-heading">
              <span className="promise-heading-highlight">Gabit</span> Promise
            </div>
            <div className="promise-tags">
              <div className="promise-tag">Honest</div>
              <div className="promise-tag">Goal-focused</div>
              <div className="promise-tag">Good for you</div>
              <div className="promise-tag">Good for the planet</div>
              <div className="promise-tag">Giving back</div>
            </div>
          </div>

          <div className="promise-promise-img-container">
            <img
              alt="Visual representation of Gabit Promise"
              loading="lazy"
              className="promise-promise-img"
              src="https://assets.prod.gabit.com/2024-12-13-6f29653/_next/static/media/sPromise.16a09ac1.png"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromiseSection;
