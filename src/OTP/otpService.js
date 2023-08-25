const axios = require('axios');

// const API_KEY = 'YOUR_FAST2SMS_API_KEY';

async function sendOtp(mobile, otp) {
  const message = `Your OTP for verification is ${otp}. Please do not share it with anyone.`;
  
  const payload = {
    sender_id: 'FSTSMS',
    message,
    language: 'english',
    route: 'p',
    numbers: mobile,
  };

  try {
    const response = await axios.post('https://www.fast2sms.com/dev/bulk', payload, {
      headers: {
        Authorization: process.env.FAST2SMS_API_KEY
      },
    });

    if (response.data && response.data.return) {
      console.log('OTP sent successfully');
      return true;
    } else {
      console.error('Failed to send OTP');
      return false;
    }
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    return false;
  }
}

module.exports = { sendOtp };
