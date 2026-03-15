import { Visitor } from '../models/Visitor.js';

export class VisitorController {
    
  static async listVisitors(req, res) {
    try {
      const visitor = await Visitor.listAll();
      res.json(visitor);
    } catch (err) {
      console.error('Error listVisitors', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async createVisitor(req, res) {
    try {
      const { first_name, last_name, email, phone } = req.body || {};

      if (!first_name || !last_name || !email) {
        return res
          .status(400)
          .json({ error: 'Prénom, nom et email sont requis.' });
      }

      let existing = await Visitor.findByEmail(email);
      if (existing) {
        return res.status(200).json(existing);
      }

      const visitor = await Visitor.create({
        first_name,
        last_name,
        email,
        phone
      });

      res.status(201).json(visitor);
    } catch (err) {
      console.error('Error createVisitor', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}
