import Image from 'next/image';
import { BsFillTrashFill, BsCheck, BsFlagFill } from 'react-icons/bs';
import { Modal, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { useState, useEffect, useContext, memo } from 'react';
import { useRouter } from 'next/router';
import AuthContext from '../context/authContext';
// import ParamsContext from '../context/paramsContext';
import 'react-toastify/dist/ReactToastify.css';
const classes = require('./../styles/menu.module.css');
import SearchBar from './NavigationItems/SearchBar';

export default memo(function SellCards(props) {
  const router = useRouter();
  let [filterObject = [...props.items], setFilterObject] = useState();
  const { session } = useContext(AuthContext);
  // const {params} = useContext(ParamsContext);
  const [customerName, setCustomerName] = useState();
  const [billId, setBillId] = useState();
  const [balance, setBalance] = useState(0);
  const [dishNames, setDishNames] = useState();
  let [counterDish, setCounterDish] = useState(0);
  let [counterPrice, setCounterPrice] = useState(0);
  let [dishes] = useState([]);
  let Today_date = new Date();
  let day = Today_date.getDay();
  const week = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado',
  ];
  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false)
    setCounterDish(0),
      setCounterPrice(0)
  };
  const handleShow = () => setShow(true);

  useEffect(() => {
    props.items.map((el) => {
      window['counter_' + el.id] = 0;
      window['name_' + el.id] = el.name;
      window['price_' + el.id] = el.price;
    });

    if (session !== '') {
      fetch(`/api/getBalance?id=${session._id}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${session.token}`,
          // 'url': params.local_backend_nodejs
        },
      })
        .then((res) => res.json())
        // .then((res) => console.log(res))
        .then((res) => {
          setBalance(res.data.record.balance)
        })
    }
  }, [props]);

  const setNewFilteredObject = (obj) => {
    setFilterObject(obj);
  };

  const upCounter = (id, price) => {
    dishes.push(id);
    window['counter_' + id] = window['counter_' + id] * 1 + 1;
    document.getElementById(`counter_${id}`).innerHTML =
      document.getElementById(`counter_${id}`).innerHTML * 1 + 1;
    setCounterDish(counterDish * 1 + 1);
    setCounterPrice(counterPrice * 1 + price);
  };

  const lowerCounter = (id, price) => {
    //Validating the amount to avoid going to negative numbers
    if (window['counter_' + id] * 1 > 0) {
      // lower the number in the label of total amount in a single dish
      window['counter_' + id] = window['counter_' + id] * 1 - 1;
      document.getElementById(`counter_${id}`).innerHTML =
        window['counter_' + id] * 1;
      setCounterDish(counterDish * 1 - 1);
      setCounterPrice(counterPrice * 1 - price);
    } else {
      document.getElementById(`counter_${id}`).innerHTML = 0;
    }
  };

  const addDishesToBill = (billId) => {
    let dishesToAdd = [];
    for (let id of dishes) {

      if (document.getElementById(`counter_${id}`).innerHTML > 0) {
        dishesToAdd.push(`${document.getElementById(`counter_${id}`).innerHTML} platos de ${window['name_' + id]}`);
      }

      fetch(`/api/addDishesToBill`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bill: billId,
          dish: id,
          name: window['name_' + id],
          price: window['price_' + id],
          amount: document.getElementById(`counter_${id}`).innerHTML,
          day: week[day],
          // url: params.local_backend_nodejs
        }),
      }).then((res) => res.json());
      // .then((res) => console.log(res));

      // POST dish info to /api/spreedsheet
      if (window['price_' + id] !== '' && window['price_' + id] !== null) {
        fetch(`/api/spreedsheet`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify({
            id,
            name: window['name_' + id],
            price: window['price_' + id],
            amount: document.getElementById(`counter_${id}`).innerHTML,
            day: week[day],
            dayTime: `${Today_date.getHours()}:${Today_date.getMinutes()}`,
            createdAt: Today_date.toISOString()
              .split('T')[0]
              .split('-')
              .reverse()
              .join('-'),
          })
        }).then((res) => res.json());
      }
      document.getElementById(`counter_${id}`).innerHTML = 0;
      // // lower the number in the label of total dishes
      document.getElementById('totalDishes').innerHTML = 0;
      // lower the number in the label of total price
      document.getElementById('totalPrice').innerHTML = 0;
    }
    if (session.role !== 'admin') {
      setDishNames(dishesToAdd);
      handleShow()
    }
  };

  const goToCheckout = () => {
    // console.log(dishes);
    router.push({
      pathname: `/checkout`,
      query: { ids: dishes, customer: customerName, billId, dishNames },
    },
      '/checkout');

    setCounterDish(0);
    setCounterPrice(0);
  }

  const goToCheckoutBitcoin = () => {
    // console.log(dishNames);
    router.push({
      pathname: `/bitcoinCheckout`,
      query: { ids: dishes, customer: customerName, billId, amount: counterPrice, dishNames },
    },
      '/checkout');
    setCounterDish(0);
    setCounterPrice(0);
  }

  const checkIfLogin = (fiado, token, msg) => {
    if (session === null || session === '') {
      router.push({
        pathname: '/login',
        query: { page: '/menu/sell' },
      });
    } else {
      if (session.role === 'admin') {
        processSell(fiado, msg, 'Completed');
      } else {
        processSell(fiado, msg, 'Pending');
      }
    }
  };

  const processSell = (fiado, msg, stat) => {
    if (counterPrice < 0 || counterDish < 1) {
      toast.error('No ha seleccionado platos para facturar');
    } else {
      if (fiado && (customerName === null || customerName === '')) {
        toast.error(
          'No ha ingresado el nombre del cliente a quien le fiara el plato'
        );
      } else if (session.balance > 9) {
        toast.error(
          'No se puede fiar esta orden, su saldo es negativo'
        );
      } else {
        fetch(`/api/processSell`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            Authorization: `Bearer ${session.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            totalPrice: counterPrice,
            totalDishes: counterDish,
            day: week[day],
            isFiado: fiado,
            customer: customerName,
            status: stat,
            id: session._id,
            currentBalance: session.balance,
            role: session.role,
            dayTime: `${Today_date.getHours()}:${Today_date.getMinutes()}`,
            createdAt: Today_date.toISOString()
              .split('T')[0]
              .split('-')
              .reverse()
              .join('-'),
          }),
        })
          .then((res) => res.json())
          .then((res) => billCreationValidation(res, msg))
      }
    }
  };

  const billCreationValidation = (res, msg) => {
    if (res.data.record !== undefined) {
      toast.success('Orden generada exitosamente');
      // console.log(res)
      setBillId(res.data.record._id);
      addDishesToBill(res.data.record._id);
    } else {
      // console.log(res);
      toast.error('Error, No se pudo generar la orden');
    }
  };

  const drawFiar = () => {
    if (session.role !== 'user') {
      return (
        <button
          type="button"
          className={
            session !== null ? `btn btn-danger ${classes.fiado}` : 'd-none'
          }
          onClick={(e) => checkIfLogin(true, session.token, 'Factura creada!')}
        >
          <BsFlagFill /> Fiar
        </button>
      )
    }
    if (session.canBorrow) {
      return (
        <button
          type="button"
          className={
            session !== null ? `btn btn-danger ${classes.fiado}` : 'd-none'
          }
          onClick={(e) => checkIfLogin(true, session.token, 'Factura creada!')}
        >
          <BsFlagFill /> Fiar
        </button>
      )
    } else {
      return;
    }
  }

  return (
    <>
      <h1>{session.role === 'admin' ? 'Vender platos' : 'Comprar Platos'}</h1>
      <h1>{session.role === 'admin' ? '' : 'Su saldo es de: ' + balance}</h1>
      <SearchBar updateFilter={setNewFilteredObject} items={props.items} />
      {/* Customer name input */}
      <label htmlFor="customer" className="form-label">
        <h2>Nombre del cliente</h2>
      </label>
      <input
        type="customer"
        className={'form-control ' + classes.customerName}
        id="customer"
        aria-describedby="customerHelp"
        onChange={(e) => setCustomerName(e.target.value)}
      />
      <div className={classes.centerSellCard}>
        {
          // console.log(filterObject),
          filterObject.map((el, i) => {
            if (el.forToday) {
              return (
                <div
                  key={i}
                  id={i}
                  className={'card '}
                  style={{
                    width: '18rem',
                    display: 'inline-block',
                    marginRight: '2vw',
                  }}
                >
                  <h2 id={`counter_${el.id}`}>0</h2>
                  <div
                    onClick={(e) => upCounter(el.id, el.price)}
                    className={classes.hoverCard}
                  >
                    <Image
                      src={
                        el.image !== undefined
                          ? `/dishes/${el.image}`
                          : `/dishes/stockDishImg.png`
                      }
                      className="card-img-top"
                      alt="me"
                      width="1000"
                      height="1000"
                    />
                    <div className="card-body">
                      <h5 id={el.id + ' name'} className="card-title">
                        {el.name}
                      </h5>
                      <h5 id={el.id + ' price'} className="card-text">
                        ${el.price}
                      </h5>
                      <p className="card-text">{el.description}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => lowerCounter(el.id, el.price)}
                    className={'btn btn-danger'}
                  >
                    <BsFillTrashFill /> Remover
                  </button>
                </div>
              );
            } else return null
          })
        }
        {/* Section to see purchase details */}

        <div className={classes.billInfo}>
          <h2 style={{ marginRight: '10px' }}>Platos:</h2>
          <h2 id="totalDishes" style={{ marginRight: '2vw' }}>
            {counterDish}
          </h2>
        </div>
        <div className={classes.billInfo}>
          <h2>Total: $</h2>
          <h2 id="totalPrice">{counterPrice.toFixed(2)}</h2>
        </div>
        <br />
        <button
          type="button"
          className={'btn btn-success '}
          onClick={(e) => checkIfLogin(false, 'Factura creada!')}
        >
          <BsCheck /> {session !== null ? 'Procesar venta' : 'Realizar pedido'}
        </button>
        {/* Fiado is to lend this dish to the client with the promise to pay afterward */}
        {
          drawFiar()
        }

        <br />
        <div>
          <ToastContainer />
        </div>
        <br />
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Procesar Compra</Modal.Title>
          </Modal.Header>
          <Modal.Body>¿Desea pagar con tarjeta o pagar en el local?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Pagar en el local
            </Button>
            <Button variant="success" onClick={goToCheckoutBitcoin}>
              Pagar con Bitcoint
            </Button>
            <Button variant="primary" onClick={goToCheckout}>
              Pagar con tarjeta
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
});
