import { supabase } from '../lib/supabase';

export interface WeatherAlert {
  id: string;
  farmer_id: string;
  location: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'urgent';
  message: string;
  is_read: boolean;
  created_at: string;
}

export const weatherService = {
  async getWeatherAlerts(farmerId: string) {
    const { data, error } = await supabase
      .from('weather_alerts')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as WeatherAlert[];
  },

  async getUnreadAlerts(farmerId: string) {
    const { data, error } = await supabase
      .from('weather_alerts')
      .select('*')
      .eq('farmer_id', farmerId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as WeatherAlert[];
  },

  async markAlertAsRead(alertId: string) {
    const { error } = await supabase
      .from('weather_alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    if (error) throw error;
  },
};
