const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const rateLimit = require("express-rate-limit");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const UAParser = require("ua-parser-js");

const app = express();
const PORT = process.env.PORT || 3001;

const DB_DIR = path.join(__dirname, "db");
const GIVEAWAYS_FILE = path.join(DB_DIR, "giveaways.json");
const PARTICIPANTS_FILE = path.join(DB_DIR, "participants.json");
const REFERRALS_FILE = path.join(DB_DIR, "referrals.json");
const BLOCKED_IPS_FILE = path.join(DB_DIR, "blocked_ips.json");

// Security Token (do not expose)
const INTERNAL_TOKEN = "789865452211))zàjejebeh)";

const allowedOrigins = [
  'http://localhost:5173',             // Vite dev server
  'https://hans-luminova.vercel.app' 
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS not allowed from this origin: ' + origin), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use("/uploads", express.static("uploads"));

// Trust proxy for getting real IP
app.set('trust proxy', true);

// Initialize database files
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
if (!fs.existsSync(GIVEAWAYS_FILE)) fs.writeFileSync(GIVEAWAYS_FILE, "{}", "utf8");
if (!fs.existsSync(PARTICIPANTS_FILE)) fs.writeFileSync(PARTICIPANTS_FILE, "{}", "utf8");
if (!fs.existsSync(REFERRALS_FILE)) fs.writeFileSync(REFERRALS_FILE, "{}", "utf8");
if (!fs.existsSync(BLOCKED_IPS_FILE)) fs.writeFileSync(BLOCKED_IPS_FILE, "[]", "utf8");

function loadDB(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    return file.includes('blocked_ips') ? [] : {};
  }
}

function saveDB(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let giveaways = loadDB(GIVEAWAYS_FILE);
let participants = loadDB(PARTICIPANTS_FILE);
let referrals = loadDB(REFERRALS_FILE);
let blockedIPs = loadDB(BLOCKED_IPS_FILE);

// Bot detection patterns
const botUserAgents = [
  /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i, /python/i,
  /java/i, /php/i, /node/i, /axios/i, /fetch/i, /postman/i, /insomnia/i
];

const suspiciousHeaders = [
  'x-forwarded-for', 'x-real-ip', 'x-cluster-client-ip', 'cf-connecting-ip'
];

// Enhanced bot detection middleware
function detectBot(req, res, next) {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.ip;
  
  // Check if IP is blocked
  if (blockedIPs.includes(ip)) {
    return res.status(403).json({ error: "Access denied" });
  }
  
  // Check for bot user agents
  if (botUserAgents.some(pattern => pattern.test(userAgent))) {
    console.log(`Bot detected: ${ip} - ${userAgent}`);
    return res.status(403).json({ error: "Bot access not allowed" });
  }
  
  // Check for missing or suspicious headers
  if (!userAgent || userAgent.length < 10) {
    console.log(`Suspicious request: ${ip} - No/Short User-Agent`);
    return res.status(403).json({ error: "Invalid request" });
  }
  
  // Check for too many proxy headers (potential bot farm)
  const proxyHeaderCount = suspiciousHeaders.filter(header => req.headers[header]).length;
  if (proxyHeaderCount > 2) {
    console.log(`Suspicious proxy headers: ${ip}`);
    return res.status(403).json({ error: "Suspicious request" });
  }
  
  next();
}

// Enhanced rate limiting with different tiers
const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for static files
    return req.path.startsWith('/uploads/');
  }
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: { error: "Rate limit exceeded. Try again later." },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply bot detection to all routes
app.use(detectBot);

// Apply rate limiting
app.use('/api/create', strictLimiter);
app.use('/api/join', strictLimiter);
app.use('/api/delete', strictLimiter);
app.use('/api', generalLimiter);

