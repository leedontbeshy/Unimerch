const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendResetPasswordEmail = async (email, resetToken) => {
    try {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        
        const { data, error } = await resend.emails.send({
            from: 'UniMerch <noreply@unimerch.space>', // Dùng domain mặc định của Resend
            to: [email],
            subject: 'Reset mật khẩu - UniMerch',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #333; margin-bottom: 10px;">UniMerch</h1>
                        <h2 style="color: #666; font-weight: normal;">Reset mật khẩu</h2>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="margin: 0; color: #333;">Xin chào,</p>
                        <p style="color: #333;">Bạn đã yêu cầu reset mật khẩu cho tài khoản UniMerch của mình.</p>
                        <p style="color: #333;">Click vào nút bên dưới để tạo mật khẩu mới:</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                            Reset Mật Khẩu
                        </a>
                    </div>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                        <p style="margin: 0; color: #856404;">
                            <strong>⚠️ Lưu ý quan trọng:</strong><br>
                            • Link này chỉ có hiệu lực trong <strong>15 phút</strong><br>
                            • Chỉ sử dụng được 1 lần<br>
                            • Không chia sẻ link này với ai khác
                        </p>
                    </div>
                    
                    <div style="border-top: 1px solid #eee; padding-top: 20px; color: #666; font-size: 14px;">
                        <p>Nếu bạn không yêu cầu reset mật khẩu, vui lòng bỏ qua email này.</p>
                        <p>Nếu nút không hoạt động, copy và paste link sau vào trình duyệt:</p>
                        <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">
                            ${resetUrl}
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
                        <p>© 2024 UniMerch. All rights reserved.</p>
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('Resend error:', error);
            throw new Error('Failed to send email');
        }

        console.log('Email sent successfully:', data);
        return data;
    } catch (error) {
        console.error('Email sending error:', error);
        throw error;
    }
};

module.exports = {
    sendResetPasswordEmail
};
