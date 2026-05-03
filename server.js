require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const path       = require("path");
const fs         = require("fs");
const nodemailer = require("nodemailer");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Email transporter ──────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

let emailReady = false;
transporter.verify(err => {
  if (err) {
    console.warn("\n⚠️  Email not configured — messages saved locally only.");
    console.warn("   Fill MAIL_USER + MAIL_PASS in .env to enable real emails.\n");
  } else {
    emailReady = true;
    console.log(`\n✅ Email ready → sending to ${process.env.MAIL_TO}\n`);
  }
});

// ── Middleware ─────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ── Home ───────────────────────────────────────────────
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "index.html"))
);

// ── RESUME DOWNLOAD ────────────────────────────────────
// Looks in ./resume/Aakash_Resume.pdf
app.get("/api/resume", (req, res) => {
  // Try multiple locations so it always works
  const locations = [
    path.join(__dirname, "resume", "Aakash_Resume.pdf"),
    path.join(__dirname, "Aakash_Resume.pdf"),
  ];
  const found = locations.find(p => fs.existsSync(p));
  if (!found) {
    return res.status(404).send(`
      <html><body style="font-family:sans-serif;padding:40px;background:#0a0a0f;color:#e2e8f0">
        <h2>Resume not found</h2>
        <p>Create a <code>resume/</code> folder next to server.js and put <code>Aakash_Resume.pdf</code> inside it.</p>
      </body></html>`);
  }
  res.setHeader("Content-Disposition", 'attachment; filename="Aakash_Yadav_Resume.pdf"');
  res.setHeader("Content-Type", "application/pdf");
  res.sendFile(found);
});

// ── CONTACT FORM ───────────────────────────────────────
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message)
    return res.status(400).json({ success: false, message: "Name, email and message are required." });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ success: false, message: "Please enter a valid email address." });

  // Always save locally
  const logPath = path.join(__dirname, "messages.json");
  let msgs = [];
  try { msgs = JSON.parse(fs.readFileSync(logPath, "utf-8")); } catch {}
  msgs.push({ name, email, subject: subject||"", message, ts: new Date().toISOString() });
  fs.writeFileSync(logPath, JSON.stringify(msgs, null, 2));
  console.log(`\n📬 ${name} <${email}> — ${subject||"no subject"}\n${message}\n`);

  // Send email if configured
  if (emailReady) {
    try {
      await transporter.sendMail({
        from: `"Portfolio Contact" <${process.env.MAIL_USER}>`,
        to:   process.env.MAIL_TO || process.env.MAIL_USER,
        replyTo: email,
        subject: `📩 Portfolio: ${subject || "Message from " + name}`,
        html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:linear-gradient(135deg,#6d28d9,#06b6d4);padding:24px 32px;border-radius:12px 12px 0 0">
    <h2 style="margin:0;color:#fff;font-size:20px">New Portfolio Message</h2>
  </div>
  <div style="background:#111124;padding:32px;border-radius:0 0 12px 12px;color:#e2e8f0">
    <p><b>From:</b> ${name}</p>
    <p><b>Email:</b> <a href="mailto:${email}" style="color:#06b6d4">${email}</a></p>
    <p><b>Subject:</b> ${subject||"(none)"}</p>
    <div style="background:#0a0a0f;padding:16px;border-left:3px solid #6d28d9;border-radius:4px;margin-top:16px">
      <p style="margin:0;line-height:1.7">${message.replace(/\n/g,"<br>")}</p>
    </div>
    <p style="color:#64748b;font-size:12px;margin-top:20px">
      ${new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})} IST
    </p>
  </div>
</div>`,
      });

      // Auto-reply to sender
      await transporter.sendMail({
        from: `"Aakash Yadav" <${process.env.MAIL_USER}>`,
        to:   email,
        subject: `Thanks for reaching out, ${name}! 👋`,
        html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:linear-gradient(135deg,#6d28d9,#06b6d4);padding:24px 32px;border-radius:12px 12px 0 0">
    <h2 style="margin:0;color:#fff">Thanks for getting in touch!</h2>
  </div>
  <div style="background:#111124;padding:32px;border-radius:0 0 12px 12px;color:#e2e8f0">
    <p>Hi <b>${name}</b>,</p>
    <p style="color:#94a3b8;line-height:1.7">
      Thank you for reaching out! I've received your message and will get back to you within 24–48 hours.
    </p>
    <div style="background:#0a0a0f;padding:16px;border-left:3px solid #06b6d4;border-radius:4px;margin:20px 0">
      <p style="margin:0;font-size:13px;color:#64748b">Your message:</p>
      <p style="margin:8px 0 0;line-height:1.7">${message.replace(/\n/g,"<br>")}</p>
    </div>
    <p style="margin-top:24px">
      <b>Aakash Yadav</b><br>
      <span style="color:#64748b;font-size:13px">Full-Stack Developer &amp; AI Enthusiast</span><br>
      <a href="https://www.linkedin.com/in/aakash-yadav-041023326" style="color:#06b6d4;font-size:13px">LinkedIn</a>
      &nbsp;·&nbsp;
      <a href="https://github.com/Aakash9949" style="color:#06b6d4;font-size:13px">GitHub</a>
    </p>
  </div>
</div>`,
      });

      return res.json({ success: true, message: "Message sent! I'll reply to you soon." });

    } catch(err) {
      console.error("Email error:", err.message);
      // Still return success — message was saved locally
      return res.json({ success: true, message: "Message received! I'll get back to you soon." });
    }
  }

  res.json({ success: true, message: "Message received! I'll get back to you soon." });
});

