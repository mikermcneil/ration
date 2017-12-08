module.exports = {


  friendlyName: 'View new password',


  description: 'Display "New password" page.',


  inputs: {

    token: {
      description: 'The password reset token from the email.',
      example: '4-32fad81jdaf$329'
    }

  },


  exits: {

    success: {
      viewTemplatePath: 'pages/entrance/new-password'
    },

    invalidOrExpiredToken: {
      viewTemplatePath: '498',
      description: 'The provided token is expired, invalid, or has already been used.',
    }

  },


  fn: async function (inputs, exits) {

    // If password reset token is missing, display an error page explaining that the link is bad.
    if (!inputs.token) {
      sails.log.warn('Attempting to view new password (recovery) page, but no reset password token included in request!  Displaying error page...');
      return exits.invalidOrExpiredToken();
    }//•

    // Look up the user with this reset token.
    var userRecord = await User.findOne({ passwordResetToken: inputs.token });
    // If no such user exists, or their token is expired, display an error page explaining that the link is bad.
    if (!userRecord || userRecord.passwordResetTokenExpiresAt <= Date.now()) {
      return exits.invalidOrExpiredToken();
    }

    // Grab token input and include it in view locals
    return exits.success({
      token: inputs.token
    });

  }


};
