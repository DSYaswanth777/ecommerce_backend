const axios = require("axios");

const OTP_REGENERATION_LIMIT = 3;
const apiKey = process.env.FAST2SMS_API_KEY; 

async function sendOtp(mobile, otpRegenerationCount = 0) {
  if (otpRegenerationCount >= OTP_REGENERATION_LIMIT) {
    throw new Error("OTP regeneration limit exceeded");
  }

  const otp = Math.floor(1000 + Math.random() * 9000);

  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "otp",
        variables_values: otp,
        numbers: mobile,
      },
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      }
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
