module.exports = {


  friendlyName: 'View things',


  description: 'Display "Things" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/things/things'
    }

  },


  fn: async function (inputs, exits) {

    // Respond with view.
    return exits.success({
      currentSection: 'things'
    });

  }


};
