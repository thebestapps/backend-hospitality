const mongoose = require("mongoose");
const { task } = require("../dbConnection");
const PropertyBooking = require("../Models/PropertyBooking/PropertyBooking");
const Details = require("../Models/propertyDetails/Details");
const Notification = require("../Models/Notifications/Notification");
const { sendByMailGun } = require("../Services/generalServices");
const CONF = require("../constants");
const Guests = require("../Models/BookingsGuests/Guests");
const {
  sendBookingGuide,
  sendCmpleteInfoReminder,
  CheckOutEmail,
} = require("./Emails");

module.exports = {
  sendCheckInDetails: async () => {
    let propertyBooking = await PropertyBooking.find({
      isCancelled: false,
    })
      .populate("user")
      .populate("property");

    if (propertyBooking.length === 0) console.log("No bookings");
    else {
      propertyBooking.forEach(async (item) => {
        //Get tomorrows date to check if it's booking date
        let d = new Date().setHours(0, 0, 0, 0);
        let today = new Date(d);
        let tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (new Date(item.checkInDate).getTime() === tomorrow.getTime()) {
          let details = await Details.findOne({
            property: item.property._id,
          });

          if (!details) console.log("No details");
          else {
            sendByMailGun(
              item.user.email,
              `${item.property.name}`,
              "Booking",
              null,
              sendBookingGuide(item, details)
            );
          }
        }
      });
    }
  },

  sendCheckOutEmail: async () => {
    let propertyBooking = await PropertyBooking.find({
      isCancelled: false,
    })
      .populate("user")
      .populate("property");

    if (propertyBooking.length === 0) console.log("No bookings");
    else {
      propertyBooking.forEach((item) => {
        let checkOutDate = new Date(
          new Date(item.checkOutDate).setHours(12, 0, 0, 0)
        );

        let chekoutReminderhours =
          Math.abs(new Date().getTime() - new Date(checkOutDate).getTime()) /
          36e5;

        console.log(checkOutDate);
        console.log(chekoutReminderhours);

        if (chekoutReminderhours <= 3 && chekoutReminderhours > 0) {
          sendByMailGun(
            item.user.email,
            `Thank You for staying with us`,
            "booking",
            null,
            CheckOutEmail(item)
          );
        }
      });
    }
  },

  sendCompleteInfoEmailReminder: async () => {
    let propertyBooking = await PropertyBooking.find({
      isConfirmed: true,
      isCancelled: false,
    })
      .populate("user")
      .populate("property");

    if (propertyBooking.length === 0) console.log("No bookings");
    else {
      propertyBooking.forEach(async (item) => {
        let d = new Date().setHours(0, 0, 0, 0);
        let today = new Date(d);
        let tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (new Date(item.checkInDate).getTime() === tomorrow.getTime()) {
          let guestsInfo = await Guests.find({
            stayBooking: item._id,
          });

          if (guestsInfo.length === 0)
            sendByMailGun(
              item.user.email,
              "Booking info is not complete",
              "booking",
              null,
              sendCmpleteInfoReminder(item)
            );
        } else {
          console.log("no reminders");
        }
      });
    }
  },
};
