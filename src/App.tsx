import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  Package, 
  Heart, 
  Trash2, 
  ArrowUpDown, 
  ShieldCheck, 
  Star, 
  Clock, 
  Check, 
  X, 
  MapPin, 
  Gift 
} from 'lucide-react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import { PRODUCTS } from './products';
import { Product, CartItem, HistoricOrder } from './types';

export default function App() {
  // Navigation & filtering states
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders'>('catalog');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceSort, setPriceSort] = useState<string>('default');

  // Modular overlay states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);

  // Persistent user state caches in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('aether_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('aether_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<HistoricOrder[]>(() => {
    const saved = localStorage.getItem('aether_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Small global visual alerts (notifying users when adding custom promos or hearting products)
  const [wishlistAlert, setWishlistAlert] = useState<string | null>(null);

  // Auto-sync user caches back to localStorage safely
  useEffect(() => {
    localStorage.setItem('aether_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('aether_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('aether_history', JSON.stringify(orders));
  }, [orders]);

  // Cart operations
  const handleAddToBag = (newItem: CartItem) => {
    setCart((prev) => {
      // Check if item exists in bag with identical specifications (color, size)
      const existingIdx = prev.findIndex(
        (item) => 
          item.product.id === newItem.product.id &&
          item.selectedColor === newItem.selectedColor &&
          item.selectedSize === newItem.selectedSize
      );

      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += newItem.quantity;
        return copy;
      }
      return [...prev, newItem];
    });
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    if (newQty < 1) {
      handleRemoveCartItem(index);
      return;
    }
    setCart((prev) => {
      const copy = [...prev];
      copy[index].quantity = newQty;
      return copy;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => setCart([]);

  // Wishlist/favorites actions
  const handleToggleWishlist = (product: Product) => {
    const isIncluded = wishlist.includes(product.id);
    if (isIncluded) {
      setWishlist((prev) => prev.filter((id) => id !== product.id));
      triggerWishlistAlert(`Selected item removed from log.`);
    } else {
      setWishlist((prev) => [...prev, product.id]);
      triggerWishlistAlert(`Item added to your personal index.`);
    }
  };

  const triggerWishlistAlert = (msg: string) => {
    setWishlistAlert(msg);
    setTimeout(() => {
      setWishlistAlert(null);
    }, 2500);
  };

  const handleRegisterNewOrder = (order: HistoricOrder) => {
    setOrders((prev) => [order, ...prev]);
  };

  // FILTERED CATALOG SELECTIONS
  const filteredProducts = PRODUCTS.filter((product) => {
    // 1. Category logic
    const categoryMatch = activeCategory === 'All' || product.category === activeCategory;
    
    // 2. Text Search logic
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery) ||
      product.features.some(f => f.toLowerCase().includes(normalizedQuery));

    return categoryMatch && matchesSearch;
  }).sort((a, b) => {
    if (priceSort === 'lowToHigh') return a.price - b.price;
    if (priceSort === 'highToLow') return b.price - a.price;
    if (priceSort === 'rating') return b.rating - a.rating;
    if (priceSort === 'popular') return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    return 0; // Default ordering
  });

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] flex flex-col justify-between font-serif selection:bg-[#1A1A1A] selection:text-white" id="monograph-ecom-app">
      
      {/* Top Universal Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartTotalCount}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        wishlistCount={wishlist.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Persistent global alerts */}
      {wishlistAlert && (
        <div 
          id="global-toast-alert" 
          className="fixed bottom-6 left-6 z-50 bg-[#1A1A1A] text-white border border-[#1A1A1A]/30 text-[10px] font-sans uppercase tracking-[0.15em] px-5 py-3.5 shadow-2xl flex items-center gap-2 animate-fade-in"
        >
          <Sparkles className="h-4 w-4 text-[#FAF9F6]" />
          <span>{wishlistAlert}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* VIEW 1: PRODUCT CATALOG & EXPLORATION SCREEN */}
        {activeTab === 'catalog' && (
          <div className="space-y-12 animate-fade-in">
            
            {/* Landing curated editorial hero card */}
            {!searchQuery && activeCategory === 'All' && (
              <div 
                id="hero-curation-banner"
                className="relative bg-white border border-[#1A1A1A]/10 p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center gap-8 justify-between"
              >
                <div className="max-w-2xl space-y-5">
                  <div className="flex items-center gap-2">
                    <span className="h-1 w-1 bg-[#1A1A1A] rounded-full"></span>
                    <span className="font-sans font-extrabold text-[10px] tracking-[0.3em] uppercase text-[#1A1A1A]/60">
                      Curation Volume No. 12
                    </span>
                  </div>
                  
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-[#1A1A1A] font-serif">
                    Simplicity as an <br/>
                    <span className="italic font-medium">intellectual luxury.</span>
                  </h2>
                  
                  <p className="text-sm text-[#1A1A1A]/80 leading-relaxed font-serif max-w-lg">
                    Monograph Atelier curated registry focuses on pristine structural lines, sustainable premium components, and functional excellence. Home staples, device containers, and modular accessories made for lifelong custody.
                  </p>

                  <div className="pt-4 flex flex-wrap gap-4 items-center">
                    <span className="inline-flex items-center gap-2 border border-[#1A1A1A]/20 bg-[#1A1A1A]/5 px-3 py-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-[#1A1A1A]">
                      <Gift className="h-3.5 w-3.5" /> Access Token: <strong className="font-mono underline">SAVE10</strong> (-10%)
                    </span>
                    <span className="text-[#1A1A1A]/30 hidden sm:inline">•</span>
                    <span className="text-[10px] font-sans font-semibold tracking-wider uppercase text-[#1A1A1A]/60">
                      Complimentary premium air transit on purchases above $75
                    </span>
                  </div>
                </div>

                {/* Aesthetic Art Print Block */}
                <div className="w-full md:w-72 aspect-square bg-[#E5E4E2] border border-[#1A1A1A]/10 flex flex-col items-center justify-center p-6 text-center shrink-0">
                  <div className="border border-[#1A1A1A]/5 px-4 py-8 bg-white/40 backdrop-blur-sm w-full h-full flex flex-col justify-between items-center">
                    <span className="font-mono text-[9px] text-[#1A1A1A]/40 tracking-widest uppercase">REGISTRY ARCHIVE</span>
                    <p className="text-3xl font-black font-serif italic text-[#1A1A1A] tracking-tighter">M.A.</p>
                    <div className="space-y-1">
                      <p className="font-sans font-bold text-[9px] uppercase tracking-widest text-[#1A1A1A]/70">ESTABLISHED 2026</p>
                      <p className="font-serif text-[10px] italic text-[#1A1A1A]/50">Pristine standards verified</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Catalog header statistics and search-sort controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-6">
              <div>
                <p className="text-[10px] text-[#1A1A1A]/45 font-sans font-bold tracking-[0.2em] uppercase">Document Inventory</p>
                <h3 className="text-xl font-bold text-[#1A1A1A] font-serif mt-1">
                  Registered Index: {filteredProducts.length} Atelier items
                  {activeCategory !== 'All' && <span className="italic font-medium text-[#1A1A1A]/60"> filtered by {activeCategory}</span>}
                </h3>
              </div>

              {/* Minimal Sort Dropdown */}
              <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                <label className="text-[10px] font-bold text-[#1A1A1A]/60 font-sans uppercase tracking-widest flex items-center gap-1.5" htmlFor="price-sort-select">
                  <ArrowUpDown className="h-3.5 w-3.5" /> Sort Sequence
                </label>
                <select
                  id="price-sort-select"
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value)}
                  className="bg-white border border-[#1A1A1A]/15 text-[11px] font-sans font-bold uppercase tracking-wider px-3.5 py-2.5 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition cursor-pointer"
                >
                  <option value="default font-sans">Sequence (Featured)</option>
                  <option value="lowToHigh font-sans">Valuation: Ascending</option>
                  <option value="highToLow font-sans">Valuation: Descending</option>
                  <option value="rating font-sans">Highest Certified Rated</option>
                  <option value="popular font-sans">Current Demand</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
                id="catalog-brick-grid"
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white border border-[#1A1A1A]/10" id="no-search-results">
                <p className="text-3xl text-[#1A1A1A]/40 font-serif">Empty query index</p>
                <h4 className="text-base font-bold text-[#1A1A1A] font-serif mt-3">No matching items in active catalog</h4>
                <p className="text-xs text-[#1A1A1A]/50 max-w-sm mx-auto mt-1 font-serif leading-relaxed">
                  Refine your search input or select alternate filter categories to discover items.
                </p>
                <button
                  id="reset-search-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                  }}
                  className="mt-6 px-6 py-3 bg-[#1A1A1A] text-white text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition"
                >
                  Clear All Filters
                </button>
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: HISTORICAL LOGGED ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-8 max-w-3xl mx-auto animate-fade-in" id="order-history-panel">
            
            <div className="flex justify-between items-end border-b border-[#1A1A1A]/10 pb-6">
              <div>
                <p className="text-[10px] text-[#1A1A1A]/45 font-sans font-bold tracking-[0.2em] uppercase">Document Registry</p>
                <h2 className="text-2xl font-bold text-[#1A1A1A] font-serif">Customer Receipt Inventory</h2>
              </div>
              <span className="text-[9px] font-sans font-extrabold tracking-[0.2em] border border-[#1A1A1A] px-3 py-1.5 uppercase bg-[#1A1A1A] text-white">
                Client Account Verified
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-24 bg-white border border-[#1A1A1A]/10 space-y-5" id="empty-orders-view">
                <div className="h-12 w-12 border border-[#1A1A1A]/10 flex items-center justify-center mx-auto text-[#1A1A1A]/30">
                  <Package className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold font-serif text-[#1A1A1A]">No order archives recorded</h3>
                  <p className="text-xs text-[#1A1A1A]/50 max-w-xs mx-auto font-serif leading-relaxed">
                    Submit a cart acquisition payload to populate shipping ledgers dynamically in true real-time.
                  </p>
                </div>
                <button
                  id="order-empty-back-explore"
                  onClick={() => setActiveTab('catalog')}
                  className="px-6 py-3 bg-[#1A1A1A] hover:opacity-95 text-[#FAF9F6] font-sans uppercase font-bold tracking-[0.2em] text-[10px]"
                >
                  Inspect Collection
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {orders.map((ord) => (
                  <div 
                    key={ord.orderId} 
                    id={`order-block-${ord.orderId}`}
                    className="bg-white border border-[#1A1A1A]/10"
                  >
                    
                    {/* Header bar of past order */}
                    <div className="p-5 sm:p-6 bg-[#FAF9F6]/80 border-b border-[#1A1A1A]/10 flex flex-col sm:flex-row justify-between gap-4 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div>
                          <p className="text-[9px] text-[#1A1A1A]/45 uppercase font-sans font-bold tracking-wider">Acquisition Date</p>
                          <p className="font-bold text-[#1A1A1A] mt-1 font-serif italic">{ord.date}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-[#1A1A1A]/45 uppercase font-sans font-bold tracking-wider">Archive Ledger</p>
                          <p className="font-mono font-bold text-[#1A1A1A] mt-1 text-[11px]">{ord.orderId}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-[#1A1A1A]/45 uppercase font-sans font-bold tracking-wider">Acquirer Client</p>
                          <p className="font-bold text-[#1A1A1A] mt-1 truncate max-w-[120px]" title={ord.shippingDetails.fullName}>
                            {ord.shippingDetails.fullName}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-[#1A1A1A]/45 uppercase font-sans font-bold tracking-wider">Invoiced Sum</p>
                          <p className="font-mono font-bold text-[#1A1A1A] mt-1">${ord.total.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                        <span className="w-2 h-2 rounded-full bg-[#1A1A1A] animate-pulse"></span>
                        <span className="font-bold text-[#1A1A1A] text-[9px] uppercase font-sans tracking-[0.2em]">Transit Dispatched</span>
                      </div>
                    </div>

                    {/* Products details inside order */}
                    <div className="p-6 divide-y divide-[#1A1A1A]/10">
                      {ord.items.map((item, id) => (
                        <div key={id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                          <img 
                            src={item.image} 
                            alt={item.productName} 
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 object-cover bg-[#E5E4E2] border border-[#1A1A1A]/10 shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold font-serif text-[#1A1A1A] truncate">{item.productName}</h4>
                            <p className="text-[9px] text-[#1A1A1A]/50 mt-1 font-semibold font-sans uppercase tracking-wider">
                              {item.selectedColor && `Tone: ${item.selectedColor}`}
                              {item.selectedColor && item.selectedSize && ` • `}
                              {item.selectedSize && `Scale: ${item.selectedSize}`}
                              {!item.selectedColor && !item.selectedSize && `Standard scale metric`}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-mono font-bold text-[#1A1A1A]">${(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-[10px] text-[#1A1A1A]/40 font-mono mt-0.5">Quantity {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Address details */}
                    <div className="p-5 bg-[#FAF9F6]/50 border-t border-[#1A1A1A]/10 grid md:grid-cols-2 gap-4 text-xs font-serif">
                      <div className="space-y-1">
                        <p className="font-bold text-[#1A1A1A] flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#1A1A1A]/55" /> Recipient Address Target
                        </p>
                        <p className="text-[#1A1A1A]/70 italic">
                          {ord.shippingDetails.fullName}, {ord.shippingDetails.address}, {ord.shippingDetails.city}, {ord.shippingDetails.zipCode}
                        </p>
                      </div>

                      <div className="space-y-1 md:text-right">
                        <p className="font-bold text-[#1A1A1A] flex items-center gap-1 md:justify-end">
                          <ShieldCheck className="h-3.5 w-3.5 text-[#1A1A1A]/55" /> Registered Protection Certification
                        </p>
                        <p className="text-[#1A1A1A]/50 text-[11px]">
                          Monograph Atelier Cargo Security System • Transit Dispatched.
                        </p>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </main>

      {/* FOOTER BLOCK */}
      <footer className="border-t border-[#1A1A1A]/10 bg-white py-12 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 bg-[#1A1A1A] flex items-center justify-center text-[#FAF9F6]">
              <ShoppingBag className="h-3.5 w-3.5" />
            </div>
            <span className="text-base font-black font-serif italic text-[#1A1A1A] tracking-tight">
              MONOGRAPH
            </span>
            <span className="text-[10px] font-mono text-[#1A1A1A]/40 ml-2">© 2026 Registry Archives. All custody rights reserved.</span>
          </div>
          
          <div className="flex gap-4 text-[10px] text-[#1A1A1A]/50 font-sans uppercase font-bold tracking-wider">
            <span className="hover:text-[#1A1A1A] cursor-pointer">Security Cert</span>
            <span>•</span>
            <span className="hover:text-[#1A1A1A] cursor-pointer">Terms of Custody</span>
            <span>•</span>
            <span>Atelier Privacy Ledger</span>
          </div>
        </div>
      </footer>

      {/* OVERLAY 1: DETAILS MODAL */}
      <ProductModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        onAddToBag={handleAddToBag}
        isWishlisted={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* OVERLAY 2: SHOPPING BAG DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onAddNewOrder={handleRegisterNewOrder}
      />

      {/* OVERLAY 3: FAVORITES WISHLIST DRAWER (MODULAR OVERLAY) */}
      {isWishlistOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-[#1A1A1A]/80 backdrop-blur-sm cursor-pointer"
          id="wishlist-overlay"
          onClick={() => setIsWishlistOpen(false)}
        >
          <div 
            className="w-full max-w-sm bg-[#FAF9F6] h-full shadow-2xl flex flex-col justify-between cursor-default border-l border-[#1A1A1A]/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#1A1A1A]/10 flex items-center justify-between">
              <h2 className="text-lg font-bold font-serif italic text-[#1A1A1A] flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500 fill-rose-500" /> Saved Index Entries
              </h2>
              <button 
                id="wishlist-close"
                onClick={() => setIsWishlistOpen(false)} 
                className="p-1 text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {wishlist.length === 0 ? (
                <div className="text-center py-24 text-[#1A1A1A]/40 space-y-4">
                  <Heart className="h-10 w-10 text-[#1A1A1A]/15 mx-auto" />
                  <p className="text-xs font-bold font-sans uppercase tracking-[0.15em] text-[#1A1A1A]">Your log is empty</p>
                  <p className="text-[11px] text-[#1A1A1A]/50 font-serif max-w-[210px] mx-auto leading-relaxed">Select items in the catalog using the heart marker to write notes and log favorites here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlist.map((id) => {
                    const item = PRODUCTS.find((p) => p.id === id);
                    if (!item) return null;
                    return (
                      <div 
                        key={id} 
                        id={`wishlist-item-${id}`}
                        className="flex gap-3 p-3 bg-white border border-[#1A1A1A]/10 relative hover:shadow-md transition"
                      >
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-cover bg-[#E5E4E2] border border-[#1A1A1A]/10 cursor-pointer" 
                          onClick={() => {
                            setSelectedProduct(item);
                            setIsWishlistOpen(false);
                          }}
                        />
                        <div className="flex-1 min-w-0 pr-6 select-none text-left">
                          <h4 
                            className="text-xs font-bold font-serif text-[#1A1A1A] truncate hover:underline cursor-pointer"
                            onClick={() => {
                              setSelectedProduct(item);
                              setIsWishlistOpen(false);
                            }}
                          >
                            {item.name}
                          </h4>
                          <p className="text-[9px] text-[#1A1A1A]/50 font-semibold font-sans uppercase tracking-wider mt-1">{item.category}</p>
                          <span className="text-xs font-mono font-bold text-[#1A1A1A] mt-1 block">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>

                        {/* Fast remove action */}
                        <button
                          id={`wishlist-remove-btn-${id}`}
                          onClick={() => handleToggleWishlist(item)}
                          className="absolute top-4 right-4 text-[#1A1A1A]/30 hover:text-rose-500 transition-colors p-1"
                          title="Remove bookmark"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[#1A1A1A]/10">
              <button
                id="wishlist-back-shop"
                onClick={() => setIsWishlistOpen(false)}
                className="w-full py-3 bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-white font-sans uppercase font-bold tracking-[0.15em] text-xs transition"
              >
                Return to Search
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
