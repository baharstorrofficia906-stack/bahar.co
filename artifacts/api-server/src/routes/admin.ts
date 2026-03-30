import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable, customersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";
import multer from "multer";

const router: IRouter = Router();

const ADMIN_PASSWORD = "B2H0A3R9RTAP";
const DELETE_ADMIN_PASSWORD = "y70£1NW~4E+rz/8EhA+6Zl|?hVlKr?@mf4'3e?>.'Zl\\";

// --- Multer setup: accept any file, store on disk ---
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const name = `img_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// --- Auth ---
router.post("/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    (req.session as any).admin = true;
    res.json({ success: true, message: "Login successful" });
  } else {
    res.status(401).json({ success: false, message: "Invalid password" });
  }
});

router.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Logged out" });
  });
});

router.get("/admin/me", (req, res) => {
  if ((req.session as any)?.admin) {
    res.json({ authenticated: true, role: "admin" });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// --- Stats ---
router.get("/stats", async (req, res) => {
  try {
    const [allOrders, allProducts, allCustomers] = await Promise.all([
      db.select().from(ordersTable),
      db.select().from(productsTable),
      db.select().from(customersTable),
    ]);

    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);
    const pendingOrders = allOrders.filter((o) => o.status === "pending").length;
    const recentOrders = [...allOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    res.json({
      totalOrders: allOrders.length,
      totalRevenue,
      totalProducts: allProducts.length,
      totalCustomers: allCustomers.length,
      pendingOrders,
      recentOrders,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// --- Image Upload (single) ---
router.post("/upload/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }
    const url = `/api/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  } catch (err) {
    req.log.error({ err }, "Failed to upload image");
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// --- Multiple Image Upload ---
router.post("/upload/images", upload.array("images", 20), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No image files provided" });
    }
    const urls = files.map(f => `/api/uploads/${f.filename}`);
    const filenames = files.map(f => f.filename);
    res.json({ urls, filenames });
  } catch (err) {
    req.log.error({ err }, "Failed to upload images");
    res.status(500).json({ error: "Failed to upload images" });
  }
});

export default router;
