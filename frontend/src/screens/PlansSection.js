import React from 'react';
import './PlansSection.css';

const PlansSection = () => {
  // Lite and Pro plan data with proper properties
  const litePlans = [
    { title: 'Free Trial', description: 'Description for A1', price: '0', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
    { title: 'Free Trial', description: 'Description for A2', price: '0', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
    { title: 'Free Trial', description: 'Description for A3', price: '0', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
    
  ];

  const proPlans = [
    { title: 'Pro Plan A1', description: 'Description for A1', price: '9.99', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
    { title: 'Pro Plan A2', description: 'Description for A2', price: '14.99', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
    { title: 'Pro Plan A3', description: 'Description for A3', price: '9.99', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
    
  ];

  // Render
  return (
    <section className="plans-section">
      <h2 className="plans-title">Subscription Plans</h2>

      {/* Lite Plans */}
      <h3>Current Plans (valid for 2 Months)</h3>
      <div className="lite-plans">
        <div className="plans-container">
          {litePlans.map((plan, index) => (
            <div key={index} className="plan">
              <div className="inner">
                <span className="pricing">
                  <span>₹{plan.price} <small>/ m</small></span>
                </span>
                <p className="title">{plan.title}</p>
                <p className="info">{plan.description}</p>
                <ul className="features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <span className="icon">
                        <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0 0h24v24H0z" fill="none"></path>
                          <path fill="currentColor" d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
                        </svg>
                      </span>
                      <span><strong>{feature}</strong></span>
                    </li>
                  ))}
                </ul>
                <div className="action">
                  <a className="button" href="#">
                    Choose plan
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Plans */}
    {/*<h3>Pro Plans</h3>
      <div className="pro-plans">
        <div className="plans-container">
          {proPlans.map((plan, index) => (
            <div key={index} className="plan">
              <div className="inner">
                <span className="pricing">
                  <span>${plan.price} <small>/ m</small></span>
                </span>
                <p className="title">{plan.title}</p>
                <p className="info">{plan.description}</p>
                <ul className="features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <span className="icon">
                        <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0 0h24v24H0z" fill="none"></path>
                          <path fill="currentColor" d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
                        </svg>
                      </span>
                      <span><strong>{feature}</strong></span>
                    </li>
                  ))}
                </ul>
                <div className="action">
                  <a className="button" href="#">
                    Choose plan
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>*/}
    </section>
  );
};

export default PlansSection;
