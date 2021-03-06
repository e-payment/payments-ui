import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import { Provider } from 'react-redux';

import { createReduxStore } from 'data-store';
import PayMethodChoice from 'components/pay-method-choice';
import ProductPayChooser from 'views/transaction/product-pay-chooser';


describe('ProductPayChooser', function() {

  var fakePaymentProcessor;
  var payWithNewCardSpy;
  var defaultProductId = 'mozilla-concrete-brick';
  var userDefinedAmount = '10.00';
  var savedVisa = {provider_id: '3vr3ym', type_name: 'Visa'};
  var store;

  beforeEach(function() {
    store = createReduxStore();
    fakePaymentProcessor = sinon.spy();
    payWithNewCardSpy = sinon.spy();
  });

  function mountView({productId=defaultProductId} = {}) {
    var container = TestUtils.renderIntoDocument(
      <Provider store={store}>
        {() => {
          return (
            <ProductPayChooser
              userDefinedAmount={userDefinedAmount}
              payMethods={[savedVisa]}
              payWithNewCard={payWithNewCardSpy}
              processPayment={fakePaymentProcessor}
              productId={productId} />
          );
        }}
      </Provider>
    );

    return TestUtils.findRenderedComponentWithType(
      container, ProductPayChooser
    );
  }

  it('should handle payment processing', function() {
    var View = mountView();
    var chooser = TestUtils.findRenderedComponentWithType(
      View, PayMethodChoice
    );

    chooser.props.submitHandler(savedVisa);

    assert.equal(fakePaymentProcessor.called, true);
    var args = fakePaymentProcessor.firstCall.args;
    assert.equal(args[0].userDefinedAmount, userDefinedAmount);
    assert.equal(args[0].productId, defaultProductId);
    assert.equal(args[0].payMethodUri, savedVisa);
  });

  it('should show payMethod choice', function() {
    var View = mountView();
    var chooser = TestUtils.findRenderedComponentWithType(
      View, PayMethodChoice
    );
    assert.deepEqual(chooser.props.payMethods, [savedVisa]);
  });

  it('should request to pay with new card when clicking link', function() {
    var View = mountView();
    var addLink = TestUtils.findRenderedDOMComponentWithTag(
      View, 'a');
    TestUtils.Simulate.click(addLink);
    assert.ok(payWithNewCardSpy.called);
  });

  it('should prompt for donation', function() {
    var View = mountView({productId: 'mozilla-foundation-donation'});
    var chooser = TestUtils.findRenderedComponentWithType(
      View, PayMethodChoice
    );
    assert.equal(chooser.props.submitButtonText, 'Donate now');
  });

  it('should prompt for recurring donation', function() {
    var View = mountView({productId: 'mozilla-foundation-recurring-donation'});
    var chooser = TestUtils.findRenderedComponentWithType(
      View, PayMethodChoice
    );
    assert.equal(chooser.props.submitButtonText, 'Donate now');
  });

});
