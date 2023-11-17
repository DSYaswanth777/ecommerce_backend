function generateOrderID() {
    const currentDate = new Date();
    const formattedDate = currentDate
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");
    const uniqueChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let uniqueString = "";
  
    // Generate a 4-character random string
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * uniqueChars.length);
      uniqueString += uniqueChars[randomIndex];
    }
    return `ODID${formattedDate}${uniqueString}`;
  }

  module.exports={
    generateOrderID
  }