// Upload Config with enhanced security
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generate secure filename
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    if (!allowedExts.includes(ext)) {
      return cb(new Error('Invalid file type'));
    }
    
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only 1 file
  },
  fileFilter: (req, file, cb) => {
    // Check MIME type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Enhanced device fingerprinting
function generateDeviceFingerprint(req) {
  const ua = req.headers['user-agent'] || '';
  const accept = req.headers['accept'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const connection = req.headers['connection'] || '';
  
  // Parse user agent for more details
  const parser = new UAParser(ua);
  const result = parser.getResult();
  
  const fingerprint = crypto
    .createHash('sha256')
    .update(ua + accept + acceptLanguage + acceptEncoding + connection + 
            JSON.stringify(result.browser) + JSON.stringify(result.os))
    .digest('hex');
  
  return fingerprint;
}

// Random Anime Avatars (using DiceBear API)
const animeAvatars = [
  "https://api.dicebear.com/7.x/anime/svg?seed=anime1",
  "https://api.dicebear.com/7.x/anime/svg?seed=anime2",
  "https://api.dicebear.com/7.x/anime/svg?seed=anime3",
  "https://api.dicebear.com/7.x/anime/svg?seed=anime4",
  "https://api.dicebear.com/7.x/anime/svg?seed=anime5",
  "https://api.dicebear.com/7.x/anime/svg?seed=anime6",
  "https://api.dicebear.com/7.x/anime/svg?seed=anime7",
  "https://api.dicebear.com/7.x/anime/svg?seed=anime8",
  "https://api.dicebear.com/7.x/anime/svg?seed=anime9",
  "https://api.dicebear.com/7.x/anime/svg?seed=anime10"
];

function getRandomAnimeAvatar() {
  return animeAvatars[Math.floor(Math.random() * animeAvatars.length)];
}

// Create giveaway
app.post("/api/create", (req, res) => {
  try {
    const { title, host, phone, channelUrl, endTime } = req.body;
    const creatorIp = req.ip;
    
    // Validation
    if (!title || !host || !phone || !channelUrl || !endTime) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    // Validate phone number format
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }
    
    // Validate URL
    try {
      new URL(channelUrl);
    } catch {
      return res.status(400).json({ error: "Invalid channel URL" });
    }
    
    // Validate end time (must be in future)
    const endTimeMs = new Date(endTime).getTime();
    if (endTimeMs <= Date.now()) {
      return res.status(400).json({ error: "End time must be in the future" });
    }
    
    const id = uuidv4();
    giveaways[id] = {
      id,
      title: title.trim(),
      host: host.trim(),
      phone: phone.trim(),
      channelUrl: channelUrl.trim(),
      endTime: endTimeMs,
      createdAt: Date.now(),
      creatorIp,
      status: 'active'
    };
    participants[id] = {};
    referrals[id] = {};
    
    saveDB(GIVEAWAYS_FILE, giveaways);
    saveDB(PARTICIPANTS_FILE, participants);
    saveDB(REFERRALS_FILE, referrals);
    
    res.json({ success: true, id });
  } catch (error) {
    console.error('Create giveaway error:', error);
    res.status(500).json({ error: "Failed to create giveaway" });
  }
});

// Join giveaway
app.post("/api/join/:id", upload.single("avatar"), (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const ip = req.ip;
    const deviceFingerprint = generateDeviceFingerprint(req);
    
    if (!giveaways[id]) {
      return res.status(404).json({ error: "Giveaway not found." });
    }
    
    // Check if giveaway has ended
    if (Date.now() > giveaways[id].endTime) {
      return res.status(400).json({ error: "Giveaway has ended." });
    }
    
    // Validate name
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters long." });
    }
    
    // Check if user already joined (by name and device fingerprint)
    const existingParticipant = Object.values(participants[id] || {}).find(
      p => p.name.toLowerCase() === name.toLowerCase().trim() && p.deviceFingerprint === deviceFingerprint
    );
    
    if (existingParticipant) {
      return res.status(400).json({ error: "You have already joined this giveaway." });
    }
    
    const userId = uuidv4();
    const avatar = req.file ? `http://hans-luminova.onrender.com/uploads/${req.file.filename}` : getRandomAnimeAvatar();
    
    participants[id][userId] = {
      id: userId,
      name: name.trim(),
      avatar,
      refCount: 0,
      joinedAt: Date.now(),
      ip,
      deviceFingerprint
    };
    
    referrals[id][userId] = [];
    
    saveDB(PARTICIPANTS_FILE, participants);
    saveDB(REFERRALS_FILE, referrals);
    
    const refLink = `http://hans-luminova.vercel.app/g/${id}?ref=${userId}`;
    res.json({ success: true, userId, refLink, avatar });
  } catch (error) {
    console.error('Join giveaway error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: "File too large. Maximum size is 5MB." });
    }
    res.status(500).json({ error: "Failed to join giveaway" });
  }
});

app.get("/", (req, res) => {
  res.status(200).send("✅ Hans Luminova backend is live!");
});

