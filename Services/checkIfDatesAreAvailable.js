const { getDatesBetweenDates } = require("./generalServices");

module.exports = function (
  holdDates,
  bookings,
  property,
  checkInDate,
  checkOutDate
) {
  let result = { isAvailable: true };
  let blockedDates = [];
  let bookingDates = getDatesBetweenDates(checkInDate, checkOutDate);
  let isAvailable = true;

  if (holdDates.length !== 0) {
    if (checkInDate && checkOutDate) {
      holdDates.forEach((item) => {
        item.blockedDates.forEach((date) => {
          blockedDates.push(new Date(date));
        });
      });

      blockedDates.forEach((date) => {
        bookingDates.forEach((bdate) => {
          bdate.getTime() === date.getTime()
            ? (isAvailable = false)
            : (isAvailable = isAvailable);
        });
      });

      if (!isAvailable) {
        result = { isAvailable: true };

        return result;
      }

      console.log(bookings);
      let filterd = bookings;
      let filterDates = [];
      let checkInDateNotAvailable = false;
      let checkOutDateNotAvailable = false;

      bookings.forEach((item) => {
        new Date(item.checkInDate).getTime() ===
        new Date(checkOutDate).getTime()
          ? (checkOutDateNotAvailable = true)
          : checkOutDateNotAvailable;

        new Date(item.checkOutDate).getTime() ===
        new Date(checkInDate).getTime()
          ? (checkInDateNotAvailable = true)
          : checkInDateNotAvailable;
      });

      if (checkInDateNotAvailable) {
        filterDates = bookings.splice(
          bookings.findIndex(
            (item) =>
              new Date(item.checkOutDate).getTime() ===
              new Date(checkInDate).getTime()
          ),
          1
        );

        filter = filterDates;
      }

      if (checkOutDateNotAvailable) {
        filterDates = bookings.splice(
          bookings.findIndex(
            (item) =>
              new Date(item.checkInDate).getTime() ===
              new Date(checkOutDate).getTime()
          ),
          1
        );

        filter = filterDates;
      }

      console.log(filterd);
      console.log(checkInDateNotAvailable);
      console.log(checkOutDateNotAvailable);

      if (filterd.length > 0) {
        result = { isAvailable: false };
        return result;
      }
    }

    if (bookingDates.length - 1 < property.minNbOfNights) {
      result = {
        isAvailable: false,
        message: `Minimum Number of Nights is ${property.minNbOfNights}`,
      };
      return result;
    }

    if (bookingDates.length - 1 > property.maxNbOfNights) {
      result = {
        isAvailable: false,
        message: `Maximum Number of Nights is ${property.maxNbOfNights}`,
      };

      return result;
    } else {
      result = {
        isAvailable: true,
      };
    }

    return result;
  }
  return result;
};
