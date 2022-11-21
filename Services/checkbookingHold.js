//To check if paylater booking is expierd or not
const mongoose = require("mongoose");
const _ = require("lodash");
const PropertyBooking = require("../Models/PropertyBooking/PropertyBooking");
const HoldEvent = require("../Models/Calendar/HoldEvent");
const Property = require("../Models/Property/Property");
const { task } = require("../dbConnection");
const { getDatesBetweenDates } = require("../Services/generalServices");

module.exports = {
  checkIfNoPayementBookingExpierd: async () => {
    let bookings = await PropertyBooking.find({
      isConfirmed: false,
      paymentType: "paylater",
    })
      .where("holdBookingStartDate")
      .ne(null);

    if (bookings.length === 0) console.log("No Pending payment Booking");
    else {
      bookings.forEach(async (element) => {
        //Get number of hours between today and hold booking start date
        let startDate = element.holdBookingStartDate;
        let hours =
          Math.abs(new Date().getTime() - new Date(startDate).getTime()) / 36e5;
        console.log(hours);

        //Send notification when 24 hours has passed since booking with no payment
        if (hours >= 24 && hours < 48) {
          //TODO Send notification
          console.log("half way expierd");
        }

        //delete booking when 48 hours has passed since booking with no payment
        if (hours >= 48) {
          let booking = await PropertyBooking.findOne({
            _id: mongoose.Types.ObjectId(element._id),
          });

          let holdDates = await HoldEvent.findOne({
            stay: mongoose.Types.ObjectId(booking.property),
            stayBooking: element._id,
          });

          //TODO send notification that booking has been deleted

          //remove booked dates from hold and delete booking
          task.remove(booking);
          task.remove(holdDates);
          task.run();

          console.log("expierd delete booking");
        }
      });
    }
  },
};
