
adminAllowedRoutes = [],
guestAllowedRoutes = [],
userAllowedRoutes = []


checkPermission = function checkPermission(user, req) {
    console.log("checking permission for user: ", user.fullName);
    var userRole = user.role;
    var havePermission = false;
    if(userRole){
        if (userRole == 1) {
            adminAllowedRoutes.forEach(element => {
                if (element === req.method + req.baseUrl) {
                    havePermission = true;
                }
            });
        }
        else if (userRole == 2) {
            console.log("SHOULD BE HERE");
            partnerAllowedRoutes.forEach(element => {
                if (element === req.method + req.baseUrl) {
                    havePermission = true;
                }
            });
        }
    }
    
    return havePermission;
}
exports.checkPermission = checkPermission;