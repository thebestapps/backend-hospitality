const PropertyBooking = require("../PropertyBooking/PropertyBooking");
const messages = require("../../messages.json");
const { getDatesBetweenDates } = require("../../Services/generalServices");
const excelJS = require("exceljs");
const CONF = require("../../constants");

async function getMonthlyRevenu(req, res) {
  let { year, property } = req.query;

  if (!year || year === "") year = new Date().getFullYear();

  let search = {};

  let response = [
    {
      month: 1,
      year: parseInt(year),
      totalRevenue: 0,
    },
    {
      month: 2,
      year: parseInt(year),
      totalRevenue: 0,
    },
    {
      month: 3,
      year: parseInt(year),
      totalRevenue: 0,
    },
    {
      month: 4,
      year: parseInt(year),
      totalRevenue: 0,
    },
    {
      month: 5,
      year: parseInt(year),
      totalRevenue: 0,
    },
    {
      month: 6,
      year: parseInt(year),
      totalRevenue: 0,
    },
    {
      month: 7,
      year: parseInt(year),
      totalRevenue: 0,
    },
    {
      month: 8,
      year: parseInt(year),
      totalRevenue: 0,
    },
    {
      month: 9,
      year: parseInt(year),
      totalRevenue: 0,
    },
    {
      month: 10,
      year: parseInt(year),
      totalRevenue: 0,
    },
    {
      month: 11,
      year: parseInt(year),
      totalRevenue: 0,
    },
    {
      month: 12,
      year: parseInt(year),
      totalRevenue: 0,
    },
  ];

  if (property) search.property = property;

  let bookings = await PropertyBooking.find(search)
    .where("confirmationCode")
    .ne(null)
    .populate("property");

  //get all bookings
  bookings.forEach((booking) => {
    if (booking.isPaid) {
      //get month
      let month = response.find(
        (ele) =>
          ele.month === new Date(booking.checkInDate).getMonth() + 1 &&
          parseInt(new Date(booking.checkInDate).getFullYear()) ===
            parseInt(year)
      );

      let nextMonth = response.find(
        (ele) =>
          ele.month === new Date(booking.checkOutDate).getMonth() + 1 &&
          parseInt(new Date(booking.checkOutDate).getFullYear()) ===
            parseInt(year)
      );

      if (!nextMonth) {
        //Booking is on two month devide the amount on both
        amount = booking.totalPrice;
        response = response.filter((ele) => ele.month !== month.month);

        month.totalRevenue += amount / 2;

        response.push(month);

        response = response.filter((ele) => ele.month !== nextMonth.month);

        nextMonth.totalRevenue += amount / 2;

        response.push(nextMonth);
      } else {
        response = response.filter((ele) => ele.month !== month.month);

        month.totalRevenue += booking.totalPrice;

        response.push(month);
      }
    }
  });

  response = response.sort((a, b) => a.month - b.month);
  console.log(req.url);

  if (req.url === "/monthly-revenu/downloadExcel") {
    const workbook = new excelJS.Workbook();

    const worksheet = workbook.addWorksheet("Monthly Revenu");

    const path = "./files";

    worksheet.columns = [
      { header: "M no.", key: "month", width: 10 },
      { header: "Year", key: "year", width: 10 },
      { header: "Total Revenue", key: "totalRevenue", width: 10 },
    ];

    let counter = 1;

    response.forEach((item) => {
      item.month = counter;

      worksheet.addRow(item);

      counter++;
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    try {
      const data = await workbook.xlsx.writeFile(`${path}/revenue.xlsx`);

      return res.status(200).send({
        status: "success",
        message: "file successfully downloaded",
        url: `${CONF.DOMAIN_PORT}files/revenue.xlsx`,
      });
    } catch (err) {
      return res.status(500).send({
        status: "error",
        message: messages.en.generalError,
      });
    }
  }

  return res
    .status(200)
    .send({ data: response, message: messages.en.getSuccess });
}

async function getMonthlyBookings(req, res) {
  let { year, property } = req.query;

  if (!year || year === "") year = new Date().getFullYear();

  let search = { isConfirmed: true, isCancelled: false };

  let response = [
    {
      month: 1,
      year: parseInt(year),
      totalBookings: 0,
    },
    {
      month: 2,
      year: parseInt(year),
      totalBookings: 0,
    },
    {
      month: 3,
      year: parseInt(year),
      totalBookings: 0,
    },
    {
      month: 4,
      year: parseInt(year),
      totalBookings: 0,
    },
    {
      month: 5,
      year: parseInt(year),
      totalBookings: 0,
    },
    {
      month: 6,
      year: parseInt(year),
      totalBookings: 0,
    },
    {
      month: 7,
      year: parseInt(year),
      totalBookings: 0,
    },
    {
      month: 8,
      year: parseInt(year),
      totalBookings: 0,
    },
    {
      month: 9,
      year: parseInt(year),
      totalBookings: 0,
    },
    {
      month: 10,
      year: parseInt(year),
      totalBookings: 0,
    },
    {
      month: 11,
      year: parseInt(year),
      totalBookings: 0,
    },
    {
      month: 12,
      year: parseInt(year),
      totalBookings: 0,
    },
  ];

  if (property) search.property = property;

  let bookings = await PropertyBooking.find(search)
    .where("confirmationCode")
    .ne(null)
    .populate("property")
    .sort("checkInDate");

  //get all bookings
  bookings.forEach((booking) => {
    if (!booking.property.deleted) {
      let month = response.find(
        (ele) =>
          ele.month === new Date(booking.checkInDate).getMonth() + 1 &&
          parseInt(new Date(booking.checkInDate).getFullYear()) ===
            parseInt(year)
      );

      let nextMonth = response.find(
        (ele) =>
          ele.month === new Date(booking.checkOutDate).getMonth() + 1 &&
          parseInt(new Date(booking.checkOutDate).getFullYear()) ===
            parseInt(year)
      );

      if (month) {
        response = response.filter((ele) => ele.month !== month.month);

        month.totalBookings++;

        response.push(month);
      }

      if (nextMonth) {
        if (nextMonth.month !== month.month) {
          response = response.filter((ele) => ele.month !== nextMonth.month);

          nextMonth.totalBookings++;

          response.push(nextMonth);
        }
      }
    }
  });

  response = response.sort((a, b) => a.month - b.month);

  if (req.url === "/monthly-bookings/downloadExcel") {
    const workbook = new excelJS.Workbook();

    const worksheet = workbook.addWorksheet("Total Bookings");

    const path = "./files";

    worksheet.columns = [
      { header: "M no.", key: "month", width: 10 },
      { header: "Year", key: "year", width: 10 },
      { header: "Total Bookings", key: "totalBookings", width: 10 },
    ];

    let counter = 1;

    response.forEach((item) => {
      item.month = counter;

      worksheet.addRow(item);

      counter++;
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    try {
      const data = await workbook.xlsx.writeFile(`${path}/bookings.xlsx`);

      return res.status(200).send({
        status: "success",
        message: "file successfully downloaded",
        url: `${CONF.DOMAIN_PORT}files/bookings.xlsx`,
      });
    } catch (err) {
      return res.status(500).send({
        status: "error",
        message: messages.en.generalError,
      });
    }
  }

  return res
    .status(200)
    .send({ data: response, message: messages.en.getSuccess });
}

async function getOccupancyRate(req, res) {
  let { year, property } = req.query;
  if (!year || year === "") year = new Date().getFullYear();

  let search = { isConfirmed: true, isCancelled: false };

  if (property) search.property = property;

  let allDates = [];

  let response = [
    {
      month: 1,
      year: parseInt(year),
      numberOfDays: 0,
      monthDays: new Date(year, 1, 0).getDate(),
      occupancyRate: 0,
    },
    {
      month: 2,
      year: parseInt(year),
      numberOfDays: 0,
      monthDays: new Date(year, 2, 0).getDate(),
      occupancyRate: 0,
    },
    {
      month: 3,
      year: parseInt(year),
      numberOfDays: 0,
      monthDays: new Date(year, 3, 0).getDate(),
      occupancyRate: 0,
    },
    {
      month: 4,
      year: parseInt(year),
      numberOfDays: 0,
      monthDays: new Date(year, 4, 0).getDate(),
      occupancyRate: 0,
    },
    {
      month: 5,
      year: parseInt(year),
      numberOfDays: 0,
      monthDays: new Date(year, 5, 0).getDate(),
      occupancyRate: 0,
    },
    {
      month: 6,
      year: parseInt(year),
      numberOfDays: 0,
      monthDays: new Date(year, 6, 0).getDate(),
      occupancyRate: 0,
    },
    {
      month: 7,
      year: parseInt(year),
      numberOfDays: 0,
      monthDays: new Date(year, 7, 0).getDate(),
      occupancyRate: 0,
    },
    {
      month: 8,
      year: parseInt(year),
      numberOfDays: 0,
      monthDays: new Date(year, 8, 0).getDate(),
      occupancyRate: 0,
    },
    {
      month: 9,
      year: parseInt(year),
      numberOfDays: 0,
      monthDays: new Date(year, 9, 0).getDate(),
      occupancyRate: 0,
    },
    {
      month: 10,
      year: parseInt(year),
      numberOfDays: 0,
      monthDays: new Date(year, 10, 0).getDate(),
      occupancyRate: 0,
    },
    {
      month: 11,
      year: parseInt(year),
      numberOfDays: 0,
      monthDays: new Date(year, 11, 0).getDate(),
      occupancyRate: 0,
    },
    {
      month: 12,
      year: parseInt(year),
      numberOfDays: 0,
      monthDays: new Date(year, 12, 0).getDate(),
      occupancyRate: 0,
    },
  ];

  let bookings = await PropertyBooking.find(search)
    .where("confirmationCode")
    .ne(null)
    .populate("property")
    .sort("checkInDate");

  //get all bookings
  bookings.forEach((booking) => {
    if (!booking.property.deleted) {
      let checkInMonth = response.find(
        (ele) =>
          ele.month === new Date(booking.checkInDate).getMonth() + 1 &&
          parseInt(new Date(booking.checkInDate).getFullYear()) ===
            parseInt(year)
      );

      if (checkInMonth) {
        response = response.filter((ele) => ele.month !== checkInMonth.month);

        checkInMonth.monthDays = new Date(
          checkInMonth.year,
          checkInMonth.month,
          0
        ).getDate();

        //Get days
        let bookingDays = getDatesBetweenDates(
          booking.checkInDate,
          booking.checkOutDate
        );

        bookingDays.forEach((date) => {
          let found = allDates.find(
            (ele) => new Date(ele).getTime() === new Date(date).getTime()
          );

          if (!found) {
            checkInMonth.numberOfDays++;
          }

          console.log(found);
          allDates.push(date);
        });

        checkInMonth.occupancyRate =
          (checkInMonth.numberOfDays / checkInMonth.monthDays) * 100;

        response.push(checkInMonth);
      }
    }
  });

  response = response.sort((a, b) => a.month - b.month);

  if (req.url === "/occupancy/downloadExcel") {
    const workbook = new excelJS.Workbook();

    const worksheet = workbook.addWorksheet("Occupancy Rate");

    const path = "./files";

    worksheet.columns = [
      { header: "M no.", key: "month", width: 10 },
      { header: "Year", key: "year", width: 10 },
      { header: "Month Days", key: "monthDays", width: 10 },
      { header: "Number Of Occupied Days", key: "numberOfDays", width: 10 },
      { header: "Occupancy Rate", key: "occupancyRate", width: 10 },
    ];

    let counter = 1;

    response.forEach((item) => {
      item.month = counter;

      worksheet.addRow(item);

      counter++;
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    try {
      const data = await workbook.xlsx.writeFile(`${path}/occupancy.xlsx`);

      return res.status(200).send({
        status: "success",
        message: "file successfully downloaded",
        url: `${CONF.DOMAIN_PORT}files/occupancy.xlsx`,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({
        status: "error",
        message: messages.en.generalError,
      });
    }
  }

  return res
    .status(200)
    .send({ data: response, message: messages.en.getSuccess });
}

module.exports = { getMonthlyRevenu, getMonthlyBookings, getOccupancyRate };
