export interface Review {
  id: string;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Electronics' | 'Apparel' | 'Home & Living' | 'Accessories';
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  features: string[];
  colors?: string[];
  sizes?: string[];
  inStock: boolean;
  isPopular?: boolean;
  reviews: Review[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount?: number;
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
}

export interface PaymentDetails {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

export interface HistoricOrder {
  orderId: string;
  date: string;
  items: {
    productName: string;
    price: number;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
    image: string;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  shippingDetails: ShippingDetails;
}
