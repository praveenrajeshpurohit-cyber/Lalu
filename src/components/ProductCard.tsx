import React from 'react';
import { Star, Heart, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string;
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export default function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onSelectProduct,
}: ProductCardProps) {
  const { name, category, price, rating, reviewCount, image, description, inStock, isPopular } = product;

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group relative flex flex-col bg-white border border-[#1A1A1A]/10 transition-all duration-300 hover:shadow-lg hover:shadow-[#1A1A1A]/5"
    >
      {/* Product Image Stage */}
      <div 
        className="relative overflow-hidden aspect-[4/3] bg-[#E5E4E2] cursor-pointer border-b border-[#1A1A1A]/10"
        onClick={() => onSelectProduct(product)}
      >
        <img
          src={image}
          alt={name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
        />
        
        {/* Editorial Popularity Stamp */}
        {isPopular && inStock && (
          <span className="absolute top-4 left-4 bg-[#1A1A1A] text-[#FAF9F6] font-sans text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 font-bold">
            Popular Draft
          </span>
        )}

        {/* Back in stock alert */}
        {!inStock && (
          <div className="absolute inset-0 bg-[#FAF9F6]/85 backdrop-blur-[1px] flex items-center justify-center">
            <span className="border border-[#1A1A1A]/30 text-[#1A1A1A] font-sans text-[10px] font-bold px-4 py-2 uppercase tracking-[0.22em]">
              Archive Sold Out
            </span>
          </div>
        )}

        {/* Quick View trigger */}
        {inStock && (
          <div className="absolute inset-0 bg-[#1A1A1A]/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
            <button 
              id={`quick-view-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectProduct(product);
              }}
              className="flex items-center gap-1.5 px-6 py-3 bg-[#FAF9F6] text-[#1A1A1A] font-sans font-bold text-[9px] uppercase tracking-[0.2em] border border-[#1A1A1A]/10 shadow-md hover:bg-white transition-all duration-205"
            >
              <Eye className="h-3.5 w-3.5" />
              Quick Study
            </button>
          </div>
        )}
      </div>

      {/* Card Details Desk */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          {/* Metadata tag / Saved status */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-sans font-bold text-[#1A1A1A]/50 uppercase tracking-[0.2em]">
              {category}
            </span>
            
            <button
              id={`wishlist-btn-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              className="p-1 hover:bg-[#1A1A1A]/5 text-[#1A1A1A]/40 hover:text-rose-600 transition-colors"
              title={isWishlisted ? "Remove bookmarked item" : "Bookmark item"}
            >
              <Heart 
                className={`h-4 w-4 transition-colors ${
                  isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-[#1A1A1A]/40'
                }`} 
              />
            </button>
          </div>

          {/* Title */}
          <h3 
            className="text-xl font-medium text-[#1A1A1A] font-serif leading-tight line-clamp-1 cursor-pointer hover:underline underline-offset-4 decoration-1"
            onClick={() => onSelectProduct(product)}
          >
            {name}
          </h3>

          {/* Short description */}
          <p className="text-xs text-[#1A1A1A]/70 font-serif mt-2.5 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Separator and interactive footer pricing row */}
        <div className="mt-5">
          {/* Star review system */}
          <div className="flex items-center gap-1 mb-4">
            <div className="flex text-[#1A1A1A] select-none">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(rating)
                      ? 'fill-[#1A1A1A] text-[#1A1A1A]'
                      : 'text-[#1A1A1A]/10'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-sans font-bold text-[#1A1A1A] ml-1">{rating}</span>
            <span className="text-[#1A1A1A]/20 text-[10px] font-sans font-bold">•</span>
            <span className="text-[10px] font-sans text-[#1A1A1A]/50 font-medium">({reviewCount} reviews)</span>
          </div>

          <div className="h-[1px] bg-[#1A1A1A]/10 w-full mb-4"></div>

          {/* Price & Selection button */}
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-[9px] text-[#1A1A1A]/40 font-sans uppercase tracking-[0.25em]">Valuation</span>
              <span className="text-lg font-bold text-[#1A1A1A] font-mono tracking-tight">
                ${price.toFixed(2)}
              </span>
            </div>

            <button
              id={`cta-card-view-${product.id}`}
              onClick={() => onSelectProduct(product)}
              className={`px-5 py-2.5 text-[9px] font-sans uppercase font-bold tracking-[0.2em] transition cursor-pointer ${
                inStock 
                  ? 'bg-[#1A1A1A] text-white hover:opacity-90' 
                  : 'bg-[#1A1A1A]/10 text-[#1A1A1A]/40 cursor-not-allowed'
              }`}
            >
              {inStock ? 'Inspect' : 'Sold Out'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
