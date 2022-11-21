const Tour = require("./Tour");
const TourDates = require("../../Models/TourDates/TourDates");
const messages = require("../../messages.json");
const _ = require("lodash");
const mongoose = require("mongoose");
const User = require("../User/User");
const { Review } = require("../Reviews/Review");
const { SearchHistory } = require("../Search/Search");
const { policis } = require("../CancellationPolicy/CancelPolicy");

async function getExperiences(req, res) {
  let conversion = req.conversion;
  let {
    countryId,
    categoryId,
    cityId,
    sort,
    todayDeals,
    pageSize,
    pageNumber,
  } = req.query;
  let filter = { enabled: true, deleted: false };
  let data = [];
  let reviewsCount = 0;
  let reviewsSum = 0;
  let reviewsAvg = 0;
  let reviews = [];
  let price = 0;
  const daysNumbers = [5, 6]; //friday and saturday

  if (countryId) filter.country = mongoose.Types.ObjectId(countryId);

  if (categoryId) filter.category = categoryId;

  if (cityId) filter.city = cityId;

  if (todayDeals === "true") filter["sale.onSale"] = true;
  else filter = filter;

  if (pageSize) pageSize = parseInt(pageSize);
  else pageSize = 10;

  if (pageNumber) pageNumber = parseInt(pageNumber);
  else pageNumber = 1;

  if (req.url === "/new") filter.new = true;

  let tours = await Tour.find(filter)
    .populate("price.currency", "_id symbol")
    .populate("city", "_id name")
    .populate("country", "_id name")
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize);

  let totalCount = await Tour.count({ enabled: true, deleted: false });

  if (tours.length === 0)
    return res.status(200).send({ tours: data, message: "No Tours" });

  let tourReviews = await Review.find()
    .where("tour")
    .ne(null)
    .populate("city", "_id name country")
    .populate({ path: "city", populate: { path: "country" } });

  if (tours.length !== 0)
    tours.forEach((item) => {
      //Get reviews average
      if (tourReviews.length !== 0) {
        tourReviews.forEach((review) => {
          if (_.isEqual(item._id, review.tour)) {
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

      price = item.price.amount.adults;

      data.push({
        _id: item._id,
        title: item.title,
        urlName: item.urlName,
        price: !conversion
          ? `${price} ${item.price.currency.symbol}`
          : `${price * conversion.rate} ${conversion.to.symbol}`,
        images: item.images,
        location: `${item.country.name}-${item.city.name}`,
        itinerary: item.itinerary,
        rate: reviewsAvg,
        reviews: reviews,
        onSale: item.sale.onSale,
        saleAmount: `${item.sale.salePercent * 100}%`,
        popularityCounter: item.popularityCounter,
      });

      reviewsCount = 0;
      reviewsAvg = 0;
      reviewsSum = 0;
      price = 0;
      reviews = [];
    });

  //Sorting results
  if (sort === "price") {
    data.sort((a, b) => {
      return parseInt(a.price) - parseInt(b.price);
    });
  }

  if (sort === "review") {
    data.sort((a, b) => {
      return b.rate - a.rate;
    });
  }

  if (sort === "popularity") {
    data.sort((a, b) => {
      return b.popularityCounter - a.popularityCounter;
    });
  }

  return res
    .status(200)
    .send({ tours: data, totalCount, message: messages.en.getSuccess });
}

async function getExperiencesForMap(req, res) {
  let conversion = req.conversion;
  let { countryId, categoryId, cityId } = req.query;
  let filter = { enabled: true, deleted: false };
  let data = [];
  let reviewsCount = 0;
  let reviewsSum = 0;
  let reviewsAvg = 0;
  let reviews = [];
  let price = 0;
  const daysNumbers = [5, 6]; //friday and saturday

  if (countryId) filter.country = mongoose.Types.ObjectId(countryId);

  if (categoryId) filter.category = categoryId;

  if (cityId) filter.city = cityId;

  let tours = await Tour.find(filter)
    .populate("price.currency", "_id symbol")
    .populate("city", "_id name")
    .populate("country", "_id name");

  if (tours.length === 0)
    return res.status(200).send({ tours: data, message: "No Tours" });

  let tourReviews = await Review.find()
    .where("tour")
    .ne(null)
    .populate("city", "_id name country")
    .populate({ path: "city", populate: { path: "country" } });

  if (tours.length !== 0)
    tours.forEach((item) => {
      //Get reviews average
      if (tourReviews.length !== 0) {
        tourReviews.forEach((review) => {
          if (_.isEqual(item._id, review.tour)) {
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

      price = item.price.amount.adults;

      data.push({
        _id: item._id,
        title: item.title,
        urlName: item.urlName,
        price: !conversion
          ? `${price} ${item.price.currency.symbol}`
          : `${price * conversion.rate} ${conversion.to.symbol}`,
        images: item.images,
        location: `${item.country.name}-${item.city.name}`,
        itinerary: item.itinerary,
        rate: reviewsAvg,
        reviews: reviews,
      });

      reviewsCount = 0;
      reviewsAvg = 0;
      reviewsSum = 0;
      price = 0;
      reviews = [];
    });

  return res.status(200).send({ tours: data, message: messages.en.getSuccess });
}

async function getExperiencesById(req, res) {
  let conversion = req.conversion;
  let tourId = mongoose.Types.ObjectId(req.params.id);
  let data = {};
  let today = new Date();
  let priceDetails = {};
  let tourDatesData = [];
  let tourReviews = [];
  let reviewsCount = 0;
  let reviewsSum = 0;
  let reviewsAvg = 0;
  const daysNumbers = [5, 6]; //friday and saturday
  let filter = {};

  if (req.params.urlName) filter = { urlName: req.params.urlName };
  if (req.params.id) filter = { _id: req.params.id };

  let tour = await Tour.findOne(filter)
    .populate("country", "_id name")
    .populate("city", "_id name")
    .populate("category", "_id name image")
    .populate("price.currency", "_id name symbol");

  if (!tour)
    return res.status(404).send({ tour: null, message: messages.en.noRecords });

  //Get All Tour dates and insert the prices
  let tourDates = await TourDates.find({ tour: tour._id, deleted: false })
    .populate("price.currency", "_id name symbol")
    .sort("day");

  //Add price to tour dates
  tourDates.forEach((item) => {
    if (new Date(item.day).setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0))
      return;
    else {
      priceDetails.pricePerOneAdult = item.price.amount.adults;
      priceDetails.pricePerOneChilde = item.price.amount.childrens;
      priceDetails.pricePerOneInfant = item.price.amount.infants;

      //Change price according to currency
      if (conversion) {
        priceDetails.pricePerOneAdult *= conversion.rate;
        priceDetails.pricePerOneChilde *= conversion.rate;
        priceDetails.pricePerOneInfant *= conversion.rate;
      }

      tourDatesData.push({
        _id: item._id,
        day: item.day,
        departureTime: item.departureTime,
        returnTime: item.returnTime,
        amount: item.amount,
        persons: _.sum([
          item.numberOfGuests.adults,
          item.numberOfGuests.infants,
          item.numberOfGuests.childrens,
        ]),
        numberOfGuests: item.numberOfGuests,
        soldOut: item.soldOut,
        price: `${priceDetails.pricePerOneAdult} ${
          !conversion ? item.price.currency.symbol : conversion.to.symbol
        }`,
        priceDetails: priceDetails,
      });
    }
  });

  //Get the tours reviews and add them to the details
  let reviews = await Review.find({ tour: tour._id })
    .populate("city", "_id name country")
    .populate({ path: "city", populate: { path: "country" } })
    .populate("user", "_id fullName imageUrl");

  if (reviews.length !== 0) {
    reviews.forEach((review) => {
      reviewsSum = reviewsSum + review.rate;
      reviewsCount++;
      tourReviews.push({
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

  //add all info to the respnse data
  data = {
    _id: tour._id,
    title: tour.title,
    location: `${tour.country.name}-${tour.city.name}`,
    category: tour.category,
    images: tour.images,
    itinerary: tour.itinerary,
    persons:
      tour.numberOfGuests.adults +
      tour.numberOfGuests.infants +
      tour.numberOfGuests.childrens,
    numberOfGuests: _.pick(tour.numberOfGuests, [
      "adults",
      "childrens",
      "infants",
    ]),
    meals: tour.meals,
    description: tour.briefDescription,
    program: tour.program,
    reviews: tourReviews,
    rate: reviewsAvg,
    sale: tour.sale,
    price: `${
      !conversion
        ? tour.price.amount.adults
        : tour.price.amount.adults * conversion.rate
    } ${!conversion ? tour.price.currency.symbol : conversion.to.symbol}`,
    priceDetails: {
      ...priceDetails,
      currency: !conversion ? tour.price.currency : conversion.to,
    },
    tourDates: tourDatesData,
    //find the lowest price to display
    priceFrom:
      tourDatesData.length !== 0
        ? `${Math.min(...tourDatesData.map((item) => parseInt(item.price)))} ${
            !conversion ? tour.price.currency.symbol : conversion.to.symbol
          }`
        : `${
            !conversion
              ? tour.price.amount.adults
              : tour.price.amount.adults * conversion.rate
          } ${!conversion ? tour.price.currency.symbol : conversion.to.symbol}`,

    cancelationPolicy: policis.find((item) =>
      item._id.equals(tour.cancelationPolicy)
    ),
    importantInfo: tour.importantInfo,
    rules: tour.rules,
  };

  return res.status(200).send({ tour: data, message: messages.en.getSuccess });
}

async function addOrRemoveFromFavorites(req, res) {
  let { tourId } = req.body;
  let userId = mongoose.Types.ObjectId(req.user._id);

  let user = await User.findOne({ _id: userId });

  let tour = await Tour.findOne({
    _id: mongoose.Types.ObjectId(tourId),
  });

  if (!user)
    return res
      .status(404)
      .send({ user: null, message: messages.en.noUserFound });

  if (!tour)
    return res.status(404).send({ tour: null, message: messages.en.noRecords });

  let exist = user.favoriteTours
    .map((tour) => tour.toString())
    .includes(tourId);

  if (exist) {
    user.favoriteTours.pull(tourId);
    await user.save();

    return res.status(200).send({
      addedToFavorite: false,
      favoriteTours: user.favoriteTours,
      message: messages.en.exist,
    });
  }

  user.favoriteTours.push(tourId);
  await user.save();

  return res.status(200).send({
    addedToFavorite: true,
    favoriteTours: user.favoriteTours,
    message: messages.en.addSuccess,
  });
}

async function reviewTour(req, res) {
  let { tourId } = req.body;
  let userId = mongoose.Types.ObjectId(req.user._id);
  tourId = mongoose.Types.ObjectId(tourId);

  let tour = await Tour.findOne({ _id: tourId });
  if (!tour)
    return res.status(404).send({ tour: null, message: messages.en.noRecords });

  req.body.user = userId;
  req.body.tour = tourId;
  req.body.city = req.user.city;

  let review = new Review(req.body);
  await review.save();

  return res
    .status(200)
    .send({ review: review, message: messages.en.addSuccess });
}

async function search(req, res) {
  let conversion = req.conversion;
  let { areaId, chosenDates, adults, childrens, infants } = req.query;
  let tourDates = [];
  let tourDatesIds = [];
  let search = { deleted: false, enabled: true };
  let data = [];
  let price = 0;
  let reviewsCount = 0;
  let reviewsSum = 0;
  let reviewsAvg = 0;
  let reviews = [];
  let userDates = [];
  const daysNumbers = [5, 6]; //friday and saturday

  if (chosenDates) {
    typeof chosenDates === "string"
      ? (userDates = chosenDates.split(",").map((date) => new Date(date)))
      : (userDates = chosenDates);
  }

  if (areaId) {
    search.area = mongoose.Types.ObjectId(areaId);
    if (req.user) {
      let userId = mongoose.Types.ObjectId(req.user);
      //do not save already existing searches in history
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

  tourDates = await TourDates.find({
    day: {
      $in: userDates,
      //$in: Array.isArray(chosenDates)
      //  ? chosenDates.map((day) => new Date(day))
      //  : new Date(chosenDates),
    },
  });

  if (tourDates.length !== 0) {
    tourDates.forEach((item) => tourDatesIds.push(item.tour));
    search._id = { $in: tourDatesIds };
  }

  if (adults) {
    if (adults === "0") search = search;
    else search["numberOfGuests.adults"] = { $gte: parseInt(adults) };
  }

  if (childrens) {
    if (childrens === "0") search = search;
    else search["numberOfGuests.childrens"] = { $gte: parseInt(childrens) };
  }

  if (infants) {
    if (infants === "0") search = search;
    else search["numberOfGuests.infants"] = { $gte: parseInt(infants) };
  }

  let tours = await Tour.find(search)
    .populate("price.currency", "_id symbol")
    .populate("city", "_id name")
    .populate("country", "_id name");

  let totalCount = await Tour.count({ deleted: false, enabled: true });

  if (tours.length === 0)
    return res.status(200).send({ tours: data, message: "No Tours" });

  let tourReviews = await Review.find()
    .where("tour")
    .ne(null)
    .populate("city", "_id name country")
    .populate({ path: "city", populate: { path: "country" } });

  if (tours.length !== 0)
    tours.forEach((item) => {
      //Get reviews average
      if (tourReviews.length !== 0) {
        tourReviews.forEach((review) => {
          if (_.isEqual(item._id, review.tour)) {
            reviews.push({
              rate: review.rate,
              review: review.review,
              location:
                review.city === null
                  ? null
                  : `${review.city.name}, ${review.city.country.name}`,
            });
            reviewsSum = reviewsSum + review.rate;
            reviewsCount++;
          }
        });
      }

      reviewsCount == 0
        ? (reviewsAvg = 0)
        : (reviewsAvg = reviewsSum / reviewsCount);

      price = item.price.amount.adults;

      data.push({
        _id: item._id,
        title: item.title,
        urlName: item.urlName,
        price: !conversion
          ? `${price} ${item.price.currency.symbol}`
          : `${price * conversion.rate} ${conversion.to.symbol}`,
        images: item.images,
        location: `${item.country.name}-${item.city.name}`,
        itinerary: item.itinerary,
        rate: reviewsAvg,
        reviews: reviews,
      });

      reviewsCount = 0;
      reviewsAvg = 0;
      reviewsSum = 0;
      price = 0;
      reviews = [];
    });

  return res
    .status(200)
    .send({ tours: data, totalCount, message: messages.en.getSuccess });
}

module.exports = {
  getExperiences,
  getExperiencesForMap,
  getExperiencesById,
  addOrRemoveFromFavorites,
  reviewTour,
  search,
};
