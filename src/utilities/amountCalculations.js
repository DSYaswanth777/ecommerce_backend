function calculateTotalAmount(user) {
  let totalFee = 0;
  let actualPrice = 0;
let couponDiscount =0;
  user.cart.forEach((cartItem) => {
    const product = cartItem.product;
    if (product) {
      const itemTotal = product.productPrice * cartItem.quantity;
      actualPrice += itemTotal;
      totalFee += itemTotal;
    }
  });

  if (user.appliedCoupon && user.appliedCoupon.discountAmount > 0) {
    couponDiscount= user.appliedCoupon.discountAmount
    totalFee -= user.appliedCoupon.discountAmount;
    totalFee = Math.max(totalFee, 0);
  }

  let totalDeliveryFee = calculateDeliveryFee(user.cart);

  totalFee += totalDeliveryFee;

  return {actualPrice,couponDiscount, totalFee, totalDeliveryFee, totalAmount: totalFee };
}
function calculateDeliveryFee(cart) {
  let itemsInCart = 0;

  cart.forEach((cartItem) => {
    itemsInCart += cartItem.quantity;
  });

  let totalDeliveryFee = Math.floor(itemsInCart / 2) * 50;

  if (itemsInCart % 2 !== 0) {
    totalDeliveryFee += 50;
  }

  return totalDeliveryFee;
}

module.exports = {
  calculateTotalAmount,
  calculateDeliveryFee,
};
