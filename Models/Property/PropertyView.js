const Property = require("./Property");
const messages = require("../../messages.json");
const mongoose = require("mongoose");
const { Currency } = require("../Currency/Currency");
const { Area } = require("../Area/Area");
const { Review } = require("../Reviews/Review");
const { SearchHistory } = require("../Search/Search");
const { policis } = require("../CancellationPolicy/CancelPolicy");
const _ = require("lodash");
const User = require("../User/User");
const HoldEvent = require("../Calendar/HoldEvent");
const { formatDate } = require("../../Services/generalServices");

async function GetProperties(req, res) {
  let conversion = req.conversion;

  let data = [];
  let {
    sort,
    propertyType,
    maxPrice,
    minPrice,
    bedrooms,
    bathrooms,
    beds,
    todayDeals,
    featuredFilters,
    cityId,
    pageSize,
    pageNumber,
  } = req.query;
  let sorting;

  let filter = { enabled: true, deleted: false };

  let bedCount = 0;
  let reviewsCount = 0;
  let reviewsSum = 0;
  let reviewsAvg = 0;
  var price = 0;

  let reviews = [];

  const daysNumbers = [0, 6]; //0 is sunday and 1 is saturday

  if (propertyType) filter.category = propertyType;

  if (featuredFilters) {
    typeof featuredFilters === "string"
      ? (filter.amenities = {
          $in: featuredFilters.split(","),
        })
      : (filter.amenities = {
          $in: featuredFilters,
        });
  }

  console.log(featuredFilters);

  if (cityId) {
    typeof cityId === "string"
      ? (filter.city = cityId.split(","))
      : (filter.city = cityId);
  }

  if (todayDeals === "true") filter["sale.onSale"] = true;
  else filter = filter;

  if (req.url === "/new") filter.new = true;

  if (!pageSize) pageSize = 10;
  else pageSize = parseInt(pageSize);
  if (!pageNumber) pageNumber = 1;
  else pageNumber = parseInt(pageNumber);

  if (sort === "price") {
    if (daysNumbers.includes(new Date().getDay())) {
      sorting = "priceAccordingToWeekends.price";
    } else {
      sorting = "priceAccordingToWeekDays.price";
    }
  }

  let properties = await Property.find(filter)
    .populate("area", "_id name")
    .populate("category", "_id name")
    .populate("area", "_id name")
    .populate("price.currency", "_id name symbol")
    .populate("bedrooms.beds", "_id name enabled deleted")
    .populate("amenities", "_id name")
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .sort(sorting);

  let totalCount = await Property.count({ deleted: false, enabled: true });

  if (properties.length === 0)
    return res.status(200).send({ properties: [], message: "No properties" });

  if (sort === "price") {
    data.sort((a, b) => {
      return parseInt(a.price) - parseInt(b.price);
    });
  }

  let propertyReviews = await Review.find()
    .where("property")
    .ne(null)
    .populate("city", "_id name country")
    .populate({ path: "city", populate: { path: "country" } });

  properties.forEach((item) => {
    //Get number of beds for each property
    item.bedrooms.forEach((room) => {
      bedCount =
        bedCount +
        room.beds.filter((bed) => !!bed.enabled && !bed.deleted).length;
    });

    //Get reviews average
    if (propertyReviews.length !== 0) {
      propertyReviews.forEach((review) => {
        if (_.isEqual(item._id, review.property)) {
          reviewsSum = reviewsSum + review.rate;
          reviewsCount++;
          reviews.push({
            rate: review.rate,
            review: review.review,
            location:
              review.city === null
                ? null
                : `${review.city.name}, ${review.city.country.name}`,
          });
        }
      });
    }

    reviewsCount == 0
      ? (reviewsAvg = 0)
      : (reviewsAvg = reviewsSum / reviewsCount);

    if (daysNumbers.includes(new Date().getDay())) {
      price = item.priceAccordingToWeekends.price;
    }

    //Prices if days are weekdays
    else {
      price = item.priceAccordingToWeekDays.price;
    }
    //}

    //Check if date is in a range where price may be diffrent and change the price
    item.priceAccordingToDate.forEach((ele) => {
      ele.dates.forEach((date) => {
        new Date(date).getTime() ===
        new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime()
          ? (price = ele.price)
          : (price = price);
      });
    });

    data.push({
      _id: item._id,
      name: item.name,
      urlName: item.urlName,
      locationApp: {
        lat: parseFloat(item.location.lat),
        long: parseFloat(item.location.long),
      },
      location: item.location,
      images: item.images,
      category: item.category,
      price: !conversion
        ? `${price} ${item.price.currency.symbol}`
        : `${price * conversion.rate} ${conversion.to.symbol}`,
      area: item.area,
      numberOfGuests: item.numberOfGuests.maximum,
      numberOfBedrooms: item.numberOfBedrooms,
      numberOfBathrooms: item.numberOfBathrooms,
      rate: reviewsAvg,
      reviews: reviews,
      beds: bedCount,
      onSale: item.sale.onSale,
      saleAmount: `${item.sale.salePercent * 100}%`,
      distanceFromDowntown: item.distanceFromDowntown,
      popularityCounter: item.popularityCounter,
    });

    bedCount = 0;
    reviewsCount = 0;
    reviewsAvg = 0;
    reviewsSum = 0;
    price = 0;
    reviews = [];
  });

  if (beds) {
    if (beds === "0") filter = filter;
    else {
      //Filter data to get properties according to beds
      data = data.filter((stay) => parseInt(stay.beds) >= parseInt(beds));
    }
  }

  if (bedrooms) {
    if (bedrooms === "0") filter = filter;
    else
      data = data.filter(
        (stay) => parseInt(stay.numberOfBedrooms) >= parseInt(bedrooms)
      );
  }

  if (bathrooms) {
    if (bathrooms === "0") filter = filter;
    else
      data = data.filter(
        (stay) => parseInt(stay.numberOfBathrooms) >= parseInt(bathrooms)
      );
  }

  if (maxPrice && minPrice) {
    if (conversion) {
      minPrice = parseInt(minPrice);
      minPrice = parseInt(minPrice) * conversion.rate;
      maxPrice = parseInt(maxPrice);
      maxPrice = parseInt(maxPrice) * conversion.rate;
    } else {
      minPrice = parseInt(minPrice);
      maxPrice = parseInt(maxPrice);
    }

    data = data.filter(
      (stay) =>
        parseInt(stay.price) >= minPrice && parseInt(stay.price) <= maxPrice
    );
  }

  //Sorting results
  // if (sort === "price") {
  //   data.sort((a, b) => {
  //     return parseInt(a.price) - parseInt(b.price);
  //   });
  // }

  if (sort === "review") {
    data.sort((a, b) => {
      return b.rate - a.rate;
    });
  }

  if (sort === "distance") {
    data.sort((a, b) => {
      return a.distanceFromDowntown - b.distanceFromDowntown;
    });
  }

  if (sort === "popularity") {
    data.sort((a, b) => {
      return b.popularityCounter - a.popularityCounter;
    });
  }

  return res.status(200).send({
    properties: data,
    totalCount,
    message: messages.en.getSuccess,
  });
}

