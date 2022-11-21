var enumerator = require('../Models/Enumerator');

adminAllowedRoutes = [
        //propertyController
        'POST/v1/properties',
        'PUT/v1/properties',
        'GET/v1/properties',
        'DELETE/v1/properties',
        'DELETE/v1/properties/:id',
        
        //propertyCategoriesContoller
        'POST/v1/propertycategories',
        'PUT/v1/propertycategories',
        'GET/v1/propertycategories',
        'GET/v1/propertycategories/:id',

        //Bath
        'POST/v1/bathrooms',
        'GET/v1/bathrooms',
        'PUT/v1/bathrooms',

        //beds
        'POST/v1/beds',
        'GET/v1/beds',
        'PUT/v1/beds',

        //Country
        'POST/v1/countries',
        'GET/v1/countries',
        'PUT/v1/countries',
        'DELETE/v1/countries',

        //City
        'POST/v1/cities',
        'GET/v1/cities',
        'PUT/v1/cities',
        'DELETE/v1/cities',

        //Area
        'POST/v1/areas',
        'GET/v1/areas',
        'PUT/v1/areas',
        'DELETE/v1/areas',

        //Currency
        'POST/v1/currencies',
        'GET/v1/currencies',
        'PUT/v1/currencies',

        //amenities
        'POST/v1/amenities',
        'GET/v1/amenities',
        'PUT/v1/amenities',
        'DELETE/v1/amenities',

        //Highlight
        'POST/v1/highlight',
        'GET/v1/highlight',
        'PUT/v1/highlight',
        'DELETE/v1/highlight',

        //tourController
        'POST/v1/tours',
        'GET/v1/tours',
        'GET/v1/tours/:id',
        'DELETE/v1/tours',
        'DELETE/v1/tours/:id',

        //propertyBookingController
        'GET/v1/propertyBooking',
        'GET/v1/propertyBooking/:id',
        'POST/v1/propertyBooking',

        //tourBookingController
        'GET/v1/tourBooking',
        'GET/v1/tourBooking/:id',
        'POST/v1/tourBooking',

        //productController
        'POST/v1/products',
        'GET/v1/products',
        'GET/v1/products/:id',
        'PUT/v1/products/:id',
        'DELETE/v1/products',
        'DELETE/v1/products/:id',

        //productSupplierController
        'POST/v1/productSupplier',
        'GET/v1/productSupplier',
        'GET/v1/productSupplier/:id',

        //blogController
        'POST/v1/blogs',
        'GET/v1/blogs',
        'GET/v1/blogs/:id',
        'POST/v1/blogs/:id',
        'DELETE/v1/blogs',
        'DELETE/v1/blogs/:id',

        //blogController
        'POST/v1/careers',
        'PUT/v1/careers/:id',
        'PUT/v1/careers',
        'GET/v1/careers',
        'GET/v1/careers/:id',
        'DELETE/v1/careers',
        'DELETE/v1/careers/:id',

        //adminController
        'POST/v1/admin',
        'GET/v1/admin',
        'PUT/v1/admin/:id',
        'PUT/v1/admin',
        'PUT/v1/admin/:id',
        'GET/v1/admin/:id',
        'GET/v1/admin/token/:token',
        'DELETE/v1/admin',
        'DELETE/v1/admin/:id',

        //teamController
        'POST/v1/team',
        'GET/v1/team',
        'PUT/v1/team/:id',
        'PUT/v1/team/:id',
        'GET/v1/team/:id',
        'DELETE/v1/team/:id',
        'DELETE/v1/team',

        //companiesController
        'POST/v1/companies',
        'GET/v1/companies',
        'PUT/v1/companies/:id',
        'PUT/v1/companies',
        'GET/v1/companies/:id',
        'DELETE/v1/companies/:id',
        'DELETE/v1/companies',

        //storyController
        'POST/v1/story',
        'GET/v1/story',
        'PUT/v1/story',

        //rateController
        'POST/v1/rate',
        'GET/v1/rate',
        'PUT/v1/rate',

        //TermsController
        'GET/v1/terms',
        'PUT/v1/terms',


        //CollectionController
        'GET/v1/counts',

        //propertyInquiryController
        'GET/v1/propertyInquiry',
        'GET/v1/propertyInquiry/:id',
        'POST/v1/propertyInquiry',
        'PUT/v1/propertyInquiry',
        'DELETE/v1/propertyInquiry',

        //tourInquiryController
        'GET/v1/tourInquiry',
        'GET/v1/tourInquiry/:id',
        'POST/v1/tourInquiry',
        'PUT/v1/tourInquiry',
        'DELETE/v1/tourInquiry',

        //guesthouseController
        'POST/v1/guesthouses',
        'GET/v1/guesthouses',
        'PUT/v1/guesthouses/:id',
        'POST/v1/guesthouses/:id',
        'DELETE/v1/guesthouses/:id',
        'DELETE/v1/guesthouses',
        
        //packageController
        'POST/v1/packages',
        'GET/v1/packages',
        'GET/v1/packages/:id',
        'POST/v1/packages/:id',
        'DELETE/v1/packages/:id',
        'DELETE/v1/packages',

         //googleApiController
         'GET/v1/analytics',

         //calendarController
         'GET/v1/calendardata',
         'POST/v1/calendardata',
         'POST/v1/calendardata/properties/hold',
         'PUT/v1/calendardata',
         'DELETE/v1/calendardata',

         //tourInquiryController
        'GET/v1/customTourInquiry',
        'GET/v1/customTourInquiry/:id',
        'POST/v1/customTourInquiry',
        'PUT/v1/customTourInquiry',

    ],

    clientAllowedRoutes = [
        //propertyController
        //'GET/v1/properties',
        //'GET/v1/properties/:id',

        //tourController
        'GET/v1/tours',
        'GET/v1/tours/:id',

        //propertyBookingController
        'GET/v1/propertyBooking',
        'GET/v1/propertyBooking/:id',
        'POST/v1/propertyBooking',

        //tourBookingController
        'GET/v1/tourBooking',
        'GET/v1/tourBooking/:id',
        'POST/v1/tourBooking',

        //productController
        'GET/v1/products',
        'GET/v1/products/:id',

        //productSupplierController
        'GET/v1/productSupplier',
        'GET/v1/productSupplier/:id',

        //propertyInquiryController
        'GET/v1/propertyInquiry',
        'GET/v1/propertyInquiry/:id',
        'POST/v1/propertyInquiry',

        //tourInquiryController
        'GET/v1/tourInquiry',
        'GET/v1/tourInquiry/:id',
        'POST/v1/tourInquiry',
    ]




checkPermission = function checkPermission(user, req) {
    console.log(req.method + req.baseUrl)
    console.log("checking permission for user: ", user.fullName);
    var userRole = user.role;
    var havePermission = false;
    if (userRole) {
        if (userRole == enumerator.userRole.ADMIN) {
            adminAllowedRoutes.forEach(element => {
                if (element === req.method + req.baseUrl) {
                    havePermission = true;
                }
            });
        } else if (userRole == enumerator.userRole.CLIENT) {
            clientAllowedRoutes.forEach(element => {
                if (element === req.method + req.baseUrl) {
                    havePermission = true;
                }
            });
        }
    }

    return havePermission;
}
exports.checkPermission = checkPermission;