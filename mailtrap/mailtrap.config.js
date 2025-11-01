import {MailtrapClient} from "mailtrap";
import "dotenv/config";

const TOKEN = process.env.MAILTRAP_TOKEN;

export const mailTrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.co",
  name: "NSK.AI",
};