// Handle referral clicks and redirects
app.get("/g/:id", (req, res) => {
  try {
    const { ref } = req.query;
    const { id } = req.params;
    const visitorIp = req.ip;
    const deviceFingerprint = generateDeviceFingerprint(req);
    
    if (!giveaways[id]) {
      return res.status(404).send(`
        <html>
          <head>
            <title>Giveaway Not Found - LUMINORA</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 50px; min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
              .container { background: rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; backdrop-filter: blur(10px); }
              .logo { font-size: 2em; font-weight: bold; margin-bottom: 20px; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">LUMINORA</div>
              <h1>Giveaway Not Found</h1>
              <p>The giveaway you're looking for doesn't exist.</p>
            </div>
          </body>
        </html>
      `);
    }
    
    const giveaway = giveaways[id];
    const now = Date.now();
    
    // If giveaway ended, show winner page
    if (now > giveaway.endTime) {
      const participantsList = Object.values(participants[id] || {});
      const winner = participantsList.length > 0 
        ? participantsList.sort((a, b) => b.refCount - a.refCount)[0]
        : null;
      
      return res.send(`
        <html>
          <head>
            <title>Giveaway Ended - ${giveaway.title} | LUMINORA</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
              .container { background: rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; backdrop-filter: blur(10px); max-width: 500px; }
              .logo { font-size: 1.5em; font-weight: bold; margin-bottom: 20px; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
              .avatar { width: 120px; height: 120px; border-radius: 50%; margin: 20px auto; display: block; border: 4px solid #ffd700; }
              .btn { background: #ff6b6b; color: white; padding: 15px 30px; border: none; border-radius: 25px; text-decoration: none; display: inline-block; margin: 10px; transition: transform 0.3s; }
              .btn:hover { transform: translateY(-2px); }
              .winner-badge { background: linear-gradient(45deg, #ffd700, #ffed4e); color: #333; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 10px 0; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">LUMINORA</div>
              <h1>🎉 Giveaway Ended</h1>
              <h2>${giveaway.title}</h2>
              ${winner ? `
                <div class="winner-badge">🏆 WINNER</div>
                <h3>${winner.name}</h3>
                <img src="${winner.avatar}" alt="Winner Avatar" class="avatar" />
                <p><strong>Referrals:</strong> ${winner.refCount}</p>
                <p><strong>Contact Winner:</strong> ${giveaway.phone}</p>
              ` : '<p>No participants found.</p>'}
              <a href="${giveaway.channelUrl}" target="_blank" class="btn">Visit Channel</a>
            </div>
          </body>
        </html>
      `);
    }
    
    // Track referral if valid
    if (ref && participants[id]?.[ref]) {
      const referralKey = `${visitorIp}_${deviceFingerprint}`;
      
      if (!referrals[id][ref].includes(referralKey)) {
        participants[id][ref].refCount++;
        referrals[id][ref].push(referralKey);
        
        saveDB(PARTICIPANTS_FILE, participants);
        saveDB(REFERRALS_FILE, referrals);
      }
    }
    
    // Redirect to giveaway channel
    res.redirect(giveaway.channelUrl);
  } catch (error) {
    console.error('Referral tracking error:', error);
    res.status(500).send("Internal server error");
  }
});

// Delete giveaway (IP-based authorization)
app.delete("/api/delete/:id", (req, res) => {
  try {
    const { id } = req.params;
    const requesterIp = req.ip;
    
    if (!giveaways[id]) {
      return res.status(404).json({ error: "Giveaway not found" });
    }
    
    if (giveaways[id].creatorIp !== requesterIp) {
      return res.status(403).json({ error: "Only the creator can delete this giveaway" });
    }
    
    delete giveaways[id];
    delete participants[id];
    delete referrals[id];
    
    saveDB(GIVEAWAYS_FILE, giveaways);
    saveDB(PARTICIPANTS_FILE, participants);
    saveDB(REFERRALS_FILE, referrals);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete giveaway error:', error);
    res.status(500).json({ error: "Failed to delete giveaway" });
  }
});

// Get all giveaways
app.get("/api/giveaways", (req, res) => {
  try {
    const giveawaysList = Object.values(giveaways).map(g => ({
      ...g,
      participantCount: Object.keys(participants[g.id] || {}).length,
      isEnded: Date.now() > g.endTime
    }));
    res.json(giveawaysList);
  } catch (error) {
    console.error('Get giveaways error:', error);
    res.status(500).json({ error: "Failed to fetch giveaways" });
  }
});

