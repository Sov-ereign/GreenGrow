import { supabase } from '../lib/supabase';

export interface MarketPrice {
  id: string;
  crop_name: string;
  current_price: number;
  previous_price: number;
  market_location: string;
  unit: string;
  updated_at: string;
}

export const marketService = {
  async getMarketPrices() {
    const { data, error } = await supabase
      .from('market_prices')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as MarketPrice[];
  },

  async getMarketPricesByCrop(cropName: string) {
    const { data, error } = await supabase
      .from('market_prices')
      .select('*')
      .eq('crop_name', cropName)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as MarketPrice[];
  },

  async getMarketPricesByLocation(location: string) {
    const { data, error } = await supabase
      .from('market_prices')
      .select('*')
      .ilike('market_location', `%${location}%`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as MarketPrice[];
  },

  calculatePriceChange(current: number, previous: number): { change: number; percentage: string } {
    const change = current - previous;
    const percentage = previous > 0 ? ((change / previous) * 100).toFixed(1) : '0.0';
    return { change, percentage: `${change >= 0 ? '+' : ''}${percentage}%` };
  },
};
