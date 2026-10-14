import { NextRequest, NextResponse } from "next/server";
import { rateLimiters, withRateLimit } from "@/lib/rateLimiter";
import { sendEmail } from "@/lib/email";

export const POST = withRateLimit(rateLimiters.api, async (request: NextRequest) => {
  try {
    let firstName = "";
    let lastName = "";
    let email = "";
    let phone = "";
    let subject = "";
    let message = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      firstName = body.firstName || "";
      lastName = body.lastName || "";
      email = body.email || "";
      phone = body.phone || "";
      subject = body.subject || "";
      message = body.message || "";
    } else {
      const formData = await request.formData();
      firstName = (formData.get("firstName") as string) || "";
      lastName = (formData.get("lastName") as string) || "";
      email = (formData.get("email") as string) || "";
      phone = (formData.get("phone") as string) || "";
      subject = (formData.get("subject") as string) || "";
      message = (formData.get("message") as string) || "";
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!message.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter your message." },
        { status: 400 }
      );
    }

    const fullName = `${firstName} ${lastName}`.trim() || "Customer";

    console.log(`[Contact Form] Submission from ${fullName} <${trimmedEmail}>: ${subject || 'No subject'}`);

    // Dispatch notification email
    try {
      await sendEmail({
        to: process.env.SUPPORT_EMAIL || 'support@sheeshatonight.com',
        subject: `[New Contact Inquiry] ${subject || 'Website Message'} - from ${fullName}`,
        text: `Name: ${fullName}\nEmail: ${trimmedEmail}\nPhone: ${phone}\nSubject: ${subject}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family:sans-serif;padding:20px;color:#333;">
            <h2 style="color:#74189B;">New Contact Inquiry Received</h2>
            <p><strong>Customer:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${trimmedEmail}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
            <p><strong>Message:</strong></p>
            <div style="background:#f9f9f9;padding:15px;border-radius:8px;white-space:pre-wrap;">${message}</div>
          </div>
        `,
      });
    } catch (mailErr) {
      console.warn('[Contact Form] Notification email dispatch notice:', mailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for contacting SheeshaTonight. Your inquiry has been received and our team will get back to you shortly.",
    });
  } catch (error) {
    console.error("Error handling contact submission:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
});
