/**
 * SheeshaTonight Email Dispatch Service
 * Handles transactional emails (order confirmations, vendor alerts, password resets)
 * with SMTP support and resilient fallback logging when SMTP is offline or not configured.
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  mode: 'smtp' | 'log_fallback';
  error?: string;
}

export function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@sheeshatonight.com',
    isConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
  };
}

/**
 * Send an email with automatic fallback if SMTP is unconfigured or fails
 */
export async function sendEmail(options: EmailOptions): Promise<EmailDeliveryResult> {
  const config = getSmtpConfig();
  const from = options.from || config.from;

  if (!config.isConfigured) {
    // Development / Staging fallback: Log to console cleanly
    console.log(`[EMAIL DISPATCH - SIMULATED] Mode: log_fallback`);
    console.log(`  To: ${options.to}`);
    console.log(`  From: ${from}`);
    console.log(`  Subject: ${options.subject}`);
    console.log(`  Preview: ${(options.text || options.html).slice(0, 160).replace(/\s+/g, ' ')}...`);
    return {
      success: true,
      messageId: `simulated-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      mode: 'log_fallback',
    };
  }

  try {
    // If SMTP credentials are configured, connect via secure socket
    const net = await import('net');
    const tls = await import('tls');

    return await new Promise<EmailDeliveryResult>((resolve) => {
      const socket = net.createConnection(config.port, config.host, () => {
        let step = 0;
        let response = '';

        socket.on('data', (chunk) => {
          response += chunk.toString();
          // Basic SMTP handshake handling
          if (step === 0 && response.includes('220')) {
            step++;
            socket.write(`EHLO sheeshatonight.com\r\n`);
          } else if (step === 1 && response.includes('250')) {
            step++;
            socket.write(`STARTTLS\r\n`);
          } else if (step === 2 && response.includes('220')) {
            // Upgrade to TLS
            step++;
            const tlsSocket = tls.connect({
              socket,
              host: config.host,
            }, () => {
              tlsSocket.write(`EHLO sheeshatonight.com\r\n`);
            });

            tlsSocket.on('data', (tlsChunk) => {
              const tlsRes = tlsChunk.toString();
              if (tlsRes.includes('250')) {
                const authPlain = Buffer.from(`\0${config.user}\0${config.pass}`).toString('base64');
                tlsSocket.write(`AUTH PLAIN ${authPlain}\r\n`);
              } else if (tlsRes.includes('235')) {
                tlsSocket.write(`MAIL FROM:<${from}>\r\n`);
              } else if (tlsRes.includes('250') && tlsRes.includes('Sender ok')) {
                tlsSocket.write(`RCPT TO:<${options.to}>\r\n`);
              } else if (tlsRes.includes('250') && tlsRes.includes('Recipient ok')) {
                tlsSocket.write(`DATA\r\n`);
              } else if (tlsRes.includes('354')) {
                const mailBody = [
                  `From: SheeshaTonight <${from}>`,
                  `To: <${options.to}>`,
                  `Subject: ${options.subject}`,
                  `MIME-Version: 1.0`,
                  `Content-Type: text/html; charset=UTF-8`,
                  ``,
                  options.html,
                  `\r\n.\r\n`
                ].join('\r\n');
                tlsSocket.write(mailBody);
              } else if (tlsRes.includes('250') && tlsRes.includes('queued')) {
                tlsSocket.end();
                resolve({
                  success: true,
                  messageId: `smtp-${Date.now()}`,
                  mode: 'smtp',
                });
              }
            });

            tlsSocket.on('error', (err) => {
              console.warn('[EMAIL TLS ERROR]', err.message);
              resolve({
                success: false,
                mode: 'smtp',
                error: err.message,
              });
            });
          }
        });

        socket.on('error', (err) => {
          console.warn('[EMAIL SOCKET ERROR]', err.message);
          resolve({
            success: false,
            mode: 'smtp',
            error: err.message,
          });
        });

        // 10 second timeout for SMTP delivery
        setTimeout(() => {
          socket.destroy();
          resolve({
            success: false,
            mode: 'smtp',
            error: 'SMTP Connection timeout (10s)',
          });
        }, 10000);
      });
    });
  } catch (err: any) {
    console.error('[EMAIL ERROR]', err);
    return {
      success: false,
      mode: 'smtp',
      error: err.message || 'Unknown SMTP error',
    };
  }
}

/**
 * Luxury branded order confirmation email for customer
 */
export async function sendOrderConfirmationEmail(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  totalAmount: number | string;
  currency?: string;
  vendorName: string;
}) {
  const currency = params.currency || 'AED';
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #f0e6f0;">
      <div style="background: linear-gradient(135deg, #55083e 0%, #350527 100%); padding: 32px 24px; text-align: center;">
        <h1 style="color: #D4AF37; margin: 0; font-size: 26px; letter-spacing: 1px;">SHEESHATONIGHT</h1>
        <p style="color: #ffffff; margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Premium Luxury Sheesha Experience</p>
      </div>
      <div style="padding: 32px 24px; color: #29252B;">
        <h2 style="color: #55083e; margin-top: 0;">Order Confirmed!</h2>
        <p>Dear <strong>${params.customerName}</strong>,</p>
        <p>Thank you for choosing SheeshaTonight. Your order has been placed with <strong>${params.vendorName}</strong>.</p>
        
        <div style="background: #fbf7fb; border-left: 4px solid #D4AF37; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #6b646e;">Order Reference</p>
          <p style="margin: 4px 0 0; font-size: 20px; font-weight: bold; color: #55083e;">#${params.orderNumber}</p>
          <p style="margin: 12px 0 0; font-size: 14px; color: #6b646e;">Total Amount</p>
          <p style="margin: 4px 0 0; font-size: 22px; font-weight: bold; color: #D4AF37;">${currency} ${params.totalAmount}</p>
        </div>

        <p style="font-size: 14px; color: #6b646e; line-height: 1.6;">
          Our concierge team and vendor are preparing your setup. You can track this order in your customer dashboard at any time.
        </p>

        <div style="text-align: center; margin: 32px 0 16px;">
          <a href="https://sheeshatonight.com/dashboard/orders" style="background: #55083e; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            View Order Status
          </a>
        </div>
      </div>
      <div style="background: #f7f2f7; padding: 16px 24px; text-align: center; font-size: 12px; color: #8a828d;">
        &copy; ${new Date().getFullYear()} SheeshaTonight. All rights reserved. Dubai & United Arab Emirates.
      </div>
    </div>
  `;

  return sendEmail({
    to: params.to,
    subject: `Order Confirmed: #${params.orderNumber} - SheeshaTonight`,
    html,
    text: `Order Confirmed: #${params.orderNumber}. Total: ${currency} ${params.totalAmount} from ${params.vendorName}. View details on SheeshaTonight.`,
  });
}
