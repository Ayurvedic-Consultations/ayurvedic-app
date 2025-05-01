import React from 'react';
import './RequestCallback.css';
import call from '../media/call.png';

const RequestCallback = () => {
  return (
    <section className="new-user-homepage">
      <div className="request-callback-container">
        <div className="request-callback-content">
          <h3 className="title">Request a callback</h3>
          <p className="subtitle">Know more about our plans or Smart Ring</p>
          <div className="right-arrow-wrapper">
            <i className="icon-arrow-right"></i>
          </div>
          <button className="request-callback-btn">Request Callback</button>
          <a href="tel:+91999999999" className="call-us-link">
            Or call us on +91 99999 99999
          </a>
        </div>
        <div className="image-wrapper">
          <img
            alt="callback-person-illustration"
            className="callback-image"
            loading="lazy"
            decoding="async"
            src={call}
          />
        </div>
      </div>
    </section>
  );
};

export default RequestCallback;