async function GetMostBooked(req, res) {
  let conversion = req.conversion;
  let data = [];
  let filter = { enabled: true, deleted: false };
  let bedCount = 0;
  let reviewsCount = 0;
  let reviewsSum = 0;
  let reviewsAvg = 0;
  var price = 0;
  let reviews = [];
  const daysNumbers = [0, 6]; //0 is sunday and 1 is saturday

  let properties = await Property.find(filter)
    .populate("area", "_id name")
    .populate("category", "_id name")
    .populate("area", "_id name")
    .populate("price.currency", "_id name symbol")
    .populate("bedrooms.beds", "_id name enabled deleted")
    .populate("amenities", "_id name")
    .sort("-popularityCounter")
    .limit(15);

  let totalCount = await Property.count({ deleted: false, enabled: true });

  if (properties.length === 0)
    return res.status(200).send({ properties: [], message: "No properties" });

  let propertyReviews = await Review.find()
    .where("property")
    .ne(null)
    .populate("city", "_id name country")
    .populate({ path: "city", populate: { path: "country" } });

  properties.forEach((item) => {
    //Get number of beds for each property
    item.bedrooms.forEach((room) => {
      bedCount =
        bedCount +
        room.beds.filter((bed) => !!bed.enabled && !bed.deleted).length;
    });

    //Get reviews average
    if (propertyReviews.length !== 0) {
      propertyReviews.forEach((review) => {
        if (_.isEqual(item._id, review.property)) {
          reviewsSum = reviewsSum + review.rate;
          reviewsCount++;
          reviews.push({
            rate: review.rate,
            review: review.review,
            location:
              review.city === null
                ? null
                : `${review.city.name}, ${review.city.country.name}`,
          });
        }
      });
    }

    reviewsCount == 0
      ? (reviewsAvg = 0)
      : (reviewsAvg = reviewsSum / reviewsCount);

    //Check what type of rate is being use
    //Prices if days are weekends
    if (daysNumbers.includes(new Date().getDay())) {
      price = item.priceAccordingToWeekends.price;
    }
    //Prices if days are weekdays
    else {
      price = item.priceAccordingToWeekDays.price;
    }

    //Check if date is in a range where price may be diffrent and change the price
    item.priceAccordingToDate.forEach((ele) => {
      ele.dates.forEach((date) => {
        new Date(date).getTime() ===
        new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime()
          ? (price = ele.price)
          : (price = price);
      });
    });

    data.push({
      _id: item._id,
      name: item.name,
      urlName: item.urlName,
      locationApp: {
        lat: parseFloat(item.location.lat),
        long: parseFloat(item.location.long),
      },
      location: item.location,
      images: item.images,
      category: item.category,
      price: !conversion
        ? `${price} ${item.price.currency.symbol}`
        : `${price * conversion.rate} ${conversion.to.symbol}`,
      area: item.area,
      numberOfGuests: item.numberOfGuests.maximum,
      numberOfBedrooms: item.numberOfBedrooms,
      rate: reviewsAvg,
      reviews: reviews,
      beds: bedCount,
      onSale: item.sale.onSale,
      saleAmount: `${item.sale.salePercent * 100}%`,
      distanceFromDowntown: item.distanceFromDowntown,
      popularityCounter: item.popularityCounter,
    });

    bedCount = 0;
    reviewsCount = 0;
    reviewsAvg = 0;
    reviewsSum = 0;
    price = 0;
    reviews = [];
  });

  return res.status(200).send({
    properties: data,
    totalCount,
    message: messages.en.getSuccess,
  });
}

