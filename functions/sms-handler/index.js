import africastalking from "africastalking";

// Initialize Africa's Talking once
const initSMS = () => {
  return africastalking({
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME,
  }).SMS;
};

// Main function handler
export default async ({ req, res, log, error }) => {
  log("SMS function called via HTTP request");

  // Handle CORS for browser requests
  res.setHeaders({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.json({ success: true });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.json(
      {
        success: false,
        error: "Only POST method is allowed",
      },
      405
    );
  }

  try {
    // Parse the incoming JSON
    let body;
    try {
      body = req.body ? JSON.parse(req.body) : {};
    } catch (e) {
      return res.json(
        {
          success: false,
          error: "Invalid JSON format",
        },
        400
      );
    }

    const { phone, message } = body;

    // Validate required fields
    if (!phone || !message) {
      return res.json(
        {
          success: false,
          error: "Missing phone or message",
        },
        400
      );
    }

    // Initialize SMS client
    const sms = initSMS();

    // Send SMS
    const result = await sms.send({
      to: [phone],
      message: message,
    });

    log(`SMS sent to ${phone}: ${result}`);

    return res.json({
      success: true,
      messageId: result?.SMSMessageData?.Recipients?.[0]?.messageId,
      status: result?.SMSMessageData?.Recipients?.[0]?.status,
      cost: result?.SMSMessageData?.Recipients?.[0]?.cost,
    });
  } catch (err) {
    error(`SMS sending failed: ${err.message}`);
    return res.json(
      {
        success: false,
        error: err.message || "Failed to send SMS",
      },
      500
    );
  }
};
