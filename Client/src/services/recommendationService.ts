import { supabase } from '../lib/supabase';

export interface Recommendation {
  id: string;
  farmer_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  is_read: boolean;
  created_at: string;
}

export const recommendationService = {
  async getRecommendations(farmerId: string) {
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Recommendation[];
  },

  async getUnreadRecommendations(farmerId: string) {
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('farmer_id', farmerId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Recommendation[];
  },

  async markAsRead(recommendationId: string) {
    const { error } = await supabase
      .from('recommendations')
      .update({ is_read: true })
      .eq('id', recommendationId);

    if (error) throw error;
  },

  async createRecommendation(farmerId: string, recommendation: Omit<Recommendation, 'id' | 'farmer_id' | 'is_read' | 'created_at'>) {
    const { data, error } = await supabase
      .from('recommendations')
      .insert([{ ...recommendation, farmer_id: farmerId }])
      .select()
      .single();

    if (error) throw error;
    return data as Recommendation;
  },
};
