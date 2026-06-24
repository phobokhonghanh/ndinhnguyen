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
  RotateCw,
} from 'lucide-react';
import { generateCashbackLink } from '@/lib/cashback/api';
import type { Product, HistoryItem } from '@/lib/cashback/types';
import './cashback.css';



// Helper to format Shopee image URL
const formatShopeeImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://cf.shopee.vn/file/${url}`;
};

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
  const [currentUrl, setCurrentUrl] = React.useState<string | null>(null);

  // Load history from local storage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('affiliate_history');
      if (stored) {
        const timer = setTimeout(() => {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              const migrated = (parsed as Record<string, unknown>[])
                .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
                .map((item) => {
                  const product = item.product as Record<string, unknown> | undefined;
                  const rawImageUrl = (product?.imageUrl || item.imageUrl || '') as string;
                  const formattedImageUrl = formatShopeeImageUrl(rawImageUrl);

                  if (product && typeof product === 'object') {
                    return {
                      ...item,
                      product: {
                        ...product,
                        imageUrl: formattedImageUrl
                      }
                    } as unknown as HistoryItem;
                  }

                  // Migrate flat history structure to nested product structure
                  return {
                    url: (item.url || '') as string,
                    affiliateLink: (item.affiliateLink || '') as string,
                    timestamp: (item.timestamp || Date.now()) as number,
                    product: {
                      itemId: item.itemId ?? null,
                      productName: (item.productName || item.title || '') as string,
                      imageUrl: formattedImageUrl,
                      price: (item.price || 0) as number,
                      commission: (item.commission || 0) as number,
                      rating: item.rating ?? null,
                      sales: item.sales ?? null,
                      shopName: item.shopName ?? null,
                      lastUpdate: item.timestamp ? new Date(item.timestamp as number).toISOString() : new Date().toISOString(),
                    }
                  } as HistoryItem;
                });
              setHistory(migrated);
            }
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
      const resData = await generateCashbackLink({ link: urlToFetch });

      if (resData && resData.ok && resData.data) {
        const affLink = resData.data.affiliate_link;
        const product = resData.data.product;

        setAffiliateLink(affLink);

        if (product) {
          const formattedImageUrl = formatShopeeImageUrl(product.imageUrl);

          const updatedProduct = {
            ...product,
            imageUrl: formattedImageUrl
          };

          setProductInfo(updatedProduct);
          setCurrentUrl(urlToFetch);
          setInputUrl(''); // Clear input after search success

          // Add to local storage history
          const newItem: HistoryItem = {
            url: urlToFetch.trim(),
            affiliateLink: affLink,
            timestamp: Date.now(),
            product: {
              itemId: product.itemId || null,
              productName: product.productName,
              imageUrl: formattedImageUrl,
              price: product.price,
              commission: product.commission || 0,
              rating: product.rating,
              sales: product.sales,
              shopName: product.shopName,
              lastUpdate: product.lastUpdate || null,
            }
          };

          // Filter out existing and prepend new, limit to 5
          // Filter based on itemId if present, otherwise fallback to url comparison
          const updatedHistory = [
            newItem,
            ...history.filter((item) => {
              if (product.itemId && item?.product?.itemId === product.itemId) {
                return false;
              }
              return item.url !== urlToFetch.trim();
            }),
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
    setInputUrl(''); // Clear input
    setValidationError(null);
    setApiError(null);
    setProductInfo(item.product);
    setAffiliateLink(item.affiliateLink);
    setCurrentUrl(item.url);
  };

  // Format rating helper
  const formatRating = (rating: unknown): string => {
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
      const ratingObj = rating as Record<string, unknown>;
      const star = ratingObj.ratingStar ?? ratingObj.rating_star ?? ratingObj.star;
      if (star !== undefined && star !== null) {
        const num = typeof star === 'number' ? star : parseFloat(star as string);
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
            <span>Shopee Cashback</span>
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
                    disabled={loading || !!validationError || inputUrl.trim() === ''}
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
                        src={formatShopeeImageUrl(productInfo.imageUrl)}
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
                      <div className="flex justify-between items-start gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-[var(--aff-heading)] line-clamp-2 leading-snug flex-1">
                          {productInfo.productName}
                        </h2>
                        {currentUrl && (
                          <button
                            type="button"
                            onClick={() => handleGenerate(currentUrl)}
                            disabled={loading}
                            className="p-1.5 text-[var(--aff-muted)] hover:text-orange-600 dark:hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            title="Tải lại sản phẩm"
                          >
                            <RotateCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                      </div>
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
                    <a
                      href={affiliateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aff-btn-primary py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-sm sm:text-base select-none cursor-pointer flex-[2]"
                    >
                      <span>{t('btn_buy')}</span>
                      <ExternalLink className="w-4.5 h-4.5" />
                    </a>
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
                        {item.product?.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={formatShopeeImageUrl(item.product.imageUrl)}
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
                          {item.product?.productName || ''}
                        </h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs font-semibold text-orange-600 dark:text-orange-500">
                            {item.product ? formatPrice(item.product.price) : '—'}
                          </span>
                          <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold px-1.5 py-0.5 rounded-full">
                            {item.product?.commission
                              ? formatPrice(item.product.commission)
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
