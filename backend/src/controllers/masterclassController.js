import { Masterclass } from '../models/Masterclass.js';
import { Visitor } from '../models/Visitor.js';


export class MasterclassController {
  static async listMasterclasses(req, res) {
    try {
      const masterclasses = await Masterclass.getAllWithRemaining();
      res.json(masterclasses);
    } catch (err) {
      console.error('Error listMasterclasses', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async registerToMasterclass(req, res) {
    try {
      const { code } = req.params;
      const { first_name, last_name, email, phone } = req.body || {};

      if (!first_name || !last_name || !email) {
        return res.status(400).json({ error: 'Prénom, nom et email sont requis.' });
      }

      const masterclass = await Masterclass.getByCode(code);
      if (!masterclass) {
        return res.status(404).json({ error: 'Masterclass introuvable.' });
      }

      let visitor = await Visitor.findByEmail(email);      
      if (!visitor) {
        visitor = await Visitor.create({
          first_name,
          last_name,
          email,
          phone
        });
      }
      
      let registrationInfo;
      try {
        registrationInfo = await Masterclass.registerVisitorToMasterclass(masterclass, visitor.id);
      } catch (e) {
        if (e.code === 'CAPACITY_REACHED') {
          return res.status(409).json({ error: 'Cette masterclass est complète.' });
        }
        throw e;
      }

      res.status(201).json({
        message: 'Inscription enregistrée.',
        masterclass: {
          code: masterclass.code,
          title: masterclass.title
        },
        remainingPlaces: registrationInfo.remaining, // nombre de places restantes voir pour le stocker en bdd?
        capacity: registrationInfo.capacity
      });
    } catch (err) {
      console.error('Error registerToMasterclass', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}

