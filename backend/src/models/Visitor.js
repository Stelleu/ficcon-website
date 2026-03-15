import supabase from "../config/db.js"

export class Visitor {

  static async findByEmail(email) {

    const { data, error } = await supabase
      .from("visitors")
      .select("*")
      .eq("email", email)
      .single()
  
    if (error && error.code !== "PGRST116")
      throw error
  
    return data
  }
  
  static async create(visitor) {
  
    const { data, error } = await supabase
      .from("visitors")
      .insert([visitor])
      .select()
      .single()
  
    if (error) throw error
  
    return data
  }
  
  
  static async listAll() {
  
    const { data, error } = await supabase
      .from("visitors")
      .select("*")
      .order("created_at", { ascending: false })
  
    if (error) throw error
  
    return data
  }

}