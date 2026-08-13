import nodemailer from 'nodemailer';
const smtpHost = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || 'noreply@eventpass.com';
let transporter = null;
if (smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for others
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    });
    console.log(`Nodemailer transport configured using Brevo SMTP at ${smtpHost}:${smtpPort}`);
}
else {
    console.warn('WARNING: SMTP_USER or SMTP_PASS environment variables are not set. Nodemailer will run in MOCK mode (printing passes to console).');
}
/**
 * Sends the signed access pass token to the participant's email.
 */
export async function sendEmailPass(email, name, token) {
    const subject = `Singularity '26 Access Pass - ${name}`;
    const textBody = `Hi ${name},\n\nYour on-site check-in was successful!\n\nHere is your secure cryptographic QR access token:\n\n${token}\n\nPresent this code at food counters to claim items.\n\nEnjoy the event!`;
    const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px; color: #1F2937;">
      <h2 style="color: #4F46E5; margin-bottom: 16px; text-align: center;">Event Access Pass</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your check-in has been recorded successfully. Present the QR code below at the food counters to claim your items.</p>
      
      <div style="text-align: center; margin: 28px 0;">
        <div style="border: 4px solid #FACC15; border-radius: 16px; background: #FFFFFF; display: inline-block; padding: 16px 20px 20px 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); text-align: center;">
          <div style="font-family: sans-serif; font-size: 14px; font-weight: 800; color: #1F2937; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 12px; border-bottom: 2px solid #FACC15; padding-bottom: 6px;">
            Singularity '26
          </div>
          <img src="cid:qrcode" alt="Event Access QR Pass" style="width: 220px; height: 220px; display: block;" />
        </div>
      </div>
 
      <div style="background-color: #F9FAFB; padding: 12px; border-radius: 6px; font-family: monospace; word-break: break-all; margin: 16px 0; border: 1px dashed #E5E7EB; font-size: 11px; color: #6B7280; text-align: center;">
        <strong>Token ID:</strong> ${token.substring(0, 16)}...
      </div>
      
      <p style="font-size: 13px; color: #4B5563; line-height: 1.5;">This entry code is cryptographic, unique, and digitally signed. It will be verified offline at the gates.</p>
      
      <div style="margin-top: 32px; border-top: 1px solid #E5E7EB; padding-top: 16px; font-size: 11px; color: #9CA3AF; text-align: center; line-height: 1.6;">
        <p style="margin: 0;">This is an automated system message. Please do not reply to this email.</p>
        <p style="margin: 4px 0 0 0; font-family: monospace; font-size: 10px; color: #9CA3AF;">
          Ref: ${token.substring(token.length - 12).toUpperCase()} | Generated: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Kolkata' })}
        </p>
      </div>
    </div>
  `;
    if (transporter) {
        try {
            const attachments = [];
            // Fetch and build binary inline attachment for the QR code image
            try {
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(token)}`;
                const qrRes = await fetch(qrUrl);
                if (qrRes.ok) {
                    const qrBuffer = Buffer.from(await qrRes.arrayBuffer());
                    attachments.push({
                        filename: 'qrcode.png',
                        content: qrBuffer,
                        cid: 'qrcode'
                    });
                }
            }
            catch (qrErr) {
                console.error('Failed to fetch/generate QR pass inline attachment:', qrErr);
            }
            await transporter.sendMail({
                from: `"${process.env.SMTP_FROM_NAME || 'Event Pass Tracker'}" <${smtpFrom}>`,
                to: email,
                subject: subject,
                text: textBody,
                html: htmlBody,
                attachments: attachments,
            });
            console.log(`Cryptographic QR code email pass successfully sent to ${email}`);
            return true;
        }
        catch (err) {
            console.error(`SMTP transmission failed for ${email}:`, err);
            return false;
        }
    }
    else {
        console.log('\n--- [MOCK EMAIL DISPATCH] ---');
        console.log(`To: ${email}`);
        console.log(`Subject: ${subject}`);
        console.log(`Token: ${token}`);
        console.log('------------------------------\n');
        return true;
    }
}