async function GetPropertyById(req, res) {
  let conversion = req.conversion;
  let propertyId = mongoose.Types.ObjectId(req.params.id);
  let data = {};
  let blockedDates = [];
  let bedCount = 0;
  let reviewsCount = 0;
  let reviewsSum = 0;
  let reviewsAvg = 0;
  let propertyReviews = [];
  var price = 0;
  const daysNumbers = [0, 6]; //0 is sunday and 1 is saturday
  let checkInDates = [];
  let checkOutDates = [];
  let filter = {};

  if (req.params.id) filter = { _id: propertyId };
  if (req.params.urlName) filter = { urlName: req.params.urlName };

  let property = await Property.findOne(filter)
    .populate("area", "_id name")
    .populate("category", "_id name")
    .populate("area", "_id name description")
    .populate("price.currency", "_id name symbol")
    .populate("bedrooms.beds", "_id name enabled")
    .populate("amenities", "_id name image deleted")
    .populate("rules", "_id name image deleted")
    .populate("highlights", "_id name image description deleted")
    .populate("bedrooms.beds", "_id name enabled deleted")
    .populate("bathrooms.bathType", "_id name enabled");

  if (!property)
    return res.status(200).send({ property: null, message: "No properties" });

  //Check what type of rate is being use

  //Check what day it's is and change price according to it's rate
  //Prices if days are weekends
  if (daysNumbers.includes(new Date().getDay())) {
    price = property.priceAccordingToWeekends.price;
  }

  //Prices if days are weekdays
  else {
    price = property.priceAccordingToWeekDays.price;
  }

  //Check if date is in a range where price may be diffrent and change the price
  property.priceAccordingToDate.forEach((item) => {
    item.dates.forEach((date) => {
      let d = new Date(date);

      d.getDay() === new Date().getDay() &&
      d.getMonth() === new Date().getMonth() &&
      d.getFullYear() === new Date().getFullYear()
        ? (price = item.price)
        : (price = price);
    });
  });

  let reviews = await Review.find({ property: propertyId })
    .populate("city", "_id name country")
    .populate({ path: "city", populate: { path: "country" } })
    .populate("user", "_id fullName imageUrl");

  //Get number of beds for each property
  property.bedrooms.forEach((room) => {
    bedCount =
      bedCount +
      room.beds.filter((bed) => !!bed.enabled && !bed.deleted).length;
  });

  //Get reviews average
  if (reviews.length !== 0) {
    reviews.forEach((review) => {
      reviewsSum = reviewsSum + review.rate;
      reviewsCount++;
      propertyReviews.push({
        rate: review.rate,
        review: review.review,
        name: `${review.user.fullName.first} ${review.user.fullName.last}`,
        userImage: `${review.user.imageUrl}`,
        location:
          review.city === null
            ? null
            : `${review.city.name}, ${review.city.country.name}`,
      });
    });
  }

  reviewsCount == 0
    ? (reviewsAvg = 0)
    : (reviewsAvg = reviewsSum / reviewsCount);

  let dates = await HoldEvent.find({
    stay: property._id,
  }).populate("stayBooking");

  if (dates.length !== 0) {
    dates.forEach((item) => {
      item.holdDates.forEach((date, index) => {
        if (index === item.holdDates.length - 1) return;
        if (index === 0) return;

        blockedDates.push(formatDate(date));
      });

      item.blockedDates.forEach((date) => {
        blockedDates.push(formatDate(date));
      });
    });

    dates.forEach((item) => {
      if (item.stayBooking) {
        checkOutDates.push(formatDate(item.stayBooking.checkOutDate));

        checkInDates.push(formatDate(item.stayBooking.checkInDate));
      }
    });
  }

  //Add all info to the response data

  data = {
    _id: property._id,
    name: property.name,
    locationApp: {
      lat: parseFloat(property.location.lat),
      long: parseFloat(property.location.long),
    },
    location: property.location,
    images: property.images,
    image360Urls: property.image360Urls,
    category: property.category,
    price: !conversion
      ? `${price} ${property.price.currency.symbol}`
      : `${price * conversion.rate} ${conversion.to.symbol}`,
    area: property.area,
    persons: property.numberOfGuests.maximum,
    numberOfGuests: property.numberOfGuests,
    numberOfBedrooms: property.numberOfBedrooms,
    numberOfBathrooms: property.numberOfBathrooms,
    sizeInM: property.sizeInM,
    rate: reviewsAvg,
    reviews: propertyReviews,
    amenities: property.amenities.filter((item) => !item.deleted),
    highlights: property.highlights.filter((item) => !item.deleted),
    bedrooms: property.bedrooms.map((room) => {
      return {
        _id: room._id,
        name: room.name,
        beds: room.beds.filter((bed) => !!bed.enabled && !bed.deleted),
      };
    }),
    bathrooms: property.bathrooms,
    checkInTime: property.checkInTime,
    checkOutTime: property.checkOutTime,
    importantInfo: property.importantInfo,
    additionalRules: property.additionalRules,
    otherDistance: property.otherDistance,
    rules: property.rules.filter((item) => !item.deleted),
    amenitiesHighlight: property.amenitiesHighlight,
    cancelationPolicy: policis.find((item) =>
      item._id.equals(property.cancelationPolicy)
    ),
    briefDescription: property.briefDescription,
    transPortInfo: property.transPortInfo,
    checkInDates: checkInDates,
    checkOutDates: checkOutDates,
    blockedDates: blockedDates,
    beds: bedCount,
  };

  return res.status(200).send({
    property: data,
    message: messages.en.getSuccess,
  });
}

