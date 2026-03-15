import supabase from "../config/db.js"

export class Masterclass {

  static async getAllWithRemaining() {

    const { data, error } = await supabase
      .from("masterclasses")
      .select(`
        code,
        title,
        description,
        day,
        time,
        room,
        capacity,
        masterclass_registrations(count)
      `)

    if (error) throw error

    return data.map(m => {

      const count = m.masterclass_registrations[0]?.count || 0

      return {
        code: m.code,
        title: m.title,
        description: m.description,
        day: m.day,
        time: m.time,
        room: m.room,
        capacity: m.capacity,
        remainingPlaces: Math.max(m.capacity - count, 0)
      }
    })
  }


  static async getByCode(code) {
    const { data, error } = await supabase
      .from("masterclasses")
      .select("*")
      .eq("code", code)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      throw error
    }

    return data
  }

  static async countRegistrations(code) {

    const { count, error } = await supabase
      .from("masterclass_registrations")
      .select("*", { count: "exact", head: true })
      .eq("masterclass_code", code)

    if (error) throw error

    return count
  }


  static async registerVisitorToMasterclass(masterclassCode, visitorId) {

    const current = await this.countRegistrations(masterclassCode.code)
    const masterclass = await this.getByCode(masterclassCode.code)

    if (current > masterclass.capacity) {

      const err = new Error("CAPACITY_REACHED")
      err.code = "CAPACITY_REACHED" 
      throw err
    }


    const { error } = await supabase
      .from("masterclass_registrations")
      .insert([
        {
          masterclass_code: masterclassCode.code,
          visitors_id: visitorId
        }
      ])

    if (error && error.code !== "23505")
      throw error


    const after = await this.countRegistrations(masterclassCode.code)    

    return {

      remaining: Math.max(masterclass.capacity - after, 0),
      capacity: this.getByCode(masterclassCode.code).capacity
    }
  }
}