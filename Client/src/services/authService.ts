import { supabase } from '../lib/supabase';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  location?: string;
  farmSize?: number;
  language?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async signUp(data: SignUpData) {
    const { email, password, ...profileData } = data;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    const { error: profileError } = await supabase
      .from('farmer_profiles')
      .insert([
        {
          id: authData.user.id,
          email,
          full_name: profileData.fullName,
          phone_number: profileData.phoneNumber,
          location: profileData.location,
          farm_size: profileData.farmSize,
          language: profileData.language || 'English',
        },
      ]);

    if (profileError) throw profileError;

    return authData;
  },

  async login(data: LoginData) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;
    return authData;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('farmer_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<SignUpData>) {
    const { error } = await supabase
      .from('farmer_profiles')
      .update({
        full_name: updates.fullName,
        phone_number: updates.phoneNumber,
        location: updates.location,
        farm_size: updates.farmSize,
        language: updates.language,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
  },
};
