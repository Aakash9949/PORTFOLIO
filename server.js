// ═══════════════════════════════════════════════════════════
//  Aakash Yadav — Portfolio Server
//
//  FOLDER STRUCTURE (all files in ONE folder):
//    server.js
//    index.html
//    style.css
//    script.js
//    package.json
//    Aakash_Resume.pdf   ← resume in SAME folder
//
//  SETUP:
//    1. npm install
//    2. node server.js
//    3. Open http://localhost:3000
// ═══════════════════════════════════════════════════════════

const express    = require("express");
const cors       = require("cors");
const path       = require("path");
const fs         = require("fs");
const nodemailer = require("nodemailer");

const app  = express();
const PORT = 3000;

// ── Email Credentials ──────────────────────────────────────
const MAIL_USER = "aakashyd09@gmail.com";
const MAIL_PASS = "qozt gzch yzth byxu";
const MAIL_TO   = "aakashyd09@gmail.com";

// ── Nodemailer Transporter ─────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   "smtp.gmail.com",
  port:   587,
  secure: false,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

let emailReady = false;

transporter.verify(err => {
  if (err) {
    console.error("❌ Email error:", err.message);
  } else {
    emailReady = true;
    console.log("✅ Email connected →", MAIL_USER);
  }
});

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ══════════════════════════════════════════════════════════
//  ROUTES
// ══════════════════════════════════════════════════════════

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ── RESUME DOWNLOAD ────────────────────────────────────────
app.get("/api/resume", (req, res) => {
  const filePath = path.join(__dirname, "Aakash_Resume.pdf");

  if (!fs.existsSync(filePath)) {
    console.error("❌ Resume not found at:", filePath);
    return res.status(404).json({
      success: false,
      error: "Resume not found. Place Aakash_Resume.pdf in the same folder as server.js"
    });
  }

  console.log("📄 Resume download requested");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="Aakash_Yadav_Resume.pdf"');
  res.setHeader("Cache-Control", "no-cache");

  const fileStream = fs.createReadStream(filePath);
  fileStream.on("error", err => {
    console.error("Stream error:", err);
    res.status(500).json({ success: false, error: "Failed to read resume file" });
  });
  fileStream.pipe(res);
});

