import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

import './../styles/checkout.module.css'

export default function CheckoutForm(props) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Change isPayed to true
    fetch('/api/orders', {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${props.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ billId: props.billId, role: 'user' }),
    }).then(res => res.json()).then(res => console.log('resultado: ', res))

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occured.");
    }

    setIsLoading(false);
  };

  const goBack = () => {
    router.push({
      pathname: `/`,
      query: { redirect_status: 'cancelled' },
    },
      '/');
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} style={{color: "white"}}>
      <Container style={{backgroundColor: "#202630", width: "45vw", marginLeft: "30vw", marginTop: "25vh", color: "white"}}>
      <br/>
      <br/>
        <Row>
          <Col style={{color: "white"}}><PaymentElement id="payment-element" /></Col>
        </Row>
        <br/>
        <Row>
          <Col>
            <Button type="submit" variant="primary" disabled={isLoading || !stripe || !elements} id="submit">
              <span id="button-text">
                {isLoading ? <div className="spinner" id="spinner"></div> : "Paga ahora"}
              </span>
            </Button>
          </Col>
          <br/>
          <Col>
            <Button variant="danger" onClick={goBack}>Cancelar</Button>
          </Col>
        </Row>
        <br/>
      </Container>

      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}