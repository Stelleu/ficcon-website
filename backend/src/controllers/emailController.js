import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailController {
    static async sendEmail(req, res) {
        const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: ["delivered@resend.dev"],
            subject: "hello world",
            html: "<strong>it works!</strong>",
        });

        if (error) {
            return res.status(400).json({ error });
        }

        res.status(200).json({ data });
    }
}
