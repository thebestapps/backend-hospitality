const mongoose = require("mongoose");
const { task } = require("../dbConnection");
const PropertyBooking = require("../Models/PropertyBooking/PropertyBooking");
const Notification = require("../Models/Notifications/Notification");
const { sendNotification } = require("../Services/generalServices");

module.exports = {
  sendCheckInReminderNotification: async () => {
    let propertyBooking = await PropertyBooking.find({
      isCancelled: false,
    })
      .populate("user", "_id fcmToken")
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
          let notificationData = {
            user: [item.user._id],
            title: "Checkin Reminder",
            body: `Your Booking in ${item.property.name} is tomorrow at ${item.property.checkInTime}`,
            type: 1,
            property: item.property._id,
            listingKey: {
              key: "property",
              id: item.property._id,
            },
          };

          let reminder = new Notification(notificationData);

          await reminder.save();
          await sendNotification(
            [item.user.fcmToken],
            notificationData.title,
            notificationData.body,
            notificationData.listingKey.key,
            notificationData.listingKey.id
          );
        }
      });
    }
  },

  sendCheckOutReminderNotification: async () => {
    let propertyBooking = await PropertyBooking.find({
      isCancelled: false,
    })
      .populate("user", "_id fcmToken")
      .populate("property");

    if (propertyBooking.length === 0) console.log("No bookings");
    else {
      propertyBooking.forEach(async (item) => {
        let checkOutDate = new Date(
          new Date(item.checkOutDate).setHours(12, 0, 0, 0)
        );

        let chekoutReminderhours =
          Math.abs(new Date().getTime() - new Date(checkOutDate).getTime()) /
          36e5;

        console.log(checkOutDate);
        console.log(chekoutReminderhours);

        if (chekoutReminderhours <= 3 && chekoutReminderhours > 0) {
          let notificationData = {
            user: [item.user._id],
            title: "Checkout Reminder",
            body: `Your Booking in ${item.property.name} is done today at ${item.property.checkOutTime}`,
            type: 1,
            property: item.property._id,
            listingKey: {
              key: "property",
              id: item.property._id,
            },
          };

          let reminder = new Notification(notificationData);

          await reminder.save();
          await sendNotification(
            [item.user.fcmToken],
            notificationData.title,
            notificationData.body,
            notificationData.listingKey.key,
            notificationData.listingKey.id
          );
        }
      });
    }
  },
};
