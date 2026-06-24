export interface Product {
  itemId?: string | number | null;
  productName: string;
  shopName?: string | null;
  price: number;
  sales?: number | null;
  imageUrl?: string | null;
  rating?: number | Record<string, unknown> | null;
  commission?: number | null;
  lastUpdate?: string | null;
}

export interface HistoryItem {
  url: string;
  product: Product;
  affiliateLink: string;
  timestamp: number;
}

export interface CashbackResponse {
  ok: boolean;
  code: string;
  data?: {
    affiliate_link: string;
    product: Product | null;
  } | null;
}
