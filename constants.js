module.exports = {
  // pm2 start server.js --update-env --log-date-format="YYYY-MM-DD HH:mm Z"
  // pm2 reload server.js  --update-env

  //config_localhost: {
  //  port: 3400,
  //  server_address: "127.0.0.1",
  //  port_mongo: 27017,
  //  MongoDB: "18.157.86.136",
  //  username: "admin",
  //  password: "2z8b71!98&hKL#9S",
  //  database_name: "cheez_db",
  //  env_var: "L",
  //  email: "google-analytics@cheezwebsite.iam.gserviceaccount.com",
  //  private_key:
  //    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDUPHl360Cr3HU8\nf5RpAa24utnyWVmYUWum4rEBX02/oUqh4w8Oz2YU0qt8x3U/q5/dk24YrN/3/U1n\nKwAATU3iNGUxFDnQHUWR6yrvm8IhTQp9HH+xeaaiqwcPdUTQ4ffEieVoXHVhNTee\ny0Rb2fyYmHJSW+kXPCDHDLjdhFgj0NOGfrINuL4v43F3QaCY1FzZ8MKZEiDQbje6\nCwBxSeITHJh2f93SlRacnqQ8PsvZZXG9SLi+RDokvJAxyH+gZvDLvy6JQlTtwRtv\neMNJdPwEYTZHg0+km34sdbFMTkacLZFvm1wPdWnq24nHzugEgXL48tNXLS3AZBC3\nGpC1MQODAgMBAAECggEABLiYU8sSDrX3jlIg3oRw4ALutd3inilIKu0Fq/akl5vX\nuanVMWqlUNbuL/c4i/iI31htYrN3GKCerVSptNgDYKydXaNKCppEFxQIn04zL3jJ\nFXG3WMl7I/OIU4Hedy5iS7xs3nlEC9avtzgP/A0UJImA7YUUNnXvcri9OgGSJlsZ\n92I6aXBd2VOvLt/LraCkzifABYn/7snN5Fgad+90W/f4gIfrGaJEMtgkYJxtbFAD\n377R+NHUk4IZfldUgGGEHzeBIIHL+fDt1urACgj3FnLj0eodBFG6059/hQsrpXcs\n6Lb4XXJUGty1b88bJiBwprsmQC9yT3/tgfacVYN80QKBgQDuQ5I1l3+kcHN339FS\n3Hi4e+RxZ9Hl9QCqW8FsO+PV8i6PlN593DV90tAjamLZ2sZyDpN+6eN73OdExYoD\nkjj+3qjaCRYKGwWdRPfyO1KgViq9OjmHLdj1BVz4Fit8mZSbHZ959Dxlea2NqR8v\nK4LG/0GXbkuqApdj41Y1jI100QKBgQDkCOlNfOfVZ3vTkC8lTVH+5ZMettoQKg51\n9TCWoYZsdd0fl6grzJL1/B2aS9mKFVBiNWQAJhFrErYu7VBk/C1UdQLWF/7I5McQ\nCAo71JCdhHtSErbftsDQCM56EyhRBmd+UJmthyBHDMvyIvsuI41M6i+63tY/WnvA\nBC70FlHYEwKBgDHkDkqQhZbOQS95u2ApcFHZB3XDsoz/Z3tEqVTbmZKkGqHQH2Kl\naMIHEbRIw5gwmlspuDLcENlP4VFiN8sVpD+iKiM1wdqt29gZp/2d9GhEgsCK357x\nt7teux/rrIFzu01bv5gOz1LETtYZ8sCy0LiQnJBz9P4Netvcr6GY48nxAoGALZ2y\nvfN8lO4MkTfIlpevDWRzV7OQT6d6GRKhU6CgOVYik81MsOZNh7OVYGZH8B1vZRX1\nGSqEVXz6wMxsRqdDkh+OH7HRH/LT91sEYQ+WlkwIN1TTDFGMpJD+bOEkMYEsdtI8\ny7+6LzxaF+fzgzlNbNN0FNe62BWLp8+ubNmCKc0CgYBe7wBZzGhEjA2+/cQxlX2+\nqAOYF4gPcrRe+VXPcx9Xg2H81dy7b+h1MOGxyJ9e4OXYkuyi0P4/tUFDdjr8JSFk\nDM+bKFvulhHUEecolTIkwdjW68U+tUy6uEJc+GtMijDgoYQh0WnoOxvypkwBf0bY\nGxsb7Oeb8EiDDsGEzIqnBQ==\n-----END PRIVATE KEY-----\n",
  //},

  config_localhost: {
    host: 'cheez-db.cluster-c2i1kaohxa2u.eu-central-1.rds.amazonaws.com',
    user: 'cheez',
    passwordSql: 'asnj4k34ncjn3#asd4',
    database: 'cheez-app',
    port: 3200,
    server_address: "127.0.0.1",
    port_mongo: 27017,
    MongoDB: "localhost",
    username: "",
    password: "",
    database_name: "cheez_db",
    env_var: "L",
    email: "google-analytics@cheezwebsite.iam.gserviceaccount.com",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDUPHl360Cr3HU8\nf5RpAa24utnyWVmYUWum4rEBX02/oUqh4w8Oz2YU0qt8x3U/q5/dk24YrN/3/U1n\nKwAATU3iNGUxFDnQHUWR6yrvm8IhTQp9HH+xeaaiqwcPdUTQ4ffEieVoXHVhNTee\ny0Rb2fyYmHJSW+kXPCDHDLjdhFgj0NOGfrINuL4v43F3QaCY1FzZ8MKZEiDQbje6\nCwBxSeITHJh2f93SlRacnqQ8PsvZZXG9SLi+RDokvJAxyH+gZvDLvy6JQlTtwRtv\neMNJdPwEYTZHg0+km34sdbFMTkacLZFvm1wPdWnq24nHzugEgXL48tNXLS3AZBC3\nGpC1MQODAgMBAAECggEABLiYU8sSDrX3jlIg3oRw4ALutd3inilIKu0Fq/akl5vX\nuanVMWqlUNbuL/c4i/iI31htYrN3GKCerVSptNgDYKydXaNKCppEFxQIn04zL3jJ\nFXG3WMl7I/OIU4Hedy5iS7xs3nlEC9avtzgP/A0UJImA7YUUNnXvcri9OgGSJlsZ\n92I6aXBd2VOvLt/LraCkzifABYn/7snN5Fgad+90W/f4gIfrGaJEMtgkYJxtbFAD\n377R+NHUk4IZfldUgGGEHzeBIIHL+fDt1urACgj3FnLj0eodBFG6059/hQsrpXcs\n6Lb4XXJUGty1b88bJiBwprsmQC9yT3/tgfacVYN80QKBgQDuQ5I1l3+kcHN339FS\n3Hi4e+RxZ9Hl9QCqW8FsO+PV8i6PlN593DV90tAjamLZ2sZyDpN+6eN73OdExYoD\nkjj+3qjaCRYKGwWdRPfyO1KgViq9OjmHLdj1BVz4Fit8mZSbHZ959Dxlea2NqR8v\nK4LG/0GXbkuqApdj41Y1jI100QKBgQDkCOlNfOfVZ3vTkC8lTVH+5ZMettoQKg51\n9TCWoYZsdd0fl6grzJL1/B2aS9mKFVBiNWQAJhFrErYu7VBk/C1UdQLWF/7I5McQ\nCAo71JCdhHtSErbftsDQCM56EyhRBmd+UJmthyBHDMvyIvsuI41M6i+63tY/WnvA\nBC70FlHYEwKBgDHkDkqQhZbOQS95u2ApcFHZB3XDsoz/Z3tEqVTbmZKkGqHQH2Kl\naMIHEbRIw5gwmlspuDLcENlP4VFiN8sVpD+iKiM1wdqt29gZp/2d9GhEgsCK357x\nt7teux/rrIFzu01bv5gOz1LETtYZ8sCy0LiQnJBz9P4Netvcr6GY48nxAoGALZ2y\nvfN8lO4MkTfIlpevDWRzV7OQT6d6GRKhU6CgOVYik81MsOZNh7OVYGZH8B1vZRX1\nGSqEVXz6wMxsRqdDkh+OH7HRH/LT91sEYQ+WlkwIN1TTDFGMpJD+bOEkMYEsdtI8\ny7+6LzxaF+fzgzlNbNN0FNe62BWLp8+ubNmCKc0CgYBe7wBZzGhEjA2+/cQxlX2+\nqAOYF4gPcrRe+VXPcx9Xg2H81dy7b+h1MOGxyJ9e4OXYkuyi0P4/tUFDdjr8JSFk\nDM+bKFvulhHUEecolTIkwdjW68U+tUy6uEJc+GtMijDgoYQh0WnoOxvypkwBf0bY\nGxsb7Oeb8EiDDsGEzIqnBQ==\n-----END PRIVATE KEY-----\n",
  },

  config_development: {
    server_address: "3.122.242.175",
    port: 3400,
    port_mongo: 27017,
    MongoDB: "18.157.86.136",
    username: "admin",
    password: "2z8b71!98&hKL#9S",
    database_name: "cheez_db",
    env_var: "D",
    email: "google-analytics@cheezwebsite.iam.gserviceaccount.com",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDUPHl360Cr3HU8\nf5RpAa24utnyWVmYUWum4rEBX02/oUqh4w8Oz2YU0qt8x3U/q5/dk24YrN/3/U1n\nKwAATU3iNGUxFDnQHUWR6yrvm8IhTQp9HH+xeaaiqwcPdUTQ4ffEieVoXHVhNTee\ny0Rb2fyYmHJSW+kXPCDHDLjdhFgj0NOGfrINuL4v43F3QaCY1FzZ8MKZEiDQbje6\nCwBxSeITHJh2f93SlRacnqQ8PsvZZXG9SLi+RDokvJAxyH+gZvDLvy6JQlTtwRtv\neMNJdPwEYTZHg0+km34sdbFMTkacLZFvm1wPdWnq24nHzugEgXL48tNXLS3AZBC3\nGpC1MQODAgMBAAECggEABLiYU8sSDrX3jlIg3oRw4ALutd3inilIKu0Fq/akl5vX\nuanVMWqlUNbuL/c4i/iI31htYrN3GKCerVSptNgDYKydXaNKCppEFxQIn04zL3jJ\nFXG3WMl7I/OIU4Hedy5iS7xs3nlEC9avtzgP/A0UJImA7YUUNnXvcri9OgGSJlsZ\n92I6aXBd2VOvLt/LraCkzifABYn/7snN5Fgad+90W/f4gIfrGaJEMtgkYJxtbFAD\n377R+NHUk4IZfldUgGGEHzeBIIHL+fDt1urACgj3FnLj0eodBFG6059/hQsrpXcs\n6Lb4XXJUGty1b88bJiBwprsmQC9yT3/tgfacVYN80QKBgQDuQ5I1l3+kcHN339FS\n3Hi4e+RxZ9Hl9QCqW8FsO+PV8i6PlN593DV90tAjamLZ2sZyDpN+6eN73OdExYoD\nkjj+3qjaCRYKGwWdRPfyO1KgViq9OjmHLdj1BVz4Fit8mZSbHZ959Dxlea2NqR8v\nK4LG/0GXbkuqApdj41Y1jI100QKBgQDkCOlNfOfVZ3vTkC8lTVH+5ZMettoQKg51\n9TCWoYZsdd0fl6grzJL1/B2aS9mKFVBiNWQAJhFrErYu7VBk/C1UdQLWF/7I5McQ\nCAo71JCdhHtSErbftsDQCM56EyhRBmd+UJmthyBHDMvyIvsuI41M6i+63tY/WnvA\nBC70FlHYEwKBgDHkDkqQhZbOQS95u2ApcFHZB3XDsoz/Z3tEqVTbmZKkGqHQH2Kl\naMIHEbRIw5gwmlspuDLcENlP4VFiN8sVpD+iKiM1wdqt29gZp/2d9GhEgsCK357x\nt7teux/rrIFzu01bv5gOz1LETtYZ8sCy0LiQnJBz9P4Netvcr6GY48nxAoGALZ2y\nvfN8lO4MkTfIlpevDWRzV7OQT6d6GRKhU6CgOVYik81MsOZNh7OVYGZH8B1vZRX1\nGSqEVXz6wMxsRqdDkh+OH7HRH/LT91sEYQ+WlkwIN1TTDFGMpJD+bOEkMYEsdtI8\ny7+6LzxaF+fzgzlNbNN0FNe62BWLp8+ubNmCKc0CgYBe7wBZzGhEjA2+/cQxlX2+\nqAOYF4gPcrRe+VXPcx9Xg2H81dy7b+h1MOGxyJ9e4OXYkuyi0P4/tUFDdjr8JSFk\nDM+bKFvulhHUEecolTIkwdjW68U+tUy6uEJc+GtMijDgoYQh0WnoOxvypkwBf0bY\nGxsb7Oeb8EiDDsGEzIqnBQ==\n-----END PRIVATE KEY-----\n",
  },

  beirutTimezone: 3,
  //ENVIRONMENT_VAR: "D",
  ENVIRONMENT_VAR: "L",
  secret_jwt: "9LRnqXTG${W[=",
  MAINTENANCE: "F",
  algorithm: "aes-256-ctr",
  password: "d6F3Efeq",
  twilio: {
    accountSID: "AC71bb039499564eefaae685b0f8d59349",
    authTOKEN: "b69f5932080746dfae36a513dd4b2126",
    phone: "+19206545462",
  },
  google: {
    CLIENT_ID_WEB:
      "864179586667-lsvtjefoidqlkt59hhnmkc4bdppjkv61.apps.googleusercontent.com",
    CLIENT_ID_IOS:
      "864179586667-7f2mmhajn6ag4r4bbrnb6jtnhpfpfra1.apps.googleusercontent.com",
    CLIENT_ID_ANDROID:
      "864179586667-io6a2631s64phhcdcllcsmku35elip4t.apps.googleusercontent.com",
  },

  apple: {
    CLIENT_ID: "com.cnepho.cheez",
  },

  mailGun: {
    API_KEY: "b4c0e07bcc40731cccb79845e56f7ffd-fe066263-52d7b437",
    DOMAIN: "cheezhospitality.com",
  },

  firebase_messaging_serverKey:
    "AAAAyTUeBms:APA91bFKTuSMwF0lU099EB8Yrv2gXt5RoyDM3b9Y2CsITUTU1mmqEVpsW3d-pM70tg1opOm6hykCKULLf4Ow-XOSsKkmv8uzVKttpOgG8FW59G0wSt0UA6XJvFQX7I-bBx7pWnxwpvR4",

  firebase_messaging_sender_ID: "864179586667",

  stripe: {
    API_KEY:
      "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",
    //"pk_live_51HICZBI64U9GKjxplnJTrMwPwdnHXsDjO8Rl4x9gamzeSqYUzIwWzXkmrUi8MtlUteQPB3RRPlYIWYGEZnzMMXV500azNLW1Ch",
    // "sk_test_51HICZBI64U9GKjxpOiifaPNWYEG0qc3LcN4rGAg9n2AMvyIIz8UUNNvOsT4l9qxJjs5kDQEgJBH3I9ewU3pKL9vA00EzkxyNMg",
  },

  //DOMAIN: "http://5.135.70.10",

  DOMAIN: "https://www.cheezhospitality.com/",
  DOMAIN_PORT: "https://18.156.33.115:3200/",

  AWS: {
//	      ID: "AKIA3UDJCREEIS76PWZD",
//	      SECRET: "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",
	  ID: "AKIA3UDJCREEPWQQIFN4",
	  SECRET: "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",
	  BUCKET_NAME: "cheez-app",
    REGION: "us-east-1",
  },

  EMAIL: "info@cheezhospitality.com",
};

//user for cnepho server
//db.createUser(
//  {
//    user: "yaman",
//    pwd: "123456",
//    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
//  }
//)
