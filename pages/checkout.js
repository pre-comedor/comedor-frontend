import { useRouter } from "next/router";
import React, { useState, useEffect, useContext } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";
import AuthContext from '../context/authContext';

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// loadStripe is initialized with a fake API key.
const stripePromise = loadStripe("pk_test_51JoWSEBRTpO3u3NE9725VJ4hgW8mDQM25unYxqNh7lC5SZfqKGQIkne1UPdL7Zi16t80mcsstnhHha0m0YlkMyl900VHTkHBcB");

export default function checkout(props) {
  const router = useRouter();
  const ids = router.query.ids;
  const customerName = router.query.name;
  const billId = router.query.billId;
  const dishNames = router.query.dishNames;
  const [clientSecret, setClientSecret] = useState("");
  const { session } = useContext(AuthContext);

  useEffect(() => {
    // console.log(ids)
    let customerRealName = session.name;

    if (customerName !== undefined && customerName !== null && customerName !== "") {
      customerRealName = customerName;
    }

    // Create PaymentIntent as soon as the page loads
    fetch('/api/checkout', {
      method: "POST",
      headers: {
        Authorization: `${session.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ids,
        customer: customerRealName,
        email: session.email,
        billId,
        dishNames
      }),
    })
      .then((res) => res.json())
      //   .then((res) => {console.log(res)})
      .then((res) => handleResult(res));
  }, []);

  const handleResult = (res) => {
    if (res.error) {
      console.log(res.error);
      return;
    } else {
      setClientSecret(res.data.clientSecret);
    }
  }

  const appearance = {
    theme: 'night',
    labels: 'floating'
  };
  const options = {
    clientSecret,
    appearance,
  };



  return (
    <div className="App">
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm ids={ids} billId={billId} customerName={customerName} token={session.token} />
        </Elements>
      )}
    </div>
  );
}
