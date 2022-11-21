const CONF = require("../constants");

const sendConfirmationEmail = (booking) => {
  return `
  <h3>Your Cheez-Hospitality booking has been confirmed successfuly:</h3>
<br>

<span>Stay:</span><br>
${booking.property.name}<br>
<br>
<span>Checkin:</span><br>
${new Date(booking.checkInDate).toLocaleDateString()} at ${
    booking.property.checkInTime
  }<br>
<br>
<span>Checkout:</span><br>
${new Date(booking.checkOutDate).toLocaleDateString()} at ${
    booking.property.checkOutTime
  }<br>
<br>


<span>Confirmation Code:</span><br>
${booking.confirmationCode}
<br>

<br>
<span>Please complete your guests info to complete reservation using this Link:</span><br>
<a href ="${CONF.DOMAIN}guests-data/${booking._id}"> Click Here</a>`;
};

const sendCreateJournyEmail = (inquiry, citites) => {
  return `
  <h3>New Journy Inquery</h3>
<br>

<span>Name:</span><br>
${inquiry.fullName.first} ${inquiry.fullName.last}<br>
<br>
<span>Email:</span><br>
${inquiry.email}<br>
<br>
<span>Phone:</span><br>
${inquiry.phoneNumber}<br>
<br>
<span>Start date:</span><br>
${new Date(inquiry.startDate).toLocaleDateString()}<br>
<br>
<span>Start date:</span><br>
${new Date(inquiry.startDate).toLocaleDateString()}<br>
<br>
<span>End date:</span><br>
${new Date(inquiry.endDate).toLocaleDateString()}<br>
<br>
<span>Adults:</span><br>
${inquiry.numberOfGuests.adults}
<br>
<span>Childrens:</span><br>
${inquiry.numberOfGuests.childrens}<br>
<br>
<span>Infants:</span><br>
${inquiry.numberOfGuests.infants}<br>
<br>
<span>Targets: </span><br>
${
  citites.length === 0
    ? `<ul>
    <li>No Info</li>
    </ul>
    <br>
    `
    : `<ul>
        ${citites.map((item) => `<li>${item.name}</li>`)}
      </ul>`
}
<br>
<span>Other info:</span><br>
${inquiry.numberOfGuests.infants}<br>
<br>

<span>Budget:</span><br>
${
  inquiry.budget.isSpecific
    ? `Min Price: ${inquiry.budget.minimum}<br>
       Max Price: ${inquiry.budget.maximum}`
    : `No Specifi Budget`
}<br>

<span>Accomodation:</span><br>
${
  inquiry.accomodation
    ? `
    Number of bedrooms: ${inquiry.numberOfBedrooms}<br>
    type: ${inquiry.accomodationType}<br>
    Description: ${inquiry.description}`
    : `No Accomodation`
}<br>
<span>Car:</span><br>
${
  inquiry.isCustomized
    ? `
 Car Type: ${inquiry.vehicle}<br>
 Driver: ${inquiry.driver ? `Yes` : `No`}<br>
 Description: ${inquiry.status}
`
    : `No Car`
}<br>
<br>
`;
};

