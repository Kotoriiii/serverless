const functions = require("@google-cloud/functions-framework");
const mailgun = require("mailgun-js");
const mysql = require("mysql2");
require("dotenv").config();

functions.cloudEvent("sendVerificationEmail", (cloudEvent) => {
  const base64name = cloudEvent.data.message.data;
  const messageData = JSON.parse(Buffer.from(base64name, "base64").toString());
  const userEmail = messageData.data.email;
  const userId = messageData.data.id;
  const verifyCode = messageData.data.verifyCode;
  console.log(userEmail, userId, verifyCode);

  const DOMAIN = "jasonlidevelop.me";
  const mg = mailgun({ apiKey: process.env["API_KEY"], domain: DOMAIN });

  const verificationLink = `http://api.development.com/verify?id=${userId}&code=${verifyCode}`;

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

  console.log(`Sending verification email to ${userEmail}`);

  const pool = mysql.createPool(process.env["DATABASE_URL"]);

  pool.getConnection(function (err, connection) {
    if (err instanceof Error) {
      console.log(err);
      return;
    }

    const sql =
      "UPDATE `User` SET `isSend` = true WHERE `id` = ? and `verifyCode` = ? ";
    pool.execute(sql, [userId, verifyCode], function (err, result, fields) {
      if (err instanceof Error) {
        console.log(err);
        return;
      }

      console.log(result);
      console.log(fields);
    });

    connection.release();
  });
});
