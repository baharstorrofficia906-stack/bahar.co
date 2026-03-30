import nodemailer from "nodemailer";

const NOTIFY_EMAIL = "baharstoree63@gmail.com";

function createTransporter() {
  const user = process.env.GMAIL_USER || NOTIFY_EMAIL;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendNotification(subject: string, html: string) {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("[Email] GMAIL_APP_PASSWORD not set — skipping notification");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Bahar Store 🏪" <${process.env.GMAIL_USER || NOTIFY_EMAIL}>`,
      to: NOTIFY_EMAIL,
      subject: `[Bahar] ${subject}`,
      html,
    });
    console.log(`[Email] Sent: ${subject}`);
  } catch (err) {
    console.error("[Email] Failed to send:", err);
  }
}

export function orderEmailHtml(order: any) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="background:#001F3F;padding:24px;text-align:center;">
        <h1 style="color:#D4AF37;font-size:28px;margin:0;">BAHAR</h1>
        <p style="color:#F5ECDC;margin:4px 0 0;">New Order Received</p>
      </div>
      <div style="padding:24px;">
        <h2 style="color:#001F3F;">Order #${order.id}</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px;color:#666;font-weight:bold;">Customer:</td><td style="padding:8px;">${order.customerName}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px;color:#666;font-weight:bold;">Phone:</td><td style="padding:8px;">${order.customerPhone}</td></tr>
          <tr><td style="padding:8px;color:#666;font-weight:bold;">Address:</td><td style="padding:8px;">${order.shippingAddress || "Not provided"}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px;color:#666;font-weight:bold;">Total:</td><td style="padding:8px;font-weight:bold;color:#D4AF37;font-size:18px;">EGP ${order.totalPrice?.toLocaleString()}</td></tr>
          <tr><td style="padding:8px;color:#666;font-weight:bold;">Status:</td><td style="padding:8px;"><span style="background:#FEF3C7;color:#92400E;padding:4px 12px;border-radius:99px;font-size:13px;">${order.status}</span></td></tr>
        </table>
        ${order.items ? `
        <h3 style="color:#001F3F;margin-top:20px;">Order Items</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="background:#001F3F;color:white;"><th style="padding:8px;text-align:left;">Product</th><th style="padding:8px;">Qty</th><th style="padding:8px;">Price</th></tr>
          ${JSON.parse(order.items || '[]').map((item: any, i: number) => `
          <tr style="${i % 2 === 0 ? 'background:#f9f9f9' : ''}">
            <td style="padding:8px;">${item.name || item.productName || "Product"}</td>
            <td style="padding:8px;text-align:center;">${item.quantity}</td>
            <td style="padding:8px;text-align:center;">EGP ${item.price}</td>
          </tr>`).join('')}
        </table>` : ""}
      </div>
      <div style="background:#F5ECDC;padding:16px;text-align:center;color:#666;font-size:12px;">
        Bahar Premium Store — baharstoree63@gmail.com
      </div>
    </div>
  `;
}

export function stockAlertEmailHtml(product: any) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="background:#DC2626;padding:24px;text-align:center;">
        <h1 style="color:white;font-size:28px;margin:0;">⚠️ Low Stock Alert</h1>
      </div>
      <div style="padding:24px;">
        <h2 style="color:#001F3F;">${product.name}</h2>
        <p style="color:#DC2626;font-size:18px;font-weight:bold;">Only <strong>${product.stock}</strong> unit(s) remaining!</p>
        <p style="color:#666;">Please restock this product as soon as possible to avoid missing sales.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <tr><td style="padding:8px;color:#666;">Category:</td><td style="padding:8px;">${product.category || "—"}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px;color:#666;">Price:</td><td style="padding:8px;">EGP ${product.price}</td></tr>
          <tr><td style="padding:8px;color:#666;">Current Stock:</td><td style="padding:8px;color:#DC2626;font-weight:bold;">${product.stock}</td></tr>
        </table>
      </div>
      <div style="background:#F5ECDC;padding:16px;text-align:center;color:#666;font-size:12px;">
        Bahar Premium Store — baharstoree63@gmail.com
      </div>
    </div>
  `;
}