const sendBookingGuide = (booking, details) => {
  return `<h3>Welcome to Cheez-Hospitality</h3>
    <h2>Here are the details you need for your stay with us</h2>
    <br>

    <a href="${CONF.DOMAIN}staymoredetails/${
    booking.property._id
  }">Click Here</a>

    <br>
    Or You Can Read Here

    <br>

    
    <span>Check-in:</span><br>
    ${new Date(booking.checkInDate).toLocaleDateString()} at ${
    booking.property.checkInTime
  }<br>
    <br>
    <span>Check-out:</span><br>
    ${new Date(booking.checkOutDate).toLocaleDateString()} at ${
    booking.property.checkOutTime
  }<br>
    <br>
    
    
    <span>Address: </span><br>
    <ul>
        <li>Details: ${details.location.textDetails} </li>
        <li>Location Url: <a href="${
          details.location.locationUrl
        }">Click Here</a></li>
        <li>Photo: <a href="${
          details.location.buldingPhoto
        }">Click Here</a></li>
    </ul>
    <br>
    
    <span>Keys: </span><br>
    <ul>
        <li>Details: ${details.keys.instruction} </li>
        <li>Video: <a href="${details.keys.videoUrl}">Click Here</a></li>
        <li>Photo: <a href="${details.keys.photoUrl}">Click Here</a></li>
    </ul>
    <br>

    <span>Parking: </span><br>
    <ul>
        <li>Name: ${details.parking.details} </li>
        <li>Password: ${details.parking.parkingPhoto}</li>
    </ul>
    <br>

    <span>Wifi: </span><br>
    <ul>
        <li>Name: ${details.wifi.name} </li>
        <li>Password: ${details.wifi.password}</li>
    </ul>
    <br>

    <span>Electricity: </span><br>
    <ul>
        <li>Name: ${details.electricity.details} </li>
        <li>Photo: <a href="${
          details.electricity.elecPhoto
        }">Click Here</a></li>
    </ul>
    <br>

    <span>Garbage: </span><br>
    <ul>
        <li>Name: ${details.garbage} </li>
    </ul>
    <br>

    <span>Emergency Info: </span><br>
    <ul>
        <li>Name: ${details.garbage} </li>
    </ul>
    <br>

    <span>House Rules: </span><br>
    <ul>
        <li>Name: ${details.houseRules} </li>
    </ul>
    <br>

    <span>General Information: </span><br>
    <ul>
        <li>Name: ${details.generalInformation} </li>
    </ul>
    <br>

    <h3>Local Conveniences: </h3><br>

    <span>Grocery Stores: </span><br>
    ${
      details.grocertStores.length === 0
        ? `<ul>
        <li>No Info</li>
        </ul>
        <br>
        `
        : details.grocertStores.map(
            (item) => `
        <ul>
        <li>Details: ${item.groceryDetails} </li>
        <li>Location: <a href="${item.link}">Click Here</a></li>
        <li>Phone: ${item.phone} </li>
        </ul>
        <br>
        `
          )
    }
    <br>

    <span>Resturants: </span><br>
    ${
      details.resturants.length === 0
        ? `<ul>
        <li>No Info</li>
        </ul>
        <br>`
        : details.resturants.map(
            (item) => `
        <ul>
        <li>Details: ${item.resturantDetails} </li>
        <li>Location: <a href="${item.link}">Click Here</a></li>
        <li>Phone: ${item.phone} </li>
        </ul>
        <br>
        `
          )
    }
    <br>

    <span>Night Spots: </span><br>
    ${
      details.nightSpots.length === 0
        ? `<ul>
        <li>No Info</li>
        </ul>
        <br>`
        : details.nightSpots.map(
            (item) => `
        <ul>
        <li>Details: ${item.nightSpotDetails} </li>
        <li>Location: <a href="${item.link}">Click Here</a></li>
        <li>Phone: ${item.phone} </li>
        </ul>
        <br>
        `
          )
    }
    <br>

    <span>Entertainment: </span><br>
    ${
      details.entertainment.length === 0
        ? `<ul>
        <li>No Info</li>
        </ul>
        <br>`
        : details.entertainment.map(
            (item) => `
        <ul>
        <li>Details: ${item.entertainmentDetails} </li>
        <li>Location: <a href="${item.link}">Click Here</a></li>
        <li>Phone: ${item.phone} </li>
        </ul>
        <br>
        `
          )
    }
    <br>

    <span>Entertainment: </span><br>
    ${
      details.entertainment.length === 0
        ? `<ul>
        <li>No Info</li>
        </ul>
        <br>`
        : details.entertainment.map(
            (item) => `
        <ul>
        <li>Details: ${item.entertainmentDetails} </li>
        <li>Location: <a href="${item.link}">Click Here</a></li>
        <li>Phone: ${item.phone} </li>
        </ul>
        <br>
        `
          )
    }
    <br>

    <span>transportation: </span><br>
    ${
      details.transportation.length === 0
        ? `<ul>
        <li>No Info</li>
        </ul>
        <br>`
        : details.transportation.map(
            (item) => `
        <ul>
        <li>Details: ${item.transportationDetails} </li>
        <li>Location: <a href="${item.link}">Click Here</a></li>
        <li>Phone: ${item.phone} </li>
        </ul>
        <br>
        `
          )
    }
    <br>
 
    <span>CheckOut Instructions: </span><br>
    <ul>
        <li>Name: ${details.checkOutInstructions} </li>
    </ul>
    <br>
    `;
};

const CheckOutEmail = (booking) => {
  return `we loved having you at ${booking.property.name}.
  Please rate your stay and dont forget to write for us,
  or send us a letter if you have any quesion or complains
  `;
};

const sendCmpleteInfoReminder = (booking) => {
  return `
  <h3>Please Complete Your Guests Info To Complete  Booking:</h3>
<br>
<span>Please complete your guests info to complete reservation using this Link:</span><br>
<a href ="${CONF.DOMAIN}guests-data/${booking._id}"> Click Here</a>`;
};

module.exports = {
  sendConfirmationEmail,
  sendBookingGuide,
  sendCreateJournyEmail,
  sendCmpleteInfoReminder,
  CheckOutEmail,
};
