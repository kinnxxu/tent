import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, Award, Hammer } from 'lucide-react';
import './WhyChooseUsSection.css';

const reasons = [
  {
    id: 1,
    icon: <ShieldCheck size={32} />,
    title: "Certified Quality",
    shortDesc: "Guaranteed Performance",
    desc: "All our products meet stringent international safety and performance standards. We enforce a zero-tolerance policy for defects, ensuring every component you receive is industrial-grade and field-ready.",
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    icon: <Clock size={32} />,
    title: "Fast Shipping",
    shortDesc: "Logistics Excellence",
    desc: "Leveraging our advanced supply chain network, we guarantee prompt delivery across 50+ countries. Reduce your machine downtime with our expedited 48-hour dispatch protocols.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8ed7450141?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    icon: <Award size={32} />,
    title: "Industry Experts",
    shortDesc: "20 Years Experience",
    desc: "Backed by decades of engineering excellence, our support team doesn't just process orders—they solve thermodynamic and mechanical load problems for your specific use-case.",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 4,
    icon: <Hammer size={32} />,
    title: "Custom Solutions",
    shortDesc: "Bespoke Manufacturing",
    desc: "Need specialized machinery? Our automated fabrication facilities can build custom CNC spares, bespoke hydraulic seals, and modified bearing architectures to fit your schematics.",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800"
  },
];

const WhyChooseUsSection = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev === reasons.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [active]);

  return (
    <section className="why-choose-us">
      <div className="container wcu-container">

        {/* Left Side: Navigation Array */}
        <div className="wcu-text-side">
          <h2 className="section-title">Why Leaders Choose Us</h2>
          <p className="section-subtitle">
            Interact with our core pillars below to see what makes us the apex supplier for heavy industry.
          </p>

          <div className="wcu-interactive-list">
            {reasons.map((r, index) => (
              <div
                key={r.id}
                className={`wcu-interactive-tab ${index === active ? 'active' : ''}`}
                onClick={() => setActive(index)}
              >
                <div className="wcu-tab-icon">{r.icon}</div>
                <div className="wcu-tab-text">
                  <h4>{r.title}</h4>
                  <span>{r.shortDesc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Dynamic Content Display */}
        <div className="wcu-visual-side">
          <div className="wcu-dynamic-display">
            {reasons.map((r, index) => (
              <div
                key={r.id}
                className={`wcu-display-panel ${index === active ? 'active' : ''}`}
              >
                <div className="wcu-panel-image">
                  <img src={r.image} alt={r.title} />
                  <div className="wcu-image-overlay"></div>
                </div>
                <div className="wcu-panel-content glass-panel">
                  <div className="wcu-panel-icon">{r.icon}</div>
                  <h3>{r.title}</h3>
                  <p>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUsSection;
