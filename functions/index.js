const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors"); // Import cors
const nodemailer = require("nodemailer");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Enable CORS
const corsMiddleware = cors({ origin: true });

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "djhokienick@gmail.com",
    pass: "ygub gpix ltza tett",
  },
});

// Invite Host Function
exports.inviteHost = functions.https.onRequest(async (req, res) => {
  console.log("Request received:", req.body); // Log the incoming request

  const email = req.body.data?.email; // Access email inside `data`

  if (!email) {
    console.log("Error: No email provided");
    return res.status(400).send({ error: "Email is required" });
  }

  console.log(`InviteHost function triggered for email: ${email}`);

  try {
    const signupLink = `https://musicgamenight.djhokienick.com/signup?email=${encodeURIComponent(email)}`;

    console.log("Attempting to send email...");
    const mailOptions = {
      from: "djhokienick@gmail.com",
      to: email,
      subject: "You are invited as a host",
      html: `
        <p>You have been invited to join the Music Game Night app as a host.</p>
        <p>Please follow the link below to sign up:</p>
        <a href="${signupLink}">Sign up as a host</a>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");

    const db = admin.firestore();
    await db.collection("hostInvitations").add({
      email,
      status: "Pending",
      createdAt: new Date(),
    });

    console.log("Host invitation stored successfully in Firestore");
    res.status(200).send({
      data: { message: "Host invitation sent successfully" },
    });
  } catch (error) {
    console.error("Error sending host invitation:", error);
    res.status(500).send({ error: `Failed to send host invitation: ${error.message}` });
  }
});