// Get giveaway details
app.get("/api/giveaway/:id", (req, res) => {
  try {
    const { id } = req.params;
    const giveaway = giveaways[id];
    
    if (!giveaway) {
      return res.status(404).json({ error: "Giveaway not found" });
    }
    
    const participantsList = Object.values(participants[id] || {});
    const isEnded = Date.now() > giveaway.endTime;
    
    res.json({
      ...giveaway,
      participants: participantsList,
      participantCount: participantsList.length,
      isEnded,
      winner: isEnded ? participantsList.sort((a, b) => b.refCount - a.refCount)[0] : null
    });
  } catch (error) {
    console.error('Get giveaway details error:', error);
    res.status(500).json({ error: "Failed to fetch giveaway details" });
  }
});

// Get leaderboard
app.get("/api/leaderboard/:id", (req, res) => {
  try {
    const { id } = req.params;
    if (!participants[id]) {
      return res.status(404).json({ error: "Giveaway not found" });
    }
    
    const sorted = Object.values(participants[id])
      .sort((a, b) => b.refCount - a.refCount)
      .slice(0, 50); // Top 50
    
    res.json(sorted);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Get global leaderboard
app.get("/api/global-leaderboard", (req, res) => {
  try {
    const allParticipants = [];
    
    Object.keys(participants).forEach(giveawayId => {
      const giveaway = giveaways[giveawayId];
      if (giveaway) {
        Object.values(participants[giveawayId]).forEach(participant => {
          allParticipants.push({
            ...participant,
            giveawayTitle: giveaway.title,
            giveawayId: giveawayId
          });
        });
      }
    });
    
    // Sort by referral count and get top 100
    const sorted = allParticipants
      .sort((a, b) => b.refCount - a.refCount)
      .slice(0, 100);
    
    res.json(sorted);
  } catch (error) {
    console.error('Get global leaderboard error:', error);
    res.status(500).json({ error: "Failed to fetch global leaderboard" });
  }
});

// Get countdown
app.get("/api/countdown/:id", (req, res) => {
  try {
    const { id } = req.params;
    if (!giveaways[id]) {
      return res.status(404).json({ error: "Giveaway not found" });
    }
    
    const now = Date.now();
    const remaining = Math.max(0, giveaways[id].endTime - now);
    
    res.json({ remaining, isEnded: remaining === 0 });
  } catch (error) {
    console.error('Get countdown error:', error);
    res.status(500).json({ error: "Failed to get countdown" });
  }
});

// Get my giveaways (IP-based)
app.get("/api/my-giveaways", (req, res) => {
  try {
    const requesterIp = req.ip;
    const myGiveaways = Object.values(giveaways)
      .filter(g => g.creatorIp === requesterIp)
      .map(g => ({
        ...g,
        participantCount: Object.keys(participants[g.id] || {}).length,
        isEnded: Date.now() > g.endTime
      }));
    
    res.json(myGiveaways);
  } catch (error) {
    console.error('Get my giveaways error:', error);
    res.status(500).json({ error: "Failed to fetch your giveaways" });
  }
});

// Get stats
app.get("/api/stats", (req, res) => {
  try {
    const totalGiveaways = Object.keys(giveaways).length;
    const totalParticipants = Object.values(participants).reduce((acc, g) => acc + Object.keys(g).length, 0);
    const activeGiveaways = Object.values(giveaways).filter(g => Date.now() < g.endTime).length;
    const totalReferrals = Object.values(referrals).reduce((acc, g) => 
      acc + Object.values(g).reduce((sum, refs) => sum + refs.length, 0), 0
    );
    
    res.json({ 
      totalGiveaways, 
      totalParticipants, 
      activeGiveaways,
      endedGiveaways: totalGiveaways - activeGiveaways,
      totalReferrals
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Admin endpoint to block IPs (requires internal token)
app.post("/api/admin/block-ip", (req, res) => {
  try {
    const { token, ip } = req.body;
    
    if (token !== INTERNAL_TOKEN) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    if (!blockedIPs.includes(ip)) {
      blockedIPs.push(ip);
      saveDB(BLOCKED_IPS_FILE, blockedIPs);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Block IP error:', error);
    res.status(500).json({ error: "Failed to block IP" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: Date.now(),
    service: "LUMINORA Giveaway Platform",
    version: "1.0.0"
  });
});

// 404 handler
app.get("*", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: "Request too large" });
  }
  
  if (error.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 LUMINORA Giveaway backend running on port ${PORT}`);
  console.log(`📁 Database directory: ${DB_DIR}`);
  console.log(`🛡️  Enhanced security and anti-bot protection enabled`);
});
