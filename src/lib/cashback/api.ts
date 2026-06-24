import type { CashbackResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:8787';

export const generateCashbackLink = async ({
  link,
  affiliateId = '17314780502',
  subIds = ['ndinhnguyen'],
  deepAndDeferred = 1,
}: {
  link: string;
  affiliateId?: string;
  subIds?: string[];
  deepAndDeferred?: number;
}): Promise<CashbackResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/shopee/affiliate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        link: link.trim(),
        affiliate_id: affiliateId,
        sub_ids: subIds,
        deep_and_deferred: deepAndDeferred,
      }),
    });

    if (!response.ok) {
      return { ok: false, code: 'api_error' };
    }

    return (await response.json()) as CashbackResponse;
  } catch (err) {
    console.error('generateCashbackLink error:', err);
    return { ok: false, code: 'network_error' };
  }
};
