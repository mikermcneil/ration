module.exports = {


  friendlyName: 'Update profile',


  description: 'Update the profile for the logged-in user.',


  inputs: {

    fullName: {
      type: 'string'
    },

    emailAddress: {
      type: 'string'
    },

  },


  exits: {

    emailAlreadyInUse: {
      statusCode: 409,
      description: 'The provided email address is already in use.',
    },

  },


  fn: async function (inputs, exits) {

    var newEmailAddress = inputs.emailAddress.toLowerCase();

    // Determine if this request wants to change the current user's email address,
    // revert her pending email address change, modify her pending email address
    // change, or if the email address won't be affected at all.
    var desiredEffectReEmail;// ('changeImmediately', 'beginChange', 'cancelPendingChange', 'modifyPendingChange', or '')
    if (
      newEmailAddress === undefined ||
      (this.req.me.emailStatus !== 'changeRequested' && newEmailAddress === this.req.me.emailAddress)
    ) {
      desiredEffectReEmail = '';
    } else if (this.req.me.emailStatus === 'changeRequested' && newEmailAddress === this.req.me.emailAddress) {
      desiredEffectReEmail = 'cancelPendingChange';
    } else if (this.req.me.emailStatus === 'changeRequested' && newEmailAddress !== this.req.me.emailAddress) {
      desiredEffectReEmail = 'modifyPendingChange';
    } else if (
      !sails.config.custom.verifyEmailAddresses ||
      (this.req.me.emailStatus === 'unconfirmed' && newEmailAddress !== this.req.me.emailAddress)
    ) {
      desiredEffectReEmail = 'changeImmediately';
    } else {
      desiredEffectReEmail = 'beginChange';
    }


    // If the email address is changing, make sure it is not already being used.
    if (_.contains(['beginChange', 'changeImmediately', 'modifyPendingChange'], desiredEffectReEmail)) {
      let conflictingUser = await User.findOne({
        or: [
          { emailAddress: newEmailAddress },
          { emailChangeCandidate: newEmailAddress }
        ]
      });
      if (conflictingUser) {
        throw 'emailAlreadyInUse';
      }
    }


    // Start building the values to set in the db.
    // (We always set the fullName if provided.)
    var valuesToSet = {
      fullName: inputs.fullName,
    };

    switch (desiredEffectReEmail) {

      // Change now
      case 'changeImmediately':
        Object.assign(valuesToSet, {
          emailAddress: newEmailAddress,
          emailChangeCandidate: '',
          emailProofToken: '',
          emailProofTokenExpiresAt: 0,
          emailStatus: this.req.me.emailStatus === 'unconfirmed' ? 'unconfirmed' : 'confirmed'
        });
        break;

      // Begin new email change, or modify a pending email change
      case 'beginChange':
      case 'modifyPendingChange':
        Object.assign(valuesToSet, {
          emailChangeCandidate: newEmailAddress,
          emailProofToken: await sails.helpers.strings.random('url-friendly'),
          emailProofTokenExpiresAt: Date.now() + sails.config.custom.emailProofTokenTTL,
          emailStatus: 'changeRequested'
        });
        break;

      // Cancel pending email change
      case 'cancelPendingChange':
        Object.assign(valuesToSet, {
          emailChangeCandidate: '',
          emailProofToken: '',
          emailProofTokenExpiresAt: 0,
          emailStatus: 'confirmed'
        });
        break;

      // Otherwise, do nothing re: email
    }

    // Save to the db
    await User.update({id: this.req.me.id }).set(valuesToSet);


    // If an email address change was requested, and re-confirmation is required,
    // send the "confirm account" email.
    if (desiredEffectReEmail === 'beginChange' || desiredEffectReEmail === 'modifyPendingChange') {
      await sails.helpers.sendTemplateEmail.with({
        to: newEmailAddress,
        subject: 'Your account has been updated',
        template: 'email-verify-new-email',
        templateData: {
          fullName: inputs.fullName||this.req.me.fullName,
          token: valuesToSet.emailProofToken
        }
      });
    }

    return exits.success();

  }


};
