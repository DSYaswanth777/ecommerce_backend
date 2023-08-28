const axios = require("axios");

const OTP_REGENERATION_LIMIT = 3;

async function sendOtp(mobile, otpRegenerationCount) {
  if (otpRegenerationCount >= OTP_REGENERATION_LIMIT) {
    throw new Error("OTP regeneration limit exceeded");
  }
  const otp = Math.floor(1000 + Math.random() * 9000);
  try {
    const response = await axios.get(
      `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&route=q&message=Your OTP code is ${otp}&language=english&flash=0&numbers=${mobile}`
    );
    if (response.data.return) {
      return otp;
    } else {
      throw new Error("Failed to send OTP");
    }
  } catch (error) {
    throw error;
  }
}

module.exports = sendOtp;
