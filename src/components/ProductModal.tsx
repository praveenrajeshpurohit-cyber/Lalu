import React, { useState } from 'react';
import { Star, X, Check, ShieldCheck, Heart, MapPin, Sparkles } from 'lucide-react';
import { Product, CartItem } from '../types';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToBag: (item: CartItem) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export default function ProductModal({
  product,
  isOpen,
  onClose,
  onAddToBag,
  isWishlisted,
  onToggleWishlist,
}: ProductModalProps) {
  if (!isOpen || !product) return null;

  const { name, category, price, rating, reviewCount, image, description, features, colors, sizes, inStock, reviews } = product;
  
  const [selectedColor, setSelectedColor] = useState<string>(colors && colors.length > 0 ? colors[0] : '');
  const [selectedSize, setSelectedSize] = useState<string>(sizes && sizes.length > 0 ? sizes[0] : '');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToBag = () => {
    if (!inStock) return;
    
    onAddToBag({
      product,
      quantity,
      selectedColor: selectedColor || undefined,
      selectedSize: selectedSize || undefined,
    });

    // Flash small inline toast
    setToastMessage(`Selected item placed in bag.`);
    setTimeout(() => {
      setToastMessage(null);
      onClose(); // Automatically close modal on success
    }, 1500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/80 backdrop-blur-sm overflow-y-auto"
      id="product-modal-container"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#FAF9F6] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#1A1A1A]/10 flex flex-col md:flex-row cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Visual Column */}
        <div className="md:w-1/2 bg-[#E1DFD6] relative p-8 flex flex-col justify-center min-h-[300px] md:min-h-[450px]">
          <img
            src={image}
            alt={name}
            referrerPolicy="no-referrer"
            className="w-full max-h-[400px] object-contain mix-blend-multiply"
          />
          
          <button
            id="modal-wishlist-toggle"
            onClick={() => onToggleWishlist(product)}
            className="absolute top-4 left-4 p-3 bg-[#FAF9F6] border border-[#1A1A1A]/10 text-[#1A1A1A]/40 hover:text-rose-600 transition-colors"
            title="Add item to wishlist"
          >
            <Heart className={`h-4.5 w-4.5 ${isWishlisted ? 'fill-rose-500 text-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Right Details Column Styling */}
        <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#1A1A1A]/10">
          <div>
            {/* Header / Brand */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[10px] uppercase font-sans font-extrabold text-[#1A1A1A] tracking-[0.25em] border border-[#1A1A1A] px-2.5 py-1">
                  {category}
                </span>
                <span className="text-[10px] text-[#1A1A1A]/50 ml-3 font-mono">EDITION 2026</span>
              </div>
              
              <button
                id="modal-close-btn"
                onClick={onClose}
                className="p-1 hover:bg-[#1A1A1A]/5 text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition"
                title="Dismiss overlay"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Product Title */}
            <h2 className="text-3xl font-serif font-black text-[#1A1A1A] leading-tight mb-2">
              {name}
            </h2>

            {/* Ratings row */}
            <div className="flex items-center gap-1.5 mb-6 text-xs">
              <div className="flex text-[#1A1A1A] select-none">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(rating) ? 'fill-[#1A1A1A] text-[#1A1A1A]' : 'text-[#1A1A1A]/10'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-[#1A1A1A] font-sans">{rating}</span>
              <span className="text-[#1A1A1A]/20 font-mono">•</span>
              <span 
                className="text-[#1A1A1A]/60 font-sans tracking-wide underline cursor-pointer hover:text-[#1A1A1A]" 
                onClick={() => setActiveTab('reviews')}
              >
                {reviewCount} index reviews
              </span>
            </div>

            {/* Price display panel */}
            <div className="border border-[#1A1A1A]/10 p-5 flex items-center justify-between mb-6 bg-[#1A1A1A]/5">
              <div>
                <p className="text-[9px] text-[#1A1A1A]/50 font-sans uppercase tracking-[0.2em]">Excl. Taxes</p>
                <p className="text-2xl font-bold text-[#1A1A1A] font-mono">${price.toFixed(2)}</p>
              </div>
              <span className={`text-[10px] font-bold px-3 py-1.5 font-sans tracking-[0.2em] uppercase border ${
                inStock ? 'border-[#1A1A1A] bg-[#FAF9F6] text-[#1A1A1A]' : 'border-rose-300 text-rose-700 bg-rose-50'
              }`}>
                {inStock ? 'Available' : 'Archived Out'}
              </span>
            </div>

            {/* Interactive Tabs Menu */}
            <div className="flex border-b border-[#1A1A1A]/15 mb-4 text-xs font-sans uppercase tracking-[0.16em] select-none">
              <button
                id="tab-btn-details"
                onClick={() => setActiveTab('details')}
                className={`pb-2.5 px-3 relative transition ${
                  activeTab === 'details' ? 'text-[#1A1A1A] font-bold' : 'text-[#1A1A1A]/40 hover:text-[#1A1A1A]'
                }`}
              >
                Description
                {activeTab === 'details' && <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#1A1A1A]"></span>}
              </button>
              <button
                id="tab-btn-reviews"
                onClick={() => setActiveTab('reviews')}
                className={`pb-2.5 px-3 relative transition ${
                  activeTab === 'reviews' ? 'text-[#1A1A1A] font-bold' : 'text-[#1A1A1A]/40 hover:text-[#1A1A1A]'
                }`}
              >
                Reviews ({reviews.length})
                {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#1A1A1A]"></span>}
              </button>
            </div>

            {/* Content Tabs */}
            {activeTab === 'details' ? (
              <div className="space-y-4">
                <p className="text-sm text-[#1A1A1A]/80 font-serif leading-relaxed">
                  {description}
                </p>
                
                {/* Features list */}
                <div className="space-y-2">
                  <p className="text-[10px] font-sans font-bold text-[#1A1A1A] uppercase tracking-[0.15em]">Key features:</p>
                  <ul className="space-y-1.5 text-xs text-[#1A1A1A]/70 font-serif">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-[#1A1A1A]/50 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Colors Select */}
                {colors && colors.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] font-sans font-bold text-[#1A1A1A] uppercase tracking-[0.15em]">
                      Material Tone: <span className="text-[#1A1A1A]/60 italic font-medium font-serif">{selectedColor}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {colors.map((color) => (
                        <button
                          key={color}
                          id={`color-choice-${color.toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={() => setSelectedColor(color)}
                          className={`px-3 py-1.5 text-[10px] font-sans font-medium uppercase tracking-wide border transition ${
                            selectedColor === color
                              ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                              : 'border-[#1A1A1A]/10 bg-transparent text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes Select */}
                {sizes && sizes.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] font-sans font-bold text-[#1A1A1A] uppercase tracking-[0.15em]">
                      Scale Metric: <span className="text-[#1A1A1A] font-mono text-[11px] font-bold">{selectedSize}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          id={`size-choice-${size}`}
                          onClick={() => setSelectedSize(size)}
                          className={`w-9 h-9 flex items-center justify-center text-[11px] font-mono border transition ${
                            selectedSize === size
                              ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white font-bold'
                              : 'border-[#1A1A1A]/10 bg-transparent text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-4 border border-[#1A1A1A]/10 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#1A1A1A]">{rev.reviewer}</span>
                        <span className="text-[9px] text-[#1A1A1A]/40 font-mono">{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#1A1A1A] mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-2.5 w-2.5 ${i < rev.rating ? 'fill-[#1A1A1A] text-[#1A1A1A]' : 'text-[#1A1A1A]/10'}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[#1A1A1A]/80 font-serif italic">"{rev.comment}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-[#1A1A1A]/40">
                    No registry reviews found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stepper counters & submit bag items */}
          <div className="pt-6 border-t border-[#1A1A1A]/15 mt-8 space-y-4">
            
            {/* Display internal toast success */}
            {toastMessage && (
              <div id="modal-toast-alert" className="p-3 border border-[#1A1A1A] bg-[#1A1A1A] text-white text-[10px] font-sans uppercase tracking-[0.15em] text-center flex items-center justify-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {toastMessage}
              </div>
            )}

            {inStock && (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center border border-[#1A1A1A]/20 overflow-hidden shrink-0">
                  <button
                    id="modal-qty-deg"
                    onClick={handleDecrement}
                    className="p-3 text-xs font-bold text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5 active:bg-[#1A1A1A]/10 transition"
                    title="Less quantity"
                  >
                    -
                  </button>
                  <span id="modal-qty-val" className="px-4 text-xs font-mono font-bold text-[#1A1A1A] select-none">
                    {quantity}
                  </span>
                  <button
                    id="modal-qty-inc"
                    onClick={handleIncrement}
                    className="p-3 text-xs font-bold text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5 active:bg-[#1A1A1A]/10 transition"
                    title="More quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  id="modal-submit-add"
                  onClick={handleAddToBag}
                  className="flex-1 py-3 px-6 bg-[#1A1A1A] hover:bg-[#1A1A1A]/85 text-white font-sans uppercase tracking-[0.15em] font-extrabold text-xs cursor-pointer transition active:translate-y-[1px]"
                >
                  Place in Bag • ${(price * quantity).toFixed(2)}
                </button>
              </div>
            )}

            {/* Extra Editorial trust badges */}
            <div className="flex items-center justify-center gap-4 text-[9px] text-[#1A1A1A]/40 font-mono pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#1A1A1A]/50" /> VERIFIED REGISTRY
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-[#1A1A1A]/50" /> AIR DELIVERY
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
