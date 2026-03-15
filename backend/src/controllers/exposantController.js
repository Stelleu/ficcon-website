import { Exhibitor } from "../models/Exhibitor.js";

export class ExhibitorController {

  static async  listExhibitors(req, res) {
    try {
      const exhibitors = await Exhibitor.listAll();
      res.json({
        success: true,
        data: exhibitors
      });
    } catch (err) {
      console.error('Error listExhibitors', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  static async createExhibitor(req, res) {
    try {
      const {
        firstname,
        lastname,
        secteur,
        name,
        description,
        email,
        phone,
        area,
        ville
      } = req.body;
  
      if (!firstname || !lastname || !name || !description) {
  
        return res.status(400).json({
          error: "firstname, lastname, name, description requis"
        });
  
      }
  
      const exhibitor = await Exhibitor.create({
        firstname,
        lastname,
        secteur,
        name,
        description,
        email,
        phone,
        area,
        ville
      });
  
      res.status(201).json({
        success: true,
        data: exhibitor
      });
    } catch (err) {
      console.error('Error createExhibitor', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}
