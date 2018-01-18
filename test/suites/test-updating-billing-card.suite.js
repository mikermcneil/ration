describe('updating billing card', ()=>{

  // Before we begin, make sure we're completely logged out.
  // And go ahead and log out after we finish this entire suite
  // (or even if we fail a test along the way and bail because of that.)
  before(async()=>{ await Cloud.logout(); });
  after(async()=>{ await Cloud.logout(); });


  describe('as Ryan Dahl', ()=>{

    before(async()=>{
      await Cloud.login('admin@example.com','abc123');
    });
    after(async()=>{ await Cloud.logout(); });

    describe('updating billing card with a no-op change', ()=>{
      it('should respond with 200', async ()=>{
        await Cloud.updateBillingCard();
      });
    });

    describe('updating billing card with a few changes', ()=>{
      it('should respond with 200', async ()=>{
        await Cloud.updateBillingCard.with({
          // This is a fake stripe.js token
          // (See the 2nd tab in the table at https://stripe.com/docs/testing#cards)
          stripeToken: 'tok_visa',
          // The rest of this info just mimics info from a valid card:
          billingCardLast4: 4242,
          billingCardBrand: 'Visa',
          billingCardExpMonth: '01',
          billingCardExpYear: String( (new Date()).getFullYear() + 4 )
        });
      });
    });

  });//</as Ryan Dahl>

});
