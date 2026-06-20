import React, { useState } from 'react';
import { X, Trash2, Tag, ShieldCheck, CreditCard, MapPin, CheckCircle, ArrowLeft, Heart, Sparkles } from 'lucide-react';
import { CartItem, ShippingDetails, PaymentDetails, PromoCode, HistoricOrder } from '../types';
import { VALID_PROMOS } from '../products';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onAddNewOrder: (order: HistoricOrder) => void;
}

type CheckoutStep = 'basket' | 'shipping' | 'payment' | 'success';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onAddNewOrder,
}: CartDrawerProps) {
  if (!isOpen) return null;

  // Checkout states
  const [step, setStep] = useState<CheckoutStep>('basket');
  
  // Promo states
  const [promoInput, setPromoInput] = useState<string>('');
  const [activePromo, setActivePromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Form states
  const [shipping, setShipping] = useState<ShippingDetails>({
    fullName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
  });

  const [payment, setPayment] = useState<PaymentDetails>({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generatedOrder, setGeneratedOrder] = useState<HistoricOrder | null>(null);

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  // Promo Code Deduct logic
  let discountAmount = 0;
  if (activePromo) {
    if (activePromo.discountType === 'percentage') {
      discountAmount = subtotal * (activePromo.discountValue / 100);
    } else if (activePromo.discountType === 'fixed') {
      const limit = activePromo.minAmount || 0;
      if (subtotal >= limit) {
        discountAmount = activePromo.discountValue;
      }
    }
  }

  // Shipping cost logic: Free over $75, if promo has a free ship rule, apply
  const basicShipping = subtotal > 75 ? 0 : 5.99;
  const appliedShipping = activePromo?.code === 'FREESHIP' && subtotal >= (activePromo.minAmount || 0) ? 0 : basicShipping;

  const currentTax = (subtotal - discountAmount) * 0.08;
  const grandTotal = Math.max(0, subtotal - discountAmount + appliedShipping + currentTax);

  // Prompt Coupon Submit
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const code = promoInput.trim().toUpperCase();

    const matched = VALID_PROMOS.find(p => p.code === code);
    if (!matched) {
      setPromoError('Unknown voucher code. Try WELCOME20 or SAVE10');
      return;
    }

    if (matched.minAmount && subtotal < matched.minAmount) {
      setPromoError(`Requires a minimum buy of $${matched.minAmount}`);
      return;
    }

    setActivePromo(matched);
    setPromoInput('');
  };

  const handleRemovePromo = () => {
    setActivePromo(null);
  };

  // Card Formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setPayment(p => ({ ...p, cardNumber: parts.join(' ') }));
    } else {
      setPayment(p => ({ ...p, cardNumber: value }));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setPayment(p => ({ ...p, expiryDate: value.slice(0, 5) }));
  };

  // Form Validations
  const validateShippingForm = () => {
    const errorLog: Record<string, string> = {};
    if (!shipping.fullName.trim()) errorLog.fullName = 'Full Name is required';
    if (!shipping.email.trim() || !/\S+@\S+\.\S+/.test(shipping.email)) errorLog.email = 'Valid Email is required';
    if (!shipping.address.trim()) errorLog.address = 'Street address is required';
    if (!shipping.city.trim()) errorLog.city = 'City is required';
    if (!shipping.zipCode.trim() || shipping.zipCode.length < 5) errorLog.zipCode = 'Valid Zip code required';

    setFieldErrors(errorLog);
    return Object.keys(errorLog).length === 0;
  };

  const validatePaymentForm = () => {
    const errorLog: Record<string, string> = {};
    const formattedCardNo = payment.cardNumber.replace(/\s+/g, '');
    
    if (!payment.cardName.trim()) errorLog.cardName = 'Name on Card is required';
    if (formattedCardNo.length < 15) errorLog.cardNumber = 'Valid 16-digit Card Number required';
    if (!payment.expiryDate.trim() || !/^\d{2}\/\d{2}$/.test(payment.expiryDate)) errorLog.expiryDate = 'Format must be MM/YY';
    if (payment.cvv.length < 3) errorLog.cvv = 'Valid CVV required';

    setFieldErrors(errorLog);
    return Object.keys(errorLog).length === 0;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShippingForm()) {
      setStep('payment');
      setFieldErrors({});
    }
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePaymentForm()) {
      const orderId = `MONO-${Math.floor(10000 + Math.random() * 90000)}-${new Date().getFullYear()}`;
      
      const newOrder: HistoricOrder = {
        orderId,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        items: cartItems.map(item => ({
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          image: item.product.image,
        })),
        subtotal,
        discount: discountAmount,
        shipping: appliedShipping,
        tax: currentTax,
        total: grandTotal,
        shippingDetails: shipping,
      };

      onAddNewOrder(newOrder);
      setGeneratedOrder(newOrder);
      onClearCart();
      
      setStep('success');
      setFieldErrors({});
      setActivePromo(null);
    }
  };

  const handleAllDone = () => {
    setStep('basket');
    setGeneratedOrder(null);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-[#1A1A1A]/80 backdrop-blur-sm cursor-pointer animate-fade-in"
      id="cart-drawer-overlay"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#FAF9F6] h-full shadow-2xl flex flex-col justify-between cursor-default border-l border-[#1A1A1A]/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Drawer */}
        <div className="p-6 border-b border-[#1A1A1A]/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step !== 'basket' && step !== 'success' && (
              <button 
                id="cart-back-btn"
                onClick={() => setStep(step === 'payment' ? 'shipping' : 'basket')}
                className="p-1 pr-3 text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition flex items-center gap-1 text-[10px] uppercase font-sans tracking-wider"
              >
                <ArrowLeft className="h-3 w-3" />
                Back
              </button>
            )}
            <h2 className="text-xl font-bold font-serif italic text-[#1A1A1A]">
              {step === 'basket' && 'Atelier Card / Bag'}
              {step === 'shipping' && 'Delivery Ledger'}
              {step === 'payment' && 'Financial Processing'}
              {step === 'success' && 'Transaction Complete'}
            </h2>
          </div>
          <button 
            id="cart-close-btn"
            onClick={onClose} 
            className="p-1 hover:bg-[#1A1A1A]/5 text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Contents Pane */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* STEP 1: BASKET ITEMS */}
          {step === 'basket' && (
            <>
              {cartItems.length === 0 ? (
                <div className="text-center py-20 space-y-6">
                  <div className="h-12 w-12 border border-[#1A1A1A]/10 flex items-center justify-center mx-auto text-[#1A1A1A]/30 bg-white">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-bold font-serif text-[#1A1A1A]">No entries in bag</h3>
                    <p className="text-xs text-[#1A1A1A]/50 max-w-[240px] mx-auto font-serif leading-relaxed">
                      Select from our archived volumes and curations to complete your collection.
                    </p>
                  </div>
                  <button
                    id="cart-empty-shop-now"
                    onClick={onClose}
                    className="px-6 py-3 bg-[#1A1A1A] text-[#FAF9F6] text-[10px] font-sans uppercase font-bold tracking-[0.2em] transition"
                  >
                    View Catalog
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div 
                      key={`${item.product.id}-${index}`} 
                      className="flex gap-4 p-4 bg-white border border-[#1A1A1A]/10 relative group"
                    >
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 object-cover bg-[#E5E4E2] border border-[#1A1A1A]/10" 
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold font-serif text-[#1A1A1A] pr-6 truncate">
                          {item.product.name}
                        </h4>
                        
                        {(item.selectedColor || item.selectedSize) && (
                          <div className="flex flex-wrap gap-2 mt-1.5 text-[9px] text-[#1A1A1A]/50 font-sans uppercase tracking-wider font-semibold">
                            {item.selectedColor && <span>Tone: {item.selectedColor}</span>}
                            {item.selectedSize && <span>Scale: {item.selectedSize}</span>}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs font-bold font-mono text-[#1A1A1A]">
                            ${item.product.price.toFixed(2)}
                          </span>

                          {/* Stepper Inside Cart */}
                          <div className="flex items-center border border-[#1A1A1A]/15 bg-[#FAF9F6]">
                            <button
                              id={`cart-qty-dec-${index}`}
                              onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                              className="px-2.5 py-1 text-[#1A1A1A]/50 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A] text-xs font-bold transition"
                            >
                              -
                            </button>
                            <span className="px-2 text-[10px] font-mono font-bold text-[#1A1A1A]">
                              {item.quantity}
                            </span>
                            <button
                              id={`cart-qty-inc-${index}`}
                              onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                              className="px-2.5 py-1 text-[#1A1A1A]/50 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A] text-xs font-bold transition"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Trash action button */}
                      <button
                        id={`cart-trash-btn-${index}`}
                        onClick={() => onRemoveItem(index)}
                        className="absolute top-4 right-4 text-[#1A1A1A]/30 hover:text-rose-500 transition-colors p-1"
                        title="Remove book"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* STEP 2: SHIPPING ADDRESS ENTRY */}
          {step === 'shipping' && (
            <form id="shipping-form" onSubmit={handleProceedToPayment} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.15em] mb-1.5" htmlFor="full-name">
                  Full Name
                </label>
                <input
                  id="full-name"
                  type="text"
                  placeholder="E.g., Johnathan Doe"
                  value={shipping.fullName}
                  onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                  className={`w-full p-2.5 bg-white border text-xs focus:outline-none ${
                    fieldErrors.fullName ? 'border-rose-400 focus:border-rose-500' : 'border-[#1A1A1A]/20 focus:border-[#1A1A1A]'
                  }`}
                />
                {fieldErrors.fullName && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{fieldErrors.fullName}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.15em] mb-1.5" htmlFor="email-address">
                  Email Address
                </label>
                <input
                  id="email-address"
                  type="email"
                  placeholder="johndoe@atelier.com"
                  value={shipping.email}
                  onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                  className={`w-full p-2.5 bg-white border text-xs focus:outline-none ${
                    fieldErrors.email ? 'border-rose-400 focus:border-rose-500' : 'border-[#1A1A1A]/20 focus:border-[#1A1A1A]'
                  }`}
                />
                {fieldErrors.email && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.15em] mb-1.5" htmlFor="street-address">
                  Street Address
                </label>
                <input
                  id="street-address"
                  type="text"
                  placeholder="120 East Broadway"
                  value={shipping.address}
                  onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                  className={`w-full p-2.5 bg-white border text-xs focus:outline-none ${
                    fieldErrors.address ? 'border-rose-400 focus:border-rose-500' : 'border-[#1A1A1A]/20 focus:border-[#1A1A1A]'
                  }`}
                />
                {fieldErrors.address && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{fieldErrors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.15em] mb-1.5" htmlFor="shipping-city">
                    City
                  </label>
                  <input
                    id="shipping-city"
                    type="text"
                    placeholder="New York"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    className={`w-full p-2.5 bg-white border text-xs focus:outline-none ${
                      fieldErrors.city ? 'border-rose-400 focus:border-rose-500' : 'border-[#1A1A1A]/20 focus:border-[#1A1A1A]'
                    }`}
                  />
                  {fieldErrors.city && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{fieldErrors.city}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.15em] mb-1.5" htmlFor="zip-code">
                    Zip Code
                  </label>
                  <input
                    id="zip-code"
                    type="text"
                    maxLength={6}
                    placeholder="10001"
                    value={shipping.zipCode}
                    onChange={(e) => setShipping({ ...shipping, zipCode: e.target.value })}
                    className={`w-full p-2.5 bg-white border text-xs focus:outline-none ${
                      fieldErrors.zipCode ? 'border-rose-400 focus:border-rose-500' : 'border-[#1A1A1A]/20 focus:border-[#1A1A1A]'
                    }`}
                  />
                  {fieldErrors.zipCode && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{fieldErrors.zipCode}</p>}
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: MOCK CREDIT CARD DETAILS */}
          {step === 'payment' && (
            <form id="payment-form" onSubmit={handleCompleteOrder} className="space-y-4">
              <div className="p-5 bg-[#1A1A1A] text-[#FAF9F6] space-y-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-5 font-bold text-9xl font-mono select-none pointer-events-none">
                  MC
                </div>
                <div className="flex justify-between items-start">
                  <CreditCard className="h-7 w-7 text-[#FAF9F6]/40" />
                  <span className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-[#FAF9F6]/65">Monograph Ledger</span>
                </div>
                <div>
                  <p className="text-[8px] text-[#FAF9F6]/50 uppercase tracking-[0.2em] font-sans">Card Number</p>
                  <p className="text-sm font-bold font-mono tracking-[0.18em] mt-0.5">
                    {payment.cardNumber || '•••• •••• •••• ••••'}
                  </p>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[8px] text-[#FAF9F6]/50 uppercase tracking-[0.2em] font-sans">Cardholder</p>
                    <p className="text-xs font-serif italic truncate max-w-[150px] tracking-wide">
                      {payment.cardName || 'YOUR SIGNATURE'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] text-[#FAF9F6]/50 uppercase tracking-[0.2em] font-sans">Expires</p>
                    <p className="text-xs font-mono font-bold">
                      {payment.expiryDate || 'MM/YY'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.15em] mb-1.5" htmlFor="card-name">
                  Name on Card
                </label>
                <input
                  id="card-name"
                  type="text"
                  placeholder="Johnathan Smith"
                  value={payment.cardName}
                  onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                  className={`w-full p-2.5 bg-white border text-xs focus:outline-none uppercase ${
                    fieldErrors.cardName ? 'border-rose-400 focus:border-rose-500' : 'border-[#1A1A1A]/20 focus:border-[#1A1A1A]'
                  }`}
                />
                {fieldErrors.cardName && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{fieldErrors.cardName}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.15em] mb-1.5" htmlFor="card-number">
                  Card Number
                </label>
                <input
                  id="card-number"
                  type="text"
                  placeholder="4000 1234 5678 9010"
                  maxLength={19}
                  value={payment.cardNumber}
                  onChange={handleCardNumberChange}
                  className={`w-full p-2.5 bg-white border text-xs focus:outline-none font-mono ${
                    fieldErrors.cardNumber ? 'border-rose-400 focus:border-rose-500' : 'border-[#1A1A1A]/20 focus:border-[#1A1A1A]'
                  }`}
                />
                {fieldErrors.cardNumber && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{fieldErrors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.15em] mb-1.5" htmlFor="card-expiry">
                    Expiration Date
                  </label>
                  <input
                    id="card-expiry"
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={payment.expiryDate}
                    onChange={handleExpiryChange}
                    className={`w-full p-2.5 bg-white border text-xs focus:outline-none font-mono ${
                      fieldErrors.expiryDate ? 'border-rose-400 focus:border-rose-500' : 'border-[#1A1A1A]/20 focus:border-[#1A1A1A]'
                    }`}
                  />
                  {fieldErrors.expiryDate && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{fieldErrors.expiryDate}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.15em] mb-1.5" htmlFor="card-cvv">
                    CVV Code
                  </label>
                  <input
                    id="card-cvv"
                    type="password"
                    placeholder="345"
                    maxLength={4}
                    value={payment.cvv}
                    onChange={(e) => setPayment({ ...payment, cvv: e.target.value.replace(/[^0-9]/g, '') })}
                    className={`w-full p-2.5 bg-white border text-xs focus:outline-none font-mono ${
                      fieldErrors.cvv ? 'border-rose-400 focus:border-rose-500' : 'border-[#1A1A1A]/20 focus:border-[#1A1A1A]'
                    }`}
                  />
                  {fieldErrors.cvv && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{fieldErrors.cvv}</p>}
                </div>
              </div>
            </form>
          )}

          {/* STEP 4: SUCCESS SUMMARY SCREEN */}
          {step === 'success' && generatedOrder && (
            <div className="text-center space-y-6 py-6 animate-fade-in" id="checkout-success-view">
              <div className="h-14 w-14 border border-[#1A1A1A] text-[#1A1A1A] flex items-center justify-center mx-auto bg-white">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif italic text-[#1A1A1A]">Ledger Entry Documented</h3>
                <p className="text-[10px] text-[#1A1A1A]/50 font-semibold font-mono mt-0.5 uppercase tracking-wider">
                  ARCHIVE REF: {generatedOrder.orderId}
                </p>
                <p className="text-xs text-[#1A1A1A]/80 font-serif mt-2 px-4 leading-relaxed">
                  Pristine logistics dispatched for client <span className="font-bold">{generatedOrder.shippingDetails.fullName}</span>. A dispatch manifest code was registered at {generatedOrder.shippingDetails.email}
                </p>
              </div>

              {/* Order items recap */}
              <div className="border border-[#1A1A1A]/20 p-5 text-left space-y-3 bg-white">
                <p className="text-[9px] font-bold text-[#1A1A1A] uppercase tracking-[0.2em] font-sans">MEMORANDUM RECEIPT</p>
                <div className="divide-y divide-[#1A1A1A]/10 space-y-2">
                  {generatedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs pt-2">
                      <span className="text-[#1A1A1A]/80 font-serif truncate max-w-[200px]">{it.productName} (x{it.quantity})</span>
                      <span className="font-mono font-medium text-[#1A1A1A]">${(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between font-bold text-xs text-[#1A1A1A] font-sans uppercase tracking-wider">
                    <span>Grand Ledger Total</span>
                    <span className="font-mono">${generatedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="border-t border-[#1A1A1A]/10 pt-3 text-[10px] text-[#1A1A1A]/60 space-y-1 font-serif">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#1A1A1A]/50" />
                    Dest: {generatedOrder.shippingDetails.address}, {generatedOrder.shippingDetails.city}
                  </p>
                  <p className="font-sans font-bold text-[#1A1A1A]/70 text-[9px] uppercase tracking-wider">Transit span: 3 to 5 Monograph Cycles.</p>
                </div>
              </div>

              <button
                id="cart-success-back-catalog"
                onClick={handleAllDone}
                className="w-full py-3 bg-[#1A1A1A] hover:opacity-90 text-white font-sans font-bold uppercase tracking-[0.15em] text-xs transition"
              >
                Return to Exploration
              </button>
            </div>
          )}

        </div>

        {/* Static Bottom Pricing Calc Panel */}
        {step !== 'success' && cartItems.length > 0 && (
          <div className="p-6 border-t border-[#1A1A1A]/15 bg-white space-y-4">
            
            {/* Promo Code Input */}
            {step === 'basket' && (
              <div>
                {activePromo ? (
                  <div id="promo-applied-badge" className="flex items-center justify-between text-xs bg-[#1A1A1A]/5 text-[#1A1A1A] p-3 border border-[#1A1A1A]/20 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Tag className="h-4 w-4 text-[#1A1A1A]/60" />
                      Applied: <strong className="font-mono uppercase font-black">{activePromo.code}</strong> (-{activePromo.discountType === 'percentage' ? `${activePromo.discountValue}%` : `$${activePromo.discountValue}`})
                    </span>
                    <button 
                      id="remove-promo-btn"
                      onClick={handleRemovePromo}
                      className="p-1 hover:bg-[#1A1A1A]/5 text-[#1A1A1A] font-bold"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      id="promo-input"
                      type="text"
                      placeholder="Access Code (SAVE10, WELCOME20)"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        setPromoError(null);
                      }}
                      className="flex-1 px-3 py-2 bg-transparent border border-[#1A1A1A]/20 text-xs focus:outline-none focus:border-[#1A1A1A] font-mono placeholder:font-sans placeholder-[#1A1A1A]/40"
                    />
                    <button
                      id="apply-promo-btn"
                      type="submit"
                      className="px-4 py-2 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A] font-sans font-bold uppercase tracking-widest text-[9px] border border-[#1A1A1A]/15 cursor-pointer transition"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {promoError && (
                  <p id="promo-error-msg" className="text-[10px] text-rose-500 mt-1 font-semibold">{promoError}</p>
                )}
              </div>
            )}

            {/* Calculations List */}
            <div className="space-y-1.5 text-xs font-sans">
              <div className="flex justify-between text-[#1A1A1A]/60">
                <span>Archived Subtotal</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold font-mono">
                  <span>Deduction Registry</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#1A1A1A]/60">
                <span>Leased Transit Air</span>
                <span className="font-mono">
                  {appliedShipping === 0 ? 'COMPLIMENTARY' : `$${appliedShipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-[#1A1A1A]/60">
                <span>Duty Premium (8%)</span>
                <span className="font-mono">${currentTax.toFixed(2)}</span>
              </div>

              <div className="h-[1px] bg-[#1A1A1A]/10 my-2"></div>
              
              <div className="flex justify-between text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider">
                <span>Invoiced Sum</span>
                <span className="font-mono text-base font-black">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              {step === 'basket' && (
                <button
                  id="checkout-next-shipping"
                  onClick={() => {
                    setStep('shipping');
                    setFieldErrors({});
                  }}
                  className="w-full py-3 bg-[#1A1A1A] hover:opacity-90 text-white font-sans uppercase font-bold tracking-[0.15em] text-xs cursor-pointer transition"
                >
                  Confirm Document Delivery
                </button>
              )}

              {step === 'shipping' && (
                <button
                  id="checkout-next-payment"
                  onClick={handleProceedToPayment}
                  className="w-full py-3 bg-[#1A1A1A] hover:opacity-90 text-white font-sans uppercase font-bold tracking-[0.15em] text-xs cursor-pointer transition"
                >
                  Verify Payment Schema
                </button>
              )}

              {step === 'payment' && (
                <button
                  id="checkout-final-complete"
                  onClick={handleCompleteOrder}
                  className="w-full py-3 bg-[#1A1A1A] hover:opacity-90 text-white font-sans uppercase font-bold tracking-[0.15em] text-xs cursor-pointer transition flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Liquidate & Finalize Order
                </button>
              )}
            </div>

            {/* Secure Badge */}
            <p className="text-[9px] text-[#1A1A1A]/40 text-center font-mono uppercase tracking-wider">
              Secure SSL Monograph Tunnel Verified
            </p>

          </div>
        )}

      </div>
    </div>
  );
}
