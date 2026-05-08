import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addItem } from '../../redux/cartSlice';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import './ProductCard.css';

const BACKEND_URL = `${import.meta.env.VITE_API_URL}`;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600';

/**
 * Resolves a product image path to a full displayable URL.
 */
const resolveImageUrl = (imagePath) => {
  if (!imagePath || imagePath.trim() === '') return FALLBACK_IMAGE;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${BACKEND_URL}${cleanPath}`;
};

const ProductCard = ({ product, isAdmin, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const imageUrl = imgError ? FALLBACK_IMAGE : resolveImageUrl(product.image);

  const [quantity, setQuantity] = useState(1);

  // Sync quantity with cart if item exists
  React.useEffect(() => {
    const existingItem = cartItems.find(item => String(item.id) === String(product.id));
    if (existingItem) {
      setQuantity(existingItem.quantity);
    } else {
      setQuantity(1);
    }
  }, [product.id, cartItems]);

  const { showToast } = useToast();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();

    // Mandatory Login Check
    const user = localStorage.getItem('user');
    if (!user) {
      showToast("Login required to add to cart", "error");
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        navigate('/login');
      }, 800);
      return;
    }

    dispatch(addItem({
      id: product.id,
      name: product.name,
      price: product.price || 0,
      image: product.image,
      quantity: quantity,
      replace: true
    }));
  };

  const handleQtyChange = (e, delta) => {
    e.stopPropagation();
    e.preventDefault();
    const newQty = quantity + delta;
    if (newQty >= 1) {
      setQuantity(newQty);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.slug || product.id}`);
  };

  return (
    <div className={`product-card ${isShaking ? 'shake-animation' : ''}`} onClick={handleCardClick}>
      <div className="product-image-container">
        <img
          src={imageUrl}
          alt={product.name}
          className="product-image"
          onError={() => setImgError(true)}
        />
        <div className="product-badges">
          {product.isNew && <span className="badge badge-new">New</span>}
          {product.isFeatured && <span className="badge badge-featured">Featured</span>}
        </div>

        {isAdmin && (
          <div className="admin-quick-actions" onClick={(e) => e.stopPropagation()}>
            <button className="admin-btn edit" onClick={() => onEdit(product)}>Edit</button>
            <button className="admin-btn delete" onClick={() => onDelete(product.id)}>Delete</button>
          </div>
        )}
      </div>

      <div className="product-info">
        <div className="product-meta">
          <p className="product-category">{product.category}</p>
          {product.sku && <span className="product-sku">SKU: {product.sku}</span>}
        </div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-specs">{product.specs}</p>

        <div className="product-footer">
          <div className="product-pricing">
            {product.price ? (
              <span className="product-price">₹{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            ) : (
              <span className="product-price quote">Request Quote</span>
            )}
          </div>

          <div className="product-action-row" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
            {!isAdmin ? (
              <>
                <div className="product-qty-control">
                  <button className="qty-btn-small" onClick={(e) => handleQtyChange(e, -1)}>-</button>
                  <span className="qty-display-small">{quantity}</span>
                  <button className="qty-btn-small" onClick={(e) => handleQtyChange(e, 1)}>+</button>
                </div>
                <button
                  className="add-to-cart-btn"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart size={16} />
                  <span>Add</span>
                </button>
              </>
            ) : (
              <span className="admin-view-only" style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>View Only</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { resolveImageUrl };
export default ProductCard;
