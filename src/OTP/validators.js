const nameValidator = {
    validator: function (value) {
      return /^[A-Za-z\s]+$/.test(value);
    },
    message: 'Name must only contain uppercase and lowercase alphabets along with spaces.',
  };
  
  const passwordValidator = {
    validator: function (value) {
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(value);
    },
    message: "Password must have at least one lowercase letter, one uppercase letter, and one digit.",
  };

  module.exports = {
    nameValidator,
    passwordValidator,
  };