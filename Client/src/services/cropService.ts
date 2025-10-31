import { supabase } from '../lib/supabase';

export interface Crop {
  id: string;
  farmer_id: string;
  name: string;
  area: number;
  stage: string;
  health_status: string;
  days_to_harvest: number;
  expected_yield: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCropData {
  name: string;
  area: number;
  stage: string;
  health_status?: string;
  days_to_harvest: number;
  expected_yield: number;
  image_url?: string;
}

export const cropService = {
  async getCrops(farmerId: string) {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Crop[];
  },

  async getCrop(cropId: string) {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .eq('id', cropId)
      .maybeSingle();

    if (error) throw error;
    return data as Crop | null;
  },

  async createCrop(farmerId: string, cropData: CreateCropData) {
    const { data, error } = await supabase
      .from('crops')
      .insert([{ ...cropData, farmer_id: farmerId }])
      .select()
      .single();

    if (error) throw error;
    return data as Crop;
  },

  async updateCrop(cropId: string, updates: Partial<CreateCropData>) {
    const { data, error } = await supabase
      .from('crops')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', cropId)
      .select()
      .single();

    if (error) throw error;
    return data as Crop;
  },

  async deleteCrop(cropId: string) {
    const { error } = await supabase
      .from('crops')
      .delete()
      .eq('id', cropId);

    if (error) throw error;
  },

  async getCropStats(farmerId: string) {
    const crops = await this.getCrops(farmerId);

    const totalYield = crops.reduce((sum, crop) => sum + (crop.expected_yield || 0), 0);
    const totalArea = crops.reduce((sum, crop) => sum + (crop.area || 0), 0);
    const avgDaysToHarvest = crops.length > 0
      ? Math.round(crops.reduce((sum, crop) => sum + crop.days_to_harvest, 0) / crops.length)
      : 0;

    return {
      totalYield,
      totalArea,
      avgDaysToHarvest,
      cropCount: crops.length,
    };
  },
};
