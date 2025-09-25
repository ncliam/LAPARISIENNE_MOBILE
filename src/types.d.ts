export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  address: string;
}

export interface Product {
  id: number;
  ref: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  category: Category;
  detail?: string;
  sizes?: Size[];
  colors?: Color[];
  priceLevels: {};
}

export interface Category {
  id: number;
  ref: string;
  name: string;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitprice: number;
  detail?: string;
}

export type Cart = CartItem[];

export interface Location {
  lat: number;
  lng: number;
}

export interface ShippingAddress {
  alias: string;
  address: string;
  name: string;
  phone: string;
  toRoom?: boolean;
  deliveryAt?: string;
}

export interface Station {
  id: number;
  ref: string;
  name: string;
  image: string;
  address: string;
  location: Location;
  distance?: number;
}

export type Delivery =
  | ({
      type: "shipping";
    } & ShippingAddress)
  | {
      type: "pickup";
      stationId: number;
    };

export type OrderStatus = "pending" | "paid" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid";

export interface Order {
  id: number;
  ref: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  items: CartItem[];
  delivery: Delivery;
  station: Station;
  total: number;
  note: string;
  shop_order_no: string;
}
