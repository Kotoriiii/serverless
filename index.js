const functions = require("@google-cloud/functions-framework");
const mailgun = require("mailgun-js");
require("dotenv").config();

functions.cloudEvent("sendVerificationEmail", (cloudEvent) => {
  const base64name = cloudEvent.data.message.data;
  const message = JSON.parse(Buffer.from(base64name, "base64").toString());
  const userEmail = message.email;
  const userId = message.id;
  const verificationCode = message.verificationCode;
  console.log(userEmail, userId, verificationCode);

  const DOMAIN = "jasonlidevelop.me";
  const mg = mailgun({ apiKey: process.env["API_KEY"], domain: DOMAIN });

  const verificationLink = `http://api.development.com/verify?user=${userId}&code=${verificationCode}`;

  const data = {
    from: `Excited User <mailgun@${DOMAIN}>`,
    to: userEmail,
    subject: "Please verify your email address",
    html: `Please click on the link to verify your email: <a href="${verificationLink}">${verificationLink}</a>`,
  };

  mg.messages().send(data, function (error, body) {
    if (error) {
      return console.log(error);
    }
    console.log(body);
  });

  // Your logic to send the email goes here
  console.log(`Sending verification email to ${userEmail}`);
});

// sendVerificationEmail({
//   data: Buffer.from(
//     JSON.stringify({
//       id: "1",
//       email: "ljq19970216@gmail.com",
//     })
//   ).toString("base64"),
// });