async function GetPropertiesMap(req, res) {
  let conversion = req.conversion;
  let data = [];
  let {
    propertyType,
    maxPrice,
    minPrice,
    bedrooms,
    bathrooms,
    beds,
    cityId,
    featuredFilters,
  } = req.query;

  let filter = { enabled: true, deleted: false };

  let bedCount = 0;
  let reviewsCount = 0;
  let reviewsSum = 0;
  let reviewsAvg = 0;
  var price = 0;

  let reviews = [];

  const daysNumbers = [0, 6]; //0 is sunday and 1 is saturday

  if (propertyType) filter.category = propertyType;

  if (featuredFilters)
    filter.amenities = {
      $in: Array.isArray(featuredFilters)
        ? featuredFilters
        : [...featuredFilters],
    };

  if (cityId) filter.city = cityId;

  let properties = await Property.find(filter)
    .populate("area", "_id name")
    .populate("category", "_id name")
    .populate("area", "_id name")
    .populate("price.currency", "_id name symbol")
    .populate("bedrooms.beds", "_id name enabled")
    .populate("amenities", "_id name");

  if (properties.length === 0)
    return res.status(200).send({ properties: [], message: "No properties" });

  let propertyReviews = await Review.find()
    .where("property")
    .ne(null)
    .populate("city", "_id name country")
    .populate({ path: "city", populate: { path: "country" } });

  properties.forEach((item) => {
    //Get number of beds for each property
    item.bedrooms.forEach((room) => {
      bedCount = bedCount + room.beds.length;
    });

    //Get reviews average
    if (propertyReviews.length !== 0) {
      propertyReviews.forEach((review) => {
        if (_.isEqual(item._id, review.property)) {
          reviewsSum = reviewsSum + review.rate;
          reviewsCount++;
          reviews.push({
            rate: review.rate,
            review: review.review,
            location:
              review.city === null
                ? null
                : `${review.city.name}, ${review.city.country.name}`,
          });
        }
      });
    }

    reviewsCount == 0
      ? (reviewsAvg = 0)
      : (reviewsAvg = reviewsSum / reviewsCount);

    //Check what type of rate is being use
    if (daysNumbers.includes(new Date().getDay())) {
      price = item.priceAccordingToWeekends.price;
    }

    //Prices if days are weekdays
    else {
      price = item.priceAccordingToWeekDays.price;
    }
    //}

    //Check if date is in a range where price may be diffrent and change the price
    item.priceAccordingToDate.forEach((ele) => {
      ele.dates.forEach((date) => {
        new Date(date).getTime() ===
        new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime()
          ? (price = ele.price)
          : (price = price);
      });
    });

    data.push({
      _id: item._id,
      name: item.name,
      urlName: item.urlName,
      locationApp: {
        lat: parseFloat(item.location.lat),
        long: parseFloat(item.location.long),
      },
      location: item.location,
      images: item.images,
      category: item.category,
      price: !conversion
        ? `${price} ${item.price.currency.symbol}`
        : `${price * conversion.rate} ${conversion.to.symbol}`,
      area: item.area,
      numberOfGuests: item.numberOfGuests.maximum,
      numberOfBedrooms: item.numberOfBedrooms,
      numberOfBathrooms: item.numberOfBathrooms,
      rate: reviewsAvg,
      reviews: reviews,
      beds: bedCount,
    });

    bedCount = 0;
    reviewsCount = 0;
    reviewsAvg = 0;
    reviewsSum = 0;
    price = 0;
    reviews = [];
  });

  if (beds) {
    if (beds === "0") filter = filter;
    else {
      //Filter data to get properties according to beds
      data = data.filter((stay) => parseInt(stay.beds) >= parseInt(beds));
    }
  }

  if (bedrooms) {
    if (bedrooms === "0") filter = filter;
    else
      data = data.filter(
        (stay) => parseInt(stay.numberOfBedrooms) >= parseInt(bedrooms)
      );
  }

  if (bathrooms) {
    if (bathrooms === "0") filter = filter;
    else
      data = data.filter(
        (stay) => parseInt(stay.numberOfBathrooms) >= parseInt(bathrooms)
      );
  }

  if (maxPrice && minPrice) {
    if (conversion) {
      minPrice = parseInt(minPrice);
      minPrice = parseInt(minPrice) * conversion.rate;
      maxPrice = parseInt(maxPrice);
      maxPrice = parseInt(maxPrice) * conversion.rate;
    } else {
      minPrice = parseInt(minPrice);
      maxPrice = parseInt(maxPrice);
    }

    data = data.filter(
      (stay) =>
        parseInt(stay.price) >= minPrice && parseInt(stay.price) <= maxPrice
    );
  }

  return res.status(200).send({
    properties: data,
    message: messages.en.getSuccess,
  });
}

