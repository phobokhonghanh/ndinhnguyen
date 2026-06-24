'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Search,
  Copy,
  ExternalLink,
  Star,
  Trash2,
  History,
  Sparkles,
  Check,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import './cashback.css';

interface Product {
  productName: string;
  shopName?: string | null;
  price: number;
  sales?: number | null;
  imageUrl?: string | null;
  rating?: number | Record<string, unknown> | null;
  commission?: number | null;
  lastUpdate?: string | null;
}

interface HistoryItem {
  url: string;
  productName: string;
  imageUrl: string;
  price: number;
  commission: number;
  affiliateLink: string;
  timestamp: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export function CashbackDashboard() {
  const t = useTranslations('cashback');

  // State
  const [inputUrl, setInputUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  );
  const [apiError, setApiError] = React.useState<string | null>(null);

  const [productInfo, setProductInfo] = React.useState<Product | null>(null);
  const [affiliateLink, setAffiliateLink] = React.useState<string | null>(null);

  const [copied, setCopied] = React.useState(false);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);

  // Load history from local storage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('affiliate_history');
      if (stored) {
        const timer = setTimeout(() => {
          try {
            setHistory(JSON.parse(stored));
          } catch (e) {
            console.error(e);
          }
        }, 0);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, []);

  // Save history helper
  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem('affiliate_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  };

  // URL Shopee validation
  const validateLink = (url: string): boolean => {
    if (!url.trim()) {
      setValidationError(null);
      return false;
    }

    // Check if it looks like a URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setValidationError(t('invalid_link'));
      return false;
    }

    try {
      const hostname = new URL(url).hostname;
      const isValid =
        hostname.includes('shopee.vn') ||
        hostname.includes('shp.ee') ||
        hostname.includes('shopee.co.id') ||
        hostname.includes('shopee.sg') ||
        hostname.includes('shopee.tw');

      if (!isValid) {
        setValidationError(t('invalid_link'));
        return false;
      }

      setValidationError(null);
      return true;
    } catch {
      // Fallback text check
      const isValid = url.includes('shopee.vn') || url.includes('shp.ee');
      if (!isValid) {
        setValidationError(t('invalid_link'));
        return false;
      }
      setValidationError(null);
      return true;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputUrl(val);
    if (val) {
      validateLink(val);
    } else {
      setValidationError(null);
    }
  };

  // Fetch Affiliate Link
  const handleGenerate = async (urlToFetch: string) => {
    if (!validateLink(urlToFetch)) return;

    setLoading(true);
    setApiError(null);
    setProductInfo(null);
    setAffiliateLink(null);
    setCopied(false);

    try {
      const response = await fetch(`${API_URL}/api/shopee/affiliate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          link: urlToFetch.trim(),
          affiliate_id: '17314780502',
          sub_ids: ['ndinhnguyen'],
          deep_and_deferred: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('API server returned error status');
      }

      const resData = await response.json();

      if (resData && resData.ok && resData.data) {
        const affLink = resData.data.affiliate_link;
        const product = resData.data.product;

        setAffiliateLink(affLink);

        if (product) {
          setProductInfo(product);

          // Add to local storage history
          const newItem: HistoryItem = {
            url: urlToFetch.trim(),
            productName: product.productName,
            imageUrl: product.imageUrl || '',
            price: product.price,
            commission: product.commission || 0,
            affiliateLink: affLink,
            timestamp: Date.now(),
          };

          // Filter out existing and prepend new, limit to 5
          const updatedHistory = [
            newItem,
            ...history.filter((item) => item.url !== urlToFetch.trim()),
          ].slice(0, 5);

          saveHistory(updatedHistory);
        } else {
          // If product info is missing, show a specific error
          setApiError(t('not_found'));
        }
      } else {
        setApiError(t('not_found'));
      }
    } catch (err) {
      console.error(err);
      setApiError(t('not_found'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate(inputUrl);
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!affiliateLink) return;
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  // Clear History
  const handleClearHistory = () => {
    saveHistory([]);
  };

  // Select item from history
  const handleSelectHistory = (item: HistoryItem) => {
    setInputUrl(item.url);
    setValidationError(null);
    setApiError(null);
    setProductInfo({
      productName: item.productName,
      imageUrl: item.imageUrl,
      price: item.price,
      commission: item.commission,
      lastUpdate: new Date(item.timestamp).toISOString(),
    });
    setAffiliateLink(item.affiliateLink);
  };

  // Format rating helper
  const formatRating = (rating: any): string => {
    if (rating === undefined || rating === null) return '—';
    if (typeof rating === 'number') {
      return rating % 1 === 0 ? rating.toString() : rating.toFixed(1);
    }
    if (typeof rating === 'string') {
      const num = parseFloat(rating);
      if (!isNaN(num)) {
        return num % 1 === 0 ? num.toString() : num.toFixed(1);
      }
      return rating;
    }
    if (typeof rating === 'object') {
      const star = rating.ratingStar ?? rating.rating_star ?? rating.star;
      if (star !== undefined && star !== null) {
        const num = typeof star === 'number' ? star : parseFloat(star);
        if (!isNaN(num)) {
          return num % 1 === 0 ? num.toString() : num.toFixed(1);
        }
      }
    }
    return '—';
  };

  // Format currency
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  // Format date
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return (
        date.toLocaleDateString() +
        ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="affiliate-page-container transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Hero Section */}
        <div className="text-center mb-8 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Shopee Cashback Engine v1</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            <span className="text-[var(--aff-text)]">
              {t('title').split(' ')[0]}
            </span>
            <span className="aff-gradient-text ml-2">
              {t('title').split(' ').slice(1).join(' ')}
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[var(--aff-muted)]">
            {t('subtitle')}
          </p>
        </div>

        {/* Layout Grid: 2 columns on desktop, 1 column on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Form & Main Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Card */}
            <div className="aff-card p-5 sm:p-6 rounded-2xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      className={`aff-input w-full pl-4 pr-4 py-3 rounded-xl text-sm sm:text-base ${validationError
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                        : ''
                        }`}
                      placeholder={t('input_placeholder')}
                      value={inputUrl}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="aff-btn-primary px-6 py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed select-none text-sm sm:text-base cursor-pointer"
                    disabled={loading || !!validationError || !inputUrl}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        <span>{t('btn_searching')}</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4.5 h-4.5" />
                        <span>{t('btn_search')}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Validation Error Message */}
                {validationError && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-red-500 mt-1 pl-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}
              </form>
            </div>

            {/* Loading Skeleton */}
            {loading && (
              <div className="aff-card p-5 sm:p-6 rounded-2xl space-y-5">
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="aff-skeleton w-full sm:w-40 h-40 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="aff-skeleton h-6 w-3/4 rounded-md" />
                    <div className="aff-skeleton h-4 w-1/3 rounded-md" />
                    <div className="space-y-2 pt-2">
                      <div className="aff-skeleton h-4 w-1/2 rounded-md" />
                      <div className="aff-skeleton h-4 w-5/6 rounded-md" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <div className="aff-skeleton h-11 flex-1 rounded-xl" />
                  <div className="aff-skeleton h-11 w-24 rounded-xl" />
                </div>
              </div>
            )}

            {/* Error Message */}
            {apiError && !loading && (
              <div className="aff-card p-6 rounded-2xl border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/10 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-red-700 dark:text-red-400 text-sm sm:text-base">
                    Lỗi xảy ra
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--aff-muted)]">
                    {apiError}
                  </p>
                </div>
              </div>
            )}

            {/* Product & Link Results Card */}
            {productInfo && !loading && (
              <div className="aff-card p-5 sm:p-6 rounded-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
                {/* Product Detail */}
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image */}
                  <div className="w-full sm:w-40 h-40 rounded-xl border border-[var(--aff-border)] overflow-hidden bg-white flex items-center justify-center flex-shrink-0 relative group shadow-inner">
                    {productInfo.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={productInfo.imageUrl}
                        alt={productInfo.productName}
                        className="w-full h-full object-contain p-1 transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-[var(--aff-orange)] bg-[var(--aff-orange-light)] w-full h-full flex items-center justify-center">
                        <Sparkles className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  {/* Product Meta */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[var(--aff-heading)] line-clamp-2 leading-snug">
                        {productInfo.productName}
                      </h2>
                      {productInfo.shopName && (
                        <p className="text-xs sm:text-sm text-[var(--aff-muted)] mt-1">
                          {t('shop_name')}:{' '}
                          <span className="font-semibold text-[var(--aff-text)]">
                            {productInfo.shopName}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Price */}
                      <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-[var(--aff-border)]">
                        <span className="block text-2xs uppercase tracking-wider text-[var(--aff-muted)]">
                          {t('price')}
                        </span>
                        <span className="text-base sm:text-lg font-black text-orange-600 dark:text-orange-500 mt-0.5 block">
                          {formatPrice(productInfo.price)}
                        </span>
                      </div>


                      {/* Sales */}
                      {productInfo.sales !== undefined &&
                        productInfo.sales !== null && (
                          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-[var(--aff-border)]">
                            <span className="block text-2xs uppercase tracking-wider text-[var(--aff-muted)]">
                              {t('sales')}
                            </span>
                            <span className="text-sm sm:text-base font-bold text-[var(--aff-text)] mt-0.5 block">
                              {productInfo.sales.toLocaleString('vi-VN')}
                            </span>
                          </div>
                        )}

                      {/* Rating */}
                      {productInfo.rating !== undefined &&
                        productInfo.rating !== null && (
                          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-[var(--aff-border)]">
                            <span className="block text-2xs uppercase tracking-wider text-[var(--aff-muted)]">
                              {t('rating')}
                            </span>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span className="text-sm sm:text-base font-bold text-[var(--aff-text)]">
                                {formatRating(productInfo.rating)}
                              </span>
                            </div>
                          </div>
                        )}

                      {/* Commission */}
                      <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-[var(--aff-border)]">
                        <span className="block text-2xs uppercase tracking-wider text-[var(--aff-muted)]">
                          {t('commission')}
                        </span>
                        <div className="mt-1 flex items-center">
                          <span className="aff-badge-commission text-xs sm:text-sm">
                            <Sparkles className="w-3.5 h-3.5" />
                            {productInfo.commission !== undefined &&
                              productInfo.commission !== null
                              ? formatPrice(productInfo.commission)
                              : '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Last Update */}
                    {productInfo.lastUpdate && (
                      <p className="text-2xs text-[var(--aff-muted)] flex items-center gap-1">
                        <span>{t('last_update')}:</span>
                        <span className="font-medium">
                          {formatDate(productInfo.lastUpdate)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Call To Actions */}
                {affiliateLink && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--aff-border)]">
                    <button
                      onClick={handleCopy}
                      className="aff-btn-secondary py-3 px-5 rounded-xl flex items-center justify-center gap-2 flex-1 font-bold text-sm sm:text-base select-none cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4.5 h-4.5 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">
                            {t('btn_copied')}
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4.5 h-4.5" />
                          <span>{t('btn_copy')}</span>
                        </>
                      )}
                    </button>

                    <a
                      href={affiliateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aff-btn-primary py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-sm sm:text-base select-none cursor-pointer"
                    >
                      <span>{t('btn_buy')}</span>
                      <ExternalLink className="w-4.5 h-4.5" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Search History */}
          <div className="lg:col-span-1">
            <div className="aff-card p-5 sm:p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--aff-heading)]">
                  <History className="w-4.5 h-4.5 text-[var(--aff-orange)]" />
                  <h3 className="font-bold text-sm sm:text-base">
                    {t('history_title')}
                  </h3>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-red-500 hover:text-red-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('history_clear')}</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-8 text-xs sm:text-sm text-[var(--aff-muted)] border border-dashed border-[var(--aff-border)] rounded-xl">
                  {t('history_empty')}
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {history.map((item, index) => (
                    <div
                      key={item.url + index}
                      onClick={() => handleSelectHistory(item)}
                      className="aff-history-item p-3 rounded-xl border border-[var(--aff-border)] flex gap-3 cursor-pointer select-none"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-12 h-12 rounded-lg border border-[var(--aff-border)] bg-white overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="w-full h-full object-contain p-0.5"
                            loading="lazy"
                          />
                        ) : (
                          <Sparkles className="w-5 h-5 text-[var(--aff-orange)]" />
                        )}
                      </div>

                      {/* Text info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[var(--aff-heading)] truncate leading-normal">
                          {item.productName}
                        </h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs font-semibold text-orange-600 dark:text-orange-500">
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold px-1.5 py-0.5 rounded-full">
                            {item.commission
                              ? formatPrice(item.commission)
                              : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
