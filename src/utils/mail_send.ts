import nodemailer from "nodemailer";

export const sendOtpEmail = async (
  email: string,
  otp: number
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: "no-reply@volunflow.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP sent successfully!");
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
};

export const sendApprovalEmail = async (email: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_APP_PASSWORD,
    },
    // debug: true, // Enable debugging
    // logger: true
  });

  const mailOptions = {
    from: "no-reply@volunflow.com",
    to: email,
    subject: "Registration Approved",
    text: "Your registration has been approved. Welcome aboard!",
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending approval email:", error);
  }
};

export const sendNotificationEmail = async (email: string, notification: { title: string, desc: string }): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_APP_PASSWORD,
    },
    // debug: true, // Enable debugging
    // logger: true
  });

  const mailOptions = {
    from: "no-reply@volunflow.com",
    to: email,
    subject: notification.title,
    text: notification.desc,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending approval email:", error);
  }
};

export const sendContactUsEmail = async (
  name: string,
  email: string,
  contactNumber: string,
  message: string
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: "no-reply@volunflow.com",
    to: "volunflow@gmail.com",
    subject: `Contact Us Form Submission from ${name}`,
    text: `
      Name: ${name}
      Email: ${email}
      Phone Number: ${contactNumber}
      
      Message: 
      ${message}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Contact email sent successfully!");
  } catch (error) {
    console.error("Error sending contact email:", error);
  }
};