async function reviewStay(req, res) {
  let { propertyId } = req.body;
  let userId = mongoose.Types.ObjectId(req.user._id);
  propertyId = mongoose.Types.ObjectId(propertyId);

  let property = await Property.findOne({ _id: propertyId });
  if (!property)
    return res
      .status(404)
      .send({ property: null, message: messages.en.noRecords });

  req.body.user = userId;
  req.body.property = propertyId;
  req.body.city = req.user.city;

  let review = new Review(req.body);
  await review.save();

  return res
    .status(200)
    .send({ review: review, message: messages.en.addSuccess });
}

async function addOrRemoveFromFavorites(req, res) {
  let { propertyId } = req.body;
  let userId = mongoose.Types.ObjectId(req.user._id);

  let user = await User.findOne({ _id: userId });

  let property = await Property.findOne({
    _id: mongoose.Types.ObjectId(propertyId),
  });

  if (!user)
    return res
      .status(404)
      .send({ user: null, message: messages.en.noUserFound });

  if (!property)
    return res
      .status(404)
      .send({ property: null, message: messages.en.noRecords });

  let exist = user.favoriteProperties
    .map((property) => property.toString())
    .includes(propertyId);

  if (exist) {
    user.favoriteProperties.pull(propertyId);
    await user.save();

    return res.status(200).send({
      addedToFavorite: false,
      favoriteProperties: user.favoriteProperties,
      message: messages.en.exist,
    });
  }

  user.favoriteProperties.push(propertyId);
  await user.save();

  return res.status(200).send({
    addedToFavorite: true,
    favoriteProperties: user.favoriteProperties,
    message: messages.en.addSuccess,
  });
}

