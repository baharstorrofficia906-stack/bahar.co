import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable, customersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import multer from "multer";
import { objectStorageClient } from "../lib/objectStorage";

const router: IRouter = Router();

const ADMIN_PASSWORD = "B2H0A3R9RTAP";
const DELETE_ADMIN_PASSWORD = "y70£1NW~4E+rz/8EhA+6Zl|?hVlKr?@mf4'3e?>.'Zl\\";

// --- Multer: in-memory (we stream to GCS instead of disk) ---
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

async function uploadToGCS(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
  const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucketId) throw new Error("DEFAULT_OBJECT_STORAGE_BUCKET_ID not set");

  const ext = originalName.includes(".") ? "." + originalName.split(".").pop() : ".jpg";
  const objectName = `product-images/${randomUUID()}${ext}`;

  const bucket = objectStorageClient.bucket(bucketId);
  const file = bucket.file(objectName);

  await file.save(buffer, {
    contentType: mimeType || "image/jpeg",
    metadata: { cacheControl: "public, max-age=31536000" },
  });

  return `/api/storage/objects/${objectName}`;
}

// --- Serve stored images from GCS (matches /storage/objects/anything/here) ---
router.use("/storage/objects", (req, res) => {
  const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucketId) return res.status(500).json({ error: "Storage not configured" });

  const objectName = req.path.replace(/^\//, "");
  if (!objectName) return res.status(400).json({ error: "No object path" });

  const bucket = objectStorageClient.bucket(bucketId);
  const file = bucket.file(objectName);

  res.setHeader("Cache-Control", "public, max-age=31536000");

  const readStream = file.createReadStream();
  readStream.on("error", (err: any) => {
    req.log.error({ err, objectName }, "Failed to stream image from GCS");
    if (!res.headersSent) {
      res.status(404).json({ error: "Image not found" });
    }
  });
  readStream.on("response", (response: any) => {
    const contentType = response.headers?.["content-type"] || "image/jpeg";
    res.setHeader("Content-Type", contentType);
  });
  readStream.pipe(res);
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
    const url = await uploadToGCS(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.json({ url, filename: url.split("/").pop() });
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
    const urls = await Promise.all(
      files.map(f => uploadToGCS(f.buffer, f.originalname, f.mimetype))
    );
    const filenames = urls.map(u => u.split("/").pop() ?? u);
    res.json({ urls, filenames });
  } catch (err) {
    req.log.error({ err }, "Failed to upload images");
    res.status(500).json({ error: "Failed to upload images" });
  }
});

export default router;
