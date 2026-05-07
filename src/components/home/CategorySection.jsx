import React from 'react';
import { ArrowRight } from 'lucide-react';
import './CategorySection.css';

const categories = [
  { id: 1, name: "Power Tools", count: "142 Products", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400" },
  { id: 2, name: "Hydraulics", count: "86 Products", image: "https://images.unsplash.com/photo-1541888087799-a6e59ad7ebbf?auto=format&fit=crop&q=80&w=400" },
  { id: 3, name: "Safety Apparel", count: "215 Products", image: "https://images.unsplash.com/photo-1601053075306-3837f401f5cf?auto=format&fit=crop&q=80&w=400" },
  { id: 4, name: "Material Handling", count: "54 Products", image: "https://images.unsplash.com/photo-1586528116311-ad8ed7450141?auto=format&fit=crop&q=80&w=400" },
  { id: 5, name: "Measurement", count: "112 Products", image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=400" },
  { id: 6, name: "Heavy Machinery", count: "24 Products", image: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&q=80&w=400" },
];

const CategorySection = () => {
  return (
    <section className="category-section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Find exactly what you need quickly and efficiently.</p>
          </div>
        </div>

        <div className="category-grid">
          {categories.map((cat) => (
            <a href="#" key={cat.id} className="category-card">
              <div className="category-image">
                <img src={cat.image} alt={cat.name} />
                <div className="category-overlay"></div>
              </div>
              <div className="category-content">
                <h3>{cat.name}</h3>
                <p>{cat.count}</p>
                <span className="category-link">View Products <ArrowRight size={16} /></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
