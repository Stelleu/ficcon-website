import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export class DonationController {
  static async createCheckoutSession(req, res) {
    try {
      const { montant, email, prenom, nom, association, commentaire, anonyme } = req.body || {};

      if (!montant || !email) {
        return res.status(400).json({ error: 'Montant et email sont requis.' });
      }

      const amountCents = Math.round(Number(montant) * 100);
      if (amountCents < 100) {
        return res.status(400).json({ error: 'Montant minimum 1€.' });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Donation FICCON — ${association || 'Association'}`,
                description: '100% des dons reversés aux associations'
              },
              unit_amount: amountCents
            },
            quantity: 1
          }
        ],
        customer_email: email,
        metadata: {
          prenom: prenom || '',
          nom: nom || '',
          association: association || '',
          commentaire: commentaire || '',
          anonyme: anonyme ? 'oui' : 'non'
        },
        success_url: `${process.env.FRONTEND_URL}?donation=success`,
        cancel_url: `${process.env.FRONTEND_URL}?donation=cancel`
      });

      res.json({ url: session.url });
    } catch (err) {
      console.error('Error createCheckoutSession', err);
      res.status(500).json({ error: 'Erreur serveur Stripe.' });
    }
  }
}