async function getAreasForSearch(req, res) {
  let { searchWord } = req.query;
  let query = { deleted: false };

  if (searchWord) query.name = { $regex: searchWord || "", $options: "$i" };

  let areas = await Area.find(query).select("_id name");

  return res
    .status(200)
    .send({ areas: areas, message: messages.en.getSuccess });
}

async function search(req, res) {
  let { areaId, checkInDate, checkOutDate, adults, childrens, infants } =
    req.query;
  let conversion = req.conversion;
  let numberOfGuests = 0;

  let search = { deleted: false, enabled: true };
  let data = [];
  let bedCount = 0;
  let reviewsCount = 0;
  let reviewsSum = 0;
  let reviewsAvg = 0;
  var price = 0;
  let reviews = [];
  const daysNumbers = [0, 6]; //0 is sunday and 1 is saturday

  if (areaId) {
    search.area = mongoose.Types.ObjectId(areaId);
    //do not save already existing searches in history
    if (req.user) {
      let userId = mongoose.Types.ObjectId(req.user);
      let existingHistory = await SearchHistory.findOne({
        user: userId,
        area: areaId,
      });

      if (!existingHistory) {
        let searchHistory = new SearchHistory({
          area: search.area,
          user: userId,
        });
        await searchHistory.save();
      }
    }
  }

  if (checkInDate && checkOutDate)
    search["blockedDates.dates"] = { $nin: [checkOutDate, checkInDate] };

  if (adults) {
    if (adults === "0") search = search;
    else
      search["numberOfGuests.maximum"] = {
        $gte: numberOfGuests + parseInt(adults),
      };
  }

  if (childrens) {
    if (childrens === "0") search = search;
    else
      search["numberOfGuests.maximum"] = {
        $gte: numberOfGuests + parseInt(childrens),
      };
  }

  if (infants) {
    if (infants === "0") search = search;
    else
      search["numberOfGuests.maximum"] = {
        $gte: numberOfGuests + parseInt(infants),
      };
  }

  let properties = await Property.find(search)
    .populate("area", "_id name")
    .populate("category", "_id name")
    .populate("area", "_id name")
    .populate("price.currency", "_id name symbol")
    .populate("bedrooms.beds", "_id name enabled deleted")
    .populate("amenities", "_id name image");

  let totalCount = await Property.count(search);

  let propertyReviews = await Review.find()
    .populate("city", "_id name country")
    .populate({ path: "city", populate: { path: "country" } });

  properties.forEach((item) => {
    //Get number of beds for each property
    item.bedrooms.forEach((room) => {
      bedCount =
        bedCount +
        room.beds.filter((bed) => !!bed.enabled && !bed.deleted).length;
    });

    //Get reviews average
    if (propertyReviews.length !== 0) {
      propertyReviews.forEach((review) => {
        if (_.isEqual(item._id, review.property)) {
          reviewsSum = reviewsSum + review.rate;
          reviewsCount++;
          reviews.push({
            rate: review.rate,
            review: review.review,
            location:
              review.city === null
                ? null
                : `${review.city.name}, ${review.city.country.name}`,
          });
        }
      });
    }

    reviewsCount == 0
      ? (reviewsAvg = 0)
      : (reviewsAvg = reviewsSum / reviewsCount);

    if (daysNumbers.includes(new Date().getDay())) {
      price = item.priceAccordingToWeekends.price;
    }

    //Prices if days are weekdays
    else {
      price = item.priceAccordingToWeekDays.price;
    }

    //Check if date is in a range where price may be diffrent and change the price
    item.priceAccordingToDate.forEach((ele) => {
      ele.dates.forEach((date) => {
        new Date(date).getTime() ===
        new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime()
          ? (price = ele.price)
          : (price = price);
      });
    });

    data.push({
      _id: item._id,
      name: item.name,
      urlName: item.urlName,
      locationApp: {
        lat: parseFloat(item.location.lat),
        long: parseFloat(item.location.long),
      },
      location: item.location,
      images: item.images,
      category: item.category,
      price: !conversion
        ? `${price} ${item.price.currency.symbol}`
        : `${price * conversion.rate} ${conversion.to.symbol}`,
      area: item.area,
      numberOfGuests: item.numberOfGuests.maximum,
      numberOfBedrooms: item.numberOfBedrooms,
      rate: reviewsAvg,
      reviews: reviews,
      beds: bedCount,
    });

    bedCount = 0;
    reviewsCount = 0;
    reviewsAvg = 0;
    reviewsSum = 0;
    price = 0;
    reviews = [];
  });

  return res
    .status(200)
    .send({ properties: data, totalCount, message: messages.en.getSuccess });
}

module.exports = {
  GetProperties,
  GetPropertyById,
  GetMostBooked,
  GetPropertiesMap,
  reviewStay,
  addOrRemoveFromFavorites,
  getAreasForSearch,
  search,
};