// ── CONTACT FORM ───────────────────────────────────────────
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and message are required."
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address."
    });
  }

  const timestamp   = new Date().toISOString();
  const subjectText = subject || "(no subject)";

  console.log(`\n📬 New message from ${name} <${email}>`);
  console.log(`   Subject: ${subjectText}`);
  console.log(`   Message: ${message}`);

  // Save to messages.json
  const logPath = path.join(__dirname, "messages.json");
  let msgs = [];
  try {
    if (fs.existsSync(logPath)) msgs = JSON.parse(fs.readFileSync(logPath, "utf-8"));
  } catch (e) { msgs = []; }
  msgs.push({ name, email, subject: subjectText, message, timestamp });
  try {
    fs.writeFileSync(logPath, JSON.stringify(msgs, null, 2));
    console.log("✅ Saved to messages.json");
  } catch (e) { console.error("Save error:", e.message); }

  // Send Emails
  if (emailReady) {
    try {
      // 1) Notification to Aakash
      await transporter.sendMail({
        from:    `"Portfolio Contact" <${MAIL_USER}>`,
        to:      MAIL_TO,
        replyTo: `"${name}" <${email}>`,
        subject: `📩 Portfolio: ${subjectText}`,
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0"
      style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1);">
      <tr>
        <td style="background:linear-gradient(135deg,#6d28d9,#06b6d4);padding:28px 36px;">
          <h1 style="margin:0;color:#fff;font-size:20px;">📩 New Portfolio Message</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,.8);font-size:13px;">
            via aakashyadav.dev</p>
        </td>
      </tr>
      <tr>
        <td style="padding:30px 36px;">
          <table width="100%" cellpadding="6" cellspacing="0">
            <tr>
              <td style="color:#64748b;font-size:12px;width:80px;">FROM</td>
              <td style="font-weight:700;font-size:15px;">${name}</td>
            </tr>
            <tr>
              <td style="color:#64748b;font-size:12px;">EMAIL</td>
              <td><a href="mailto:${email}" style="color:#6d28d9;">${email}</a></td>
            </tr>
            <tr>
              <td style="color:#64748b;font-size:12px;">SUBJECT</td>
              <td>${subjectText}</td>
            </tr>
          </table>
          <div style="margin-top:20px;background:#f8fafc;border-left:4px solid #6d28d9;
            border-radius:6px;padding:16px;">
            <p style="margin:0 0 6px;font-size:11px;color:#94a3b8;">MESSAGE</p>
            <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.7;">
              ${message.replace(/\n/g, "<br>")}</p>
          </div>
          <p style="margin-top:20px;font-size:11px;color:#94a3b8;">
            ${new Date(timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
            — Hit Reply to respond to ${name}.
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`,
      });

      // 2) Auto-reply to sender
      await transporter.sendMail({
        from:    `"Aakash Yadav" <${MAIL_USER}>`,
        to:      `"${name}" <${email}>`,
        subject: `Hey ${name}! Got your message 👋`,
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0"
      style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1);">
      <tr>
        <td style="background:linear-gradient(135deg,#6d28d9,#06b6d4);padding:28px 36px;">
          <h1 style="margin:0;color:#fff;font-size:20px;">Thanks for reaching out! 🙌</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:30px 36px;color:#1e293b;">
          <p style="font-size:16px;margin-top:0;">Hi <strong>${name}</strong>,</p>
          <p style="color:#475569;line-height:1.8;">
            Thank you for contacting me through my portfolio! I've received your message
            and will reply within <strong>24–48 hours</strong>.
          </p>
          <div style="background:#f8fafc;border-left:4px solid #06b6d4;border-radius:6px;
            padding:16px;margin:20px 0;">
            <p style="margin:0 0 6px;font-size:11px;color:#94a3b8;">YOUR MESSAGE</p>
            <p style="margin:0;font-size:14px;color:#475569;line-height:1.7;">
              ${message.replace(/\n/g, "<br>")}</p>
          </div>
          <p style="color:#475569;line-height:1.8;">Looking forward to connecting!</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
          <p style="margin:0;">
            <strong>Aakash Yadav</strong><br>
            <span style="color:#64748b;font-size:13px;">Full-Stack Developer &amp; AI Enthusiast</span><br>
            <a href="https://www.linkedin.com/in/aakash-yadav-041023326"
              style="color:#6d28d9;font-size:12px;text-decoration:none;">LinkedIn</a>
            &nbsp;·&nbsp;
            <a href="https://github.com/Aakash9949"
              style="color:#6d28d9;font-size:12px;text-decoration:none;">GitHub</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`,
      });

      console.log(`✅ Emails sent to ${MAIL_TO} and auto-reply to ${email}`);
      return res.json({
        success: true,
        message: "Message sent! You'll receive a confirmation email shortly."
      });

    } catch (emailErr) {
      console.error("❌ Email failed:", emailErr.message);
      return res.json({
        success: true,
        message: "Message received! I'll get back to you soon."
      });
    }
  }

  return res.json({
    success: true,
    message: "Message received! I'll get back to you soon."
  });
});

// ── Health Check ───────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status:       "ok",
    emailReady,
    resumeExists: fs.existsSync(path.join(__dirname, "Aakash_Resume.pdf")),
    timestamp:    new Date().toISOString()
  });
});

// ── View Messages (admin) ──────────────────────────────────
app.get("/api/messages", (req, res) => {
  try {
    const logPath = path.join(__dirname, "messages.json");
    res.json(fs.existsSync(logPath)
      ? JSON.parse(fs.readFileSync(logPath, "utf-8"))
      : []);
  } catch { res.json([]); }
});

// 404
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// ── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio  →  http://localhost:${PORT}`);
  console.log(`   Resume    →  http://localhost:${PORT}/api/resume`);
  console.log(`   Health    →  http://localhost:${PORT}/api/health\n`);

  if (!fs.existsSync(path.join(__dirname, "Aakash_Resume.pdf"))) {
    console.warn("⚠️  Aakash_Resume.pdf not found! Place it in the same folder as server.js\n");
  } else {
    console.log("✅ Resume found and ready\n");
  }
});
