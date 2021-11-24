import { useState, useEffect, useContext, memo } from 'react';
import { useRouter } from 'next/router';
import PaginationControls from './../../components/NavigationItems/PaginationControls';
import AuthContext from '../../context/authContext';
import Image from 'next/image';
import { Collapse, CardBody, Card } from 'reactstrap';
const classes = require('./../../styles/menu.module.css');

export default function pendingOrders() {
  const router = useRouter();
  const { type } = router.query;
  const { session } = useContext(AuthContext);
  const [items, setItems] = useState([])
  const [totalRecords, setTotalRecords] = useState(1)
  const [backend, setBackend] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // const params = new URLSearchParams(window.location.search)
    if (session.role === 'admin') {
      fetch(`/api/orders?limit=10&page=1&status=status&ifValue=${window.location.href.split('/').pop()}&role=${session.role}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      }).then((res) => res.json()).then((res) => updateItems(res));
    } else if (session.role === 'user') {
      fetch(`/api/orders?limit=10&page=1&status=status&ifValue=${window.location.href.split('/').pop()}&role=${session.role}&id=${session._id}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${session.token}`,
        }
      }).then((res) => res.json()).then((res) => updateItems(res));
    }
  }, [router.query])

  let [filterObject = [...items.reverse()], setFilterObject] = useState();

  const updateItems = res => {
    // console.log(res)
    const items = res.data.records !== undefined ? res.data.records : res.data
    const totalRecords = res.data.totalRecords !== undefined ? res.data.totalRecords.length > 0 ? res.data.totalRecords[0].total : 1 : 1
    const backend = res.data.records !== undefined ? 'javascript' : 'python'
    setItems(items);
    setTotalRecords(totalRecords);
    setBackend(backend);
    setLoaded(true);
  }

  const toggle = (id) => {
    // console.log(backend)
    if (backend === 'python') return;
    document.getElementById(id).classList.toggle('show');
    document
      .getElementById(`item-${id}`)
      .classList.toggle(`${classes.activated}`);
  };

  const completeOrder = (id, tn) => {
    if (router.query.type === 'Pending') {
      fetch(`/api/orders`, {
        method: 'PATCH',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          role: session.role,
          status: 'isReady',
        }),
      }).then((res) => res.json());
      // .then((res) => console.log(res));
      document.getElementById(`item-${id}`).className = 'd-none';
      document.getElementById(`buttons-${id}`).classList.add('d-none');
      //Enviar mensaje SMS a clientes con telefono registrado en la cuenta
      fetch(`/api/twilio`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          msg: 'Su orden esta lista, por favor pase a retirar su platillo',
          tn
        })
      }).then((res) => res.json().then((res) => console.log(res)))
    } else if (router.query.type === 'isReady') {
      fetch(`/api/orders`, {
        method: 'PATCH',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          role: session.role,
          status: 'Completed',
        }),
      }).then((res) => res.json());
      // .then((res) => console.log(res));
      document.getElementById(`item-${id}`).className = 'd-none';
      document.getElementById(`buttons-${id}`).classList.add('d-none');
    }
  };

  const cancelOrder = (id) => {
    fetch(`/api/orders`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        role: session.role,
      }),
    }).then((res) => res.json())
    // .then((res) => console.log(res))
    document.getElementById(`item-${id}`).className = 'd-none';
    document.getElementById(`buttons-${id}`).classList.add('d-none');
  };

  const buttons = (id, status, tn) => {
    if (router.query.type === 'Pending') {
      return (
        <div id={`buttons-${id}`} className="">
          <button
            type="button"
            className={`btn btn-success ${classes.pendingOrderButton} ${session.role !== 'admin' ? 'd-none' : ''
              }`}
            onClick={(e) => completeOrder(id, tn)}
          >
            Orden Lista
          </button>
          <button
            type="button"
            className={`btn btn-danger ${classes.pendingOrderButton}`}
            onClick={(e) => cancelOrder(id)}
          >
            Cancelar pedido
          </button>
        </div>
      );
    } else if (router.query.type === 'isReady') {
      return (
        <div id={`buttons-${id}`} className="">
          <button
            type="button"
            className={`btn btn-success ${classes.pendingOrderButton} ${session.role !== 'admin' ? 'd-none' : ''
              }`}
            onClick={(e) => completeOrder(id)}
          >
            Completar pedido
          </button>
          <button
            type="button"
            className={`btn btn-danger ${classes.pendingOrderButton}`}
            onClick={(e) => cancelOrder(id)}
          >
            Cancelar pedido
          </button>
        </div>
      );
    } else if (router.query.type === 'Completed') {
      return <></>;
    } else if (router.query.role === 'user') {
      if (status === 'Pending' || status === 'isReady') {
        return (
          <>
            <button
              type="button"
              className={`btn btn-danger ${classes.pendingOrderButton}`}
              onClick={(e) => cancelOrder(id)}
            >
              Cancelar pedido
            </button>
          </>
        );
      } else {
        return <></>;
      }
    }
    // console.log(router.query.type)
  };

  const parentItemsUpdate = (res) => {
    // console.log(res)
    if (res.data.records !== undefined) {
      setFilterObject(res.data.records);
    } else {
      totalRecords = 0;
      backend = 'python'
    }
  };


  const sayStatus = (status) => {
    if (window.location.href.split('/').pop() === 'Pending') {
      return <h4>Orden pendiente</h4>;
    } else if (window.location.href.split('/').pop() === 'isReady') {
      return <h4>Orden lista para retirar</h4>;
    } else if (window.location.href.split('/').pop() === 'Completed') {
      return <h4>Orden previa</h4>;
    }
  };

  if (!loaded) {
    return (
      <>
        <div className="d-flex justify-content-center" style={{marginTop: "20%"}}><div className="spinner-border" role="status"><span className="sr-only"></span></div></div>
      </>
    )
  } else {
    return (
      <div>
        {/* {console.log(filterObject)} */}
        <h1>Pedidos en linea</h1>
        <h2>Backend {backend}</h2>
        <div className={classes.paginationNav}>
          <PaginationControls
            token={session.token}
            totalRecords={totalRecords}
            limit={10}
            sort={null}
            toUpdateParent={parentItemsUpdate}
            type={null}
            url={`/api/orders?status=status&ifValue=${router.query.type}&role=${session.role}&id=${session._id}`}
            method={session.role === 'admin' ? 'GET' : 'POST'}
          />
        </div>
        {filterObject.map((el, i) => {
          // console.log(el)
          if (el.user !== null) {
            return (
              <div key={el.id}>
                {sayStatus(el.status)}
                <div
                  id={`item-${el.id}`}
                  className={`card ${classes.pendingOrderCards}`}
                  onClick={(e) => toggle(el.id)}
                  style={
                    el.status === 'isReady'
                      ? { backgroundColor: 'lightgreen' }
                      : el.status === 'Completed'
                        ? { backgroundColor: 'lightgray' }
                        : {}
                  }
                >
                  <div className={classes.hoverCard}>
                    <Image
                      src={`/dishes/stockDishImg.png`}
                      className={`${classes.pendingOrderCardsImage}`}
                      alt="me"
                      width="100"
                      height="100"
                    />
                    <div className={`${classes.pendingOrderCardsBody}`}>
                      <h5 className={``}>Cliente: <span style={{ color: "blue" }}>{el.user.name}</span></h5>
                      <p className={``}>Total de Platos: {el.totalDishes}</p>
                      <p className={``}>Hora: {el.dayTime}</p>
                      <p className={``} style={el.isPaid ? { color: 'green', fontWeight: 'bold', fontSize: '24px' } : { color: 'red', fontWeight: 'bold', fontSize: '24px' }}>{el.isPaid ? 'Pagado' : 'Pago pendiente'}</p>
                      <p className={``}>
                        Fecha {el.day} {el.createdAt}
                      </p>
                    </div>
                  </div>
                </div>
                <Collapse
                  id={el.id}
                  isOpen={false}
                  className={classes.collapseCard}
                >
                  <Card className={classes.collapseInnerCard}>
                    <CardBody>
                      {el.dishes !== undefined ? (
                        el.dishes.map((el, i) => {
                          return (
                            <div
                              className={classes.pendingOrderCardsInnerCard}
                              key={`inner-${i}`}
                            >
                              <Image
                                src={`/dishes/${el.dish.image}`}
                                className={`${classes.pendingOrderCardsImage}`}
                                alt="me"
                                width="100"
                                height="100"
                              />
                              <div className={`${classes.pendingOrderCardsBody}`}>
                                <h5 className={``}>
                                  Cantidad de platos: {el.amount}
                                </h5>
                                <p className={``}>
                                  Precio unitario: ${el.dish.price}
                                </p>
                                <p className={``}>
                                  Precio total del mismo plato: $
                                  {el.dish.price * el.amount}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div
                          className={classes.pendingOrderCardsInnerCard}
                          key={`inner-${i}`}
                        >
                          <Image
                            src={`/dishes/stockDishImg.png`}
                            className={`${classes.pendingOrderCardsImage}`}
                            alt="me"
                            width="100"
                            height="100"
                          />
                          <div className={`${classes.pendingOrderCardsBody}`}>
                            <h2>No hay informacion para mostrar</h2>
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </Collapse>
                {buttons(el.id, el.status, el.user.tn)}
              </div>
            );
          } else return <></>
        })}
        <br />
      </div>
    );
  }

};