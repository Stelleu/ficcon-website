import supabase from '../config/db.js'

export class Exhibitor {

  static async create(exhibitor) {
    const { firstname, lastname, secteur, name, description, email, phone, area, ville } = exhibitor;
    const { data, error} = await supabase
    .from('exhibitors')
    .insert([exhibitor])
    .select()
    .single();
    
    if (error) throw error
    return data
  }
  
  static async listAll() {
    const { data, error} = await supabase 
      .from('exhibitors')
      .select('*')
      .order('created_at', { ascending: false })
  
      if (error) throw error
      return data
  }

}



