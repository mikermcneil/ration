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
  methods: {"confirmEmail":{"verb":"GET","url":"/email/confirm"},"logout":{"verb":"GET","url":"/api/v1/account/logout"},"updatePassword":{"verb":"PUT","url":"/api/v1/account/update-password"},"updateProfile":{"verb":"PUT","url":"/api/v1/account/update-profile"},"updateBillingCard":{"verb":"PUT","url":"/api/v1/account/update-billing-card"},"login":{"verb":"PUT","url":"/api/v1/entrance/login"},"signup":{"verb":"POST","url":"/api/v1/entrance/signup"},"sendPasswordRecoveryEmail":{"verb":"POST","url":"/api/v1/entrance/send-password-recovery-email"},"updatePasswordAndLogin":{"verb":"POST","url":"/api/v1/entrance/update-password-and-login"},"claimAccountAndLogin":{"verb":"POST","url":"/api/v1/entrance/claim-account-and-login"},"deliverContactFormMessage":{"verb":"POST","url":"/api/v1/deliver-contact-form-message"},"uploadThing":{"verb":"POST","url":"/api/v1/things"},"destroyOneThing":{"verb":"DELETE","url":"/api/v1/things/:id"},"borrowThing":{"verb":"PUT","url":"/api/v1/things/:id/borrow"},"downloadPhoto":{"verb":"GET","url":"/api/v1/things/:id/photo"},"scheduleReturn":{"verb":"PUT","url":"/api/v1/things/:id/schedule-return"},"updateOneThing":{"verb":"PATCH","url":"/api/v1/things/:id"},"removeFriend":{"verb":"DELETE","url":"/api/v1/friends/:id"},"addFriends":{"verb":"POST","url":"/api/v1/friends"},"approveFriend":{"verb":"PUT","url":"/api/v1/approve-friend"}}
  /* eslint-enable */

});
