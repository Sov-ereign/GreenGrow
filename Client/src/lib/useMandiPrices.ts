import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "./env";
import { syncBus } from "./syncBus";

export interface MandiRecord {
  commodity: string;
  market: string;
  state: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

export interface MandiCrop {
  name: string;
  market: string;
  state: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  change: number;
  trend: "up" | "down" | "flat";
  suggestion: string;
}

let _cache: { crops: MandiCrop[]; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

function transformRecord(rec: MandiRecord): MandiCrop {
  const modal  = parseFloat(rec.modal_price) || 0;
  const min    = parseFloat(rec.min_price)   || 0;
  const max    = parseFloat(rec.max_price)   || 0;
  const change = min > 0 ? ((modal - min) / min) * 100 : 0;
  const trend  = change > 1 ? "up" : change < -1 ? "down" : "flat";

  let suggestion = "Monitor daily";
  if      (change >= 5)  suggestion = "Best time to sell!";
  else if (change >= 2)  suggestion = "Good selling opportunity";
  else if (change < -3)  suggestion = "Hold — prices falling";
  else if (change <  0)  suggestion = "Wait for recovery";
  else                   suggestion = "Stable market";

  return { name: rec.commodity, market: rec.market, state: rec.state, modalPrice: modal, minPrice: min, maxPrice: max, change, trend, suggestion };
}

interface UseMandiReturn {
  crops: MandiCrop[];
  topGainer: MandiCrop | null;
  loading: boolean;
  error: boolean;
}

export function useMandiPrices(): UseMandiReturn {
  const [crops, setCrops] = useState<MandiCrop[]>(_cache?.crops ?? []);
  const [loading, setLoading] = useState(!_cache);
  const [error, setError] = useState(false);

  const doFetch = () => {
    setLoading(true);
    setError(false);
    axios
      .get(apiUrl("/api/mandi/prices"), { withCredentials: true })
      .then(r => {
        const records: MandiRecord[] = r.data?.records ?? [];
        const transformed = records.map(transformRecord);
        _cache = { crops: transformed, ts: Date.now() };
        setCrops(transformed);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (_cache && Date.now() - _cache.ts < CACHE_TTL) {
      setCrops(_cache.crops);
      setLoading(false);
      return;
    }
    doFetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for sync events — bust cache and re-fetch
  useEffect(() => {
    const handler = () => {
      _cache = null;
      doFetch();
    };
    syncBus.on(handler);
    return () => syncBus.off(handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topGainer = crops.length ? [...crops].sort((a, b) => b.change - a.change)[0] : null;
  return { crops, topGainer, loading, error };
}
