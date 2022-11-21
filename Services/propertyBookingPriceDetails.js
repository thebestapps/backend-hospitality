const { policis } = require("../Models/CancellationPolicy/CancelPolicy");
const { getDatesBetweenDates } = require("./generalServices");

module.exports = function (
  property,
  checkInDate,
  checkOutDate,
  conversion = null,
  booking = null
) {
  let result = {};
  let bookingDates = getDatesBetweenDates(checkInDate, checkOutDate);
  const daysNumbers = [5, 6]; //friday and saturday
  let pricePerNight = 0;
  let totalPrice = 0;
  let eachNightPrice = [];

  //Calculate the no. of Nights between two dates, divide the time difference of both the dates by no. of milliseconds in a day
  let days = Math.abs(
    Math.round(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  if (daysNumbers.includes(new Date(checkInDate).getDay())) {
    pricePerNight = property.priceAccordingToWeekends.price;
  }

  //Prices if days are weekdays
  else {
    pricePerNight = property.priceAccordingToWeekDays.price;
  }

  //Check if date is in a range where price may be diffrent and change the price
  property.priceAccordingToDate.forEach((item) => {
    item.dates.forEach((date) => {
      let d = new Date(date);
      d.getTime() === new Date().getTime()
        ? (pricePerNight = item.price)
        : (pricePerNight = pricePerNight);
    });
  });

  bookingDates.forEach((day) => {
    let found = [];
    if (daysNumbers.includes(new Date(day).getDay())) {
      totalPrice += property.priceAccordingToWeekends.price;
      priceperNight = property.priceAccordingToWeekends.price;
      found.push({ day: day, rate: property.priceAccordingToWeekends.price });
    } else {
      totalPrice += property.priceAccordingToWeekDays.price;
      priceperNight = property.priceAccordingToWeekDays.price;
      found.push({ day: day, rate: property.priceAccordingToWeekDays.price });
    }

    property.priceAccordingToDate.forEach((item) => {
      item.dates.forEach((date) => {
        let itemDay = new Date(date);
        console.log("dddd", date);
        if (itemDay.getTime() === new Date(day).getTime()) {
          let sameDay = found.find(
            (d) => new Date(d.day).getTime() === new Date(date).getTime()
          );

          console.log(sameDay);

          if (sameDay) {
            totalPrice -= sameDay.rate;
            priceperNight = item.price;
            totalPrice += item.price;
          } else {
            priceperNight = item.price;
            totalPrice += item.price;
          }
        }
      });
    });

    eachNightPrice.push({ day: day, pricePerNight: priceperNight });
  });

  !conversion
    ? (pricePerNight = pricePerNight)
    : (pricePerNight = pricePerNight * conversion.rate);

  !conversion
    ? (totalPrice = totalPrice)
    : (totalPrice = totalPrice * conversion.rate);

  //price details
  let discount = 0;

  //set discount if booking is seven days or for month
  let discountType = null; //week or month
  if (days >= 7) {
    discount = property.weeklyDiscount;
    discountType = "week";
  }
  if (days >= 30) {
    discount = property.monthlyDiscount;
    discountType = "month";
  }

  if (property.sale.onSale) {
    discount += property.sale.salePercent;
  }

  // let priceForNumberOfNights = days * pricePerNight;
  let priceForNumberOfNights =
    totalPrice -
    (!conversion
      ? eachNightPrice[eachNightPrice.length - 1].pricePerNight
      : eachNightPrice[eachNightPrice.length - 1].pricePerNight *
        conversion.rate);
  let cleanFeas = !conversion
    ? property.price.cleanFeas
    : property.price.cleanFeas * conversion.rate;
  let discountAmount = priceForNumberOfNights * discount;
  //totalPrice = priceForNumberOfNights + cleanFeas - discountAmount;
  totalPrice =
    totalPrice +
    cleanFeas -
    (discountAmount +
      (!conversion
        ? eachNightPrice[eachNightPrice.length - 1].pricePerNight
        : eachNightPrice[eachNightPrice.length - 1].pricePerNight *
          conversion.rate));

  let bookingDetails = {
    dates: { checkInDate: checkInDate, checkOutDate: checkOutDate },
    numberOfGuests: {
      minimum: property.numberOfGuests.minimum,
      maximum: property.numberOfGuests.maximum,
    },
    priceDetails: {
      pricePerNight: pricePerNight,
      numberOfNights: days,
      priceForNumberOfNights: priceForNumberOfNights,
      cleanFeas: cleanFeas,
      discount: discountAmount.toFixed(2),
      discountType,
      eachNightPrice: !conversion
        ? eachNightPrice
        : eachNightPrice.map((ele) => {
            return {
              day: ele.day,
              pricePerNight: ele.pricePerNight * conversion.rate,
            };
          }),
      totalPrice: totalPrice,
      refundAmount: 0,
      extraCharge: 0,
      totalPriceAfterEdit: 0,
      currency: !conversion ? property.price.currency : conversion.to,
    },
    cancelationPolicy: policis.find((item) =>
      item._id.equals(property.cancelationPolicy)
    ),
  };

  //add booking id to exclude current booking from search in edit booking
  if (booking) {
    let bookingPrice = !conversion
      ? booking.totalPrice
      : booking.totalPrice * conversion.rate;

    //Pricing differnce
    //Do refund
    if (bookingDetails.priceDetails.totalPrice < bookingPrice) {
      let calcAmount = 0;

      let policy = policis.find((item) =>
        item._id.equals(property.cancelationPolicy)
      );

      if (!policy)
        return res
          .status(404)
          .send({ policy: null, message: messages.en.noRecords });

      let cancelationDate = new Date();
      let checkInDate = new Date(booking.checkInDate);
      let timmDiff = checkInDate.getTime() - cancelationDate.getTime();
      let numOfDaysBeforeCancelation = Math.round(
        timmDiff / (1000 * 60 * 60 * 24)
      );

      if (numOfDaysBeforeCancelation >= policy.numberOfDays) {
        calcAmount = !conversion
          ? booking.totalPrice - bookingDetails.priceDetails.totalPrice
          : conversion.rate * booking.totalPrice -
            bookingDetails.priceDetails.totalPrice;

        bookingDetails.priceDetails.refundAmount =
          policy.refundAmountPercent * calcAmount;

        bookingDetails.priceDetails.totalPriceAfterEdit =
          bookingDetails.priceDetails.totalPrice;
      } else {
        bookingDetails.priceDetails.refundAmount =
          policy.refundAmountPercent * calcAmount;

        bookingDetails.priceDetails.totalPriceAfterEdit =
          bookingDetails.priceDetails.totalPrice;
      }
    }

    //Charge for the extra nights
    if (bookingDetails.priceDetails.totalPrice > bookingPrice) {
      let extraChargeAmount = !conversion
        ? bookingDetails.priceDetails.totalPrice - booking.totalPrice
        : bookingDetails.priceDetails.totalPrice -
          booking.totalPrice * conversion.rate;

      bookingDetails.priceDetails.extraCharge = extraChargeAmount;

      bookingDetails.priceDetails.totalPriceAfterEdit =
        bookingDetails.priceDetails.totalPrice;
    }

    //No charges
    if (bookingDetails.priceDetails.totalPrice === bookingPrice)
      bookingDetails = bookingDetails;
  }

  result = { bookingDetails: bookingDetails };

  return result;
};
