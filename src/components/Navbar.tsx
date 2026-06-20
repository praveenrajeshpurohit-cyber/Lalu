import React from 'react';
import { Search, ShoppingBag, Heart, Package, Sparkles, X } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  onOpenCart: () => void;
  cartCount: number;
  onOpenWishlist: () => void;
  wishlistCount: number;
  activeTab: 'catalog' | 'orders';
  setActiveTab: (tab: 'catalog' | 'orders') => void;
}

const CATEGORIES = ['All', 'Electronics', 'Apparel', 'Home & Living', 'Accessories'];

export default function Navbar({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  onOpenCart,
  cartCount,
  onOpenWishlist,
  wishlistCount,
  activeTab,
  setActiveTab,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#1A1A1A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo Brand / Editorial Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer shrink-0"
            onClick={() => {
              setActiveTab('catalog');
              setActiveCategory('All');
              setSearchQuery('');
            }}
          >
            <div className="h-9 w-9 bg-[#1A1A1A] flex items-center justify-center text-[#FAF9F6]">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter italic font-serif text-[#1A1A1A]">
                MONOGRAPH
              </h1>
              <p className="text-[9px] text-[#1A1A1A]/50 font-sans tracking-[0.2em] uppercase">Atelier Catalog</p>
            </div>
          </div>

          {/* Search bar - crisp clean input */}
          {activeTab === 'catalog' && (
            <div className="hidden md:flex flex-1 max-w-md relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#1A1A1A]/40">
                <Search className="h-4 w-4" />
              </div>
              <input
                id="search-input-desktop"
                type="text"
                placeholder="Search monograph collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 bg-transparent border border-[#1A1A1A]/20 text-xs font-sans placeholder-[#1A1A1A]/45 focus:outline-none focus:border-[#1A1A1A] transition-all text-[#1A1A1A]"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-[#1A1A1A]/50 hover:text-[#1A1A1A]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Right Navigation Controls - Minimalist sans labels */}
          <div className="flex items-center gap-1 sm:gap-3">
            
            {/* Explore Button */}
            <button
              id="tab-catalog"
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-sans uppercase tracking-widest transition ${
                activeTab === 'catalog'
                  ? 'border-b border-[#1A1A1A] text-[#1A1A1A] font-bold'
                  : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Explore</span>
            </button>

            {/* Orders Button */}
            <button
              id="tab-orders"
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-sans uppercase tracking-widest transition ${
                activeTab === 'orders'
                  ? 'border-b border-[#1A1A1A] text-[#1A1A1A] font-bold'
                  : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Archive</span>
            </button>

            <span className="h-4 w-[1px] bg-[#1A1A1A]/10 hidden sm:block"></span>

            {/* Wishlist Button */}
            <button
              id="wishlist-trigger"
              onClick={onOpenWishlist}
              className="relative p-2 text-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition"
              title="Saved Favorites"
            >
              <Heart className="h-4 w-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#1A1A1A] text-white font-mono text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="cart-trigger"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 p-2 px-3 bg-[#1A1A1A] hover:opacity-90 text-[#FAF9F6] text-[10px] font-sans uppercase tracking-widest transition"
              title="Open Bag"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Bag</span>
              <span className="bg-[#FAF9F6] text-[#1A1A1A] font-mono text-[9px] font-bold h-4.5 px-1.5 flex items-center justify-center">
                {cartCount}
              </span>
            </button>

          </div>
        </div>

        {/* Mobile Search */}
        {activeTab === 'catalog' && (
          <div className="md:hidden pb-4 relative">
            <div className="absolute inset-y-0 left-3 top-0 bottom-4 flex items-center pointer-events-none text-[#1A1A1A]/40">
              <Search className="h-4 w-4" />
            </div>
            <input
              id="search-input-mobile"
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-transparent border border-[#1A1A1A]/25 text-xs font-sans focus:outline-none focus:border-[#1A1A1A] text-[#1A1A1A]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-3 top-0 bottom-4 flex items-center text-[#1A1A1A]/50"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Categories Bar */}
        {activeTab === 'catalog' && (
          <div className="flex items-center gap-1 overflow-x-auto py-2.5 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none border-t border-[#1A1A1A]/10">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                id={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1 text-[11px] font-sans uppercase tracking-widest transition cursor-pointer select-none ${
                  activeCategory === category
                    ? 'font-bold text-[#1A1A1A] bg-[#1A1A1A]/5 underline decoration-2 underline-offset-4'
                    : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