// ── PROJECTS ───────────────────────────────────────────
app.get("/api/projects", (req, res) => res.json({ projects: [
  { id:1, title:"SmartSathi — AI Elderly Care Companion",
    tech:["HTML","CSS","JavaScript","Browser APIs"],
    github:"https://github.com/akshita0819/SmartSaathi",
    live:"https://smartsaathi.onrender.com/" },
  { id:2, title:"Smart Rainwater Harvesting System",
    tech:["IoT","Python","Sensors"],
    github:"https://github.com/Aakash9949/LAB_2_INDIGENOUS_RAINWATER_PROJECT",
    live:"https://aakash9949.github.io/LAB_2_INDIGENOUS_RAINWATER_PROJECT/" },
  { id:3, title:"Hospital Management System",
    tech:["Python","HTML","CSS","JavaScript","SQL"],
    github:"https://github.com/Aakash9949/HOSPITAL_MANAGEMENT",
    live:"https://aakash9949.github.io/HOSPITAL_MANAGEMENT/" },
  { id:4, title:"Event Management System",
    tech:["Python","CSS","HTML","JavaScript","Flask"],
    github:"https://github.com/Aakash9949/WEB_EVENT_MANAGEMENT",
    live:"https://aakash9949.github.io/WEB_EVENT_MANAGEMENT/" },
]}));

app.get("/api/skills", (req, res) => res.json({
  languages:["Python","JavaScript","HTML/CSS","C++","Java"],
  frameworks:["NumPy","Pandas","Flask","Speech Recognition","NLP","Browser APIs"],
  tools:["GitHub","VS Code","WordPress"],
  database:["SQL","MongoDB"],
  soft:["Leadership","Communication"],
}));

app.get("/api/messages", (req, res) => {
  try { res.json(JSON.parse(fs.readFileSync(path.join(__dirname,"messages.json"),"utf-8"))); }
  catch { res.json([]); }
});

app.get("/api/health", (req, res) =>
  res.json({ status:"ok", emailReady, ts:new Date().toISOString() })
);

app.use((req, res) => res.status(404).json({ error:"Route not found" }));

app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio  →  http://localhost:${PORT}`);
  console.log(`   Resume    →  GET  /api/resume`);
  console.log(`   Contact   →  POST /api/contact\n`);
});
