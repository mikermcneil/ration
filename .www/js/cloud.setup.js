"use strict";

/**
 * cloud.setup.js
 *
 * Configuration for this Sails app's generated browser SDK ("Cloud").
 *
 * Above all, the purpose of this file is to provide endpoint definitions,
 * each of which corresponds with one particular route+action on the server.
 *
 * > This file was automatically generated.
 * > (To regenerate, run `sails run rebuild-cloud-sdk`)
 */

Cloud.setup({

  /* eslint-disable */
  methods: { "confirmEmail": { "verb": "GET", "url": "/email/confirm", "args": ["token"] }, "logout": { "verb": "GET", "url": "/api/v1/account/logout", "args": [] }, "updatePassword": { "verb": "PUT", "url": "/api/v1/account/update-password", "args": ["password"] }, "updateProfile": { "verb": "PUT", "url": "/api/v1/account/update-profile", "args": ["fullName", "emailAddress"] }, "updateBillingCard": { "verb": "PUT", "url": "/api/v1/account/update-billing-card", "args": ["stripeToken", "billingCardLast4", "billingCardBrand", "billingCardExpMonth", "billingCardExpYear"] }, "login": { "verb": "PUT", "url": "/api/v1/entrance/login", "args": ["emailAddress", "password", "rememberMe"] }, "signup": { "verb": "POST", "url": "/api/v1/entrance/signup", "args": ["emailAddress", "password", "fullName"] }, "sendPasswordRecoveryEmail": { "verb": "POST", "url": "/api/v1/entrance/send-password-recovery-email", "args": ["emailAddress"] }, "updatePasswordAndLogin": { "verb": "POST", "url": "/api/v1/entrance/update-password-and-login", "args": ["password", "token"] }, "claimAccountAndLogin": { "verb": "POST", "url": "/api/v1/entrance/claim-account-and-login", "args": ["password", "fullName", "token"] }, "deliverContactFormMessage": { "verb": "POST", "url": "/api/v1/deliver-contact-form-message", "args": ["emailAddress", "topic", "fullName", "message"] }, "uploadThing": { "verb": "POST", "url": "/api/v1/things", "args": ["photo", "label"] }, "destroyOneThing": { "verb": "DELETE", "url": "/api/v1/things/:id", "args": ["id"] }, "borrowThing": { "verb": "PUT", "url": "/api/v1/things/:id/borrow", "args": ["id", "expectedReturnAt", "pickupInfo"] }, "downloadPhoto": { "verb": "GET", "url": "/api/v1/things/:id/photo", "args": ["id"] }, "scheduleReturn": { "verb": "PUT", "url": "/api/v1/things/:id/schedule-return", "args": ["id", "dropoffInfo"] }, "updateOneThing": { "verb": "PATCH", "url": "/api/v1/things/:id", "args": ["id", "borrowedBy", "expectedReturnAt"] }, "removeFriend": { "verb": "DELETE", "url": "/api/v1/friends/:id", "args": ["id"] }, "addFriends": { "verb": "POST", "url": "/api/v1/friends", "args": ["friends"] }, "approveFriend": { "verb": "PUT", "url": "/api/v1/approve-friend", "args": ["id"] }
    /* eslint-enable */

  } });
