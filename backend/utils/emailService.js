// Email service for sending verification and password reset emails
// Uses nodemailer to send emails through SMTP

const nodemailer = require('nodemailer');

// Create email transporter using Gmail SMTP
// This connects to Gmail servers for sending emails
function createEmailTransporter() {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        return transporter;
    } catch (error) {
        console.log('Error creating email transporter:', error.message);
        throw new Error('Email service setup failed');
    }
}

// Send email verification email to new user
// Takes user email and verification token
async function sendVerificationEmail(email, verificationToken) {
    try {
        const transporter = createEmailTransporter();
        
        // Create verification link
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
        
        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email - Trybee',
            html: `
                <h2>Welcome to Trybee!</h2>
                <p>Please click the link below to verify your email address:</p>
                <a href="${verificationUrl}">Verify Email</a>
                <p>This link will expire in 24 hours.</p>
                <p>If you did not create an account, please ignore this email.</p>
            `
        };
        
        // Send email
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);
        
    } catch (error) {
        console.log('Error sending verification email:', error.message);
        throw new Error('Failed to send verification email');
    }
}

// Send password reset email to user
// Takes user email and reset token
async function sendPasswordResetEmail(email, resetToken) {
    try {
        const transporter = createEmailTransporter();
        
        // Create password reset link
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        
        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset - Trybee',
            html: `
                <h2>Password Reset Request</h2>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request this, please ignore this email.</p>
            `
        };
        
        // Send email
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent to:', email);
        
    } catch (error) {
        console.log('Error sending password reset email:', error.message);
        throw new Error('Failed to send password reset email');
    }
}

// Export functions for use in controllers
module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};
