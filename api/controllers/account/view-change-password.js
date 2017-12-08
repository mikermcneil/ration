module.exports = {


  friendlyName: 'View change password',


  description: 'Display "Change password" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/account/change-password'
    }

  },


  fn: async function (inputs, exits) {

    return exits.success();

  }


};
