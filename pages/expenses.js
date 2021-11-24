import { useState, useEffect, useContext } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import AuthContext from '../context/authContext';
// import Table from '../components/Table';
import Table from 'react-bootstrap/Table'
import Link from 'next/link';
import PaginationControls from '../components/NavigationItems/PaginationControls';

import { BsFillTrashFill, BsGearFill } from 'react-icons/bs';

const classes = require('./../styles/addDish.module.css');

export default function expenses() {
  const { session } = useContext(AuthContext);
  const [metric, setMetric] = useState('');
  const [amount, setAmount] = useState(0);
  const [productID, setProductID] = useState('');
  const [productName, setProductName] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [itemID, setItemID] = useState();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalRecords, setTotalRecords] = useState(1);
  const [loaded, setLoaded] = useState(false);

  // let dateTime = new Date();
  let today = new Date().toISOString().split('T')[0].split('-').reverse().join('-');

  useEffect(() => {
    fetch(`/api/expenses`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      // .then((res) => console.log(res))
      .then((res) => {
        updateItems(res);
      })
      .then(() => setLoaded(true));

    fetch(`/api/products`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      // .then((res) => console.log(res))
      .then((res) => {
        setProducts(res.data.records);
      })
      .then(() => setLoaded(true));
  }, []);

  const updateItems = (res) => {
    // console.log(res.data.records);
    if (res.data.records !== undefined) {
      res.data.records.map((el, i) => {
        res.data.records[i].product_id = el.product._id;
        res.data.records[i].ingredient_name = el.product.name;
      });
      setItems(res.data.records);
      setTotalRecords(res.data.totalRecords);
    }
  };

  const addItemHandler = (e, mode) => {
    if (e) e.preventDefault();

    if (metric === '' || amount < 1 || productID === '' || totalPrice <= 0) toast.error('Por favor llene todos los campos')

    fetch(`/api/expenses`, {
      method: mode,
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric,
        amount,
        productID,
        totalPrice,
        id: itemID,
        createdAt: today,
      }),
    })
      .then((res) => res.json())
      .then(
        mode === 'POST'
          ? toast.success('Ingrediente a sido añadido')
          : toast.success('Ingrediente a sido modificado')
      );
    location.reload();
  };

  const removeItem = (id, name) => {
    fetch(`/api/expenses`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
      }),
    })
      .then((res) => res.json())
      .then(toast.info(`Se ha eleminado ${name} de la lista`));
  };

  const modifyItem = (el) => {
    // console.log(el);
    setItemID(el._id);
    setMetric(el.metric);
    setAmount(el.amount);
    setProductName(el.ingredient_name);
    setProductID(el.product_id);
  };

  if (loaded) {
    return (
      <div>
        <h1>Ingresar ingredientes o producto</h1>
        <br />
        <div className={'container ' + classes.formBody}>
          <div className="row">
            <div className="col">
              <form
                onSubmit={
                  itemID === undefined
                    ? (e) => addItemHandler(e, 'POST')
                    : (e) => addItemHandler(e, 'PATCH')
                }
              >
                <div className="input-group">
                  <span
                    className={'input-group-text ' + classes.labelsText}
                  >
                    Producto
                  </span>
                  <select
                    id="products"
                    className="form-select"
                    aria-label="Default select example"
                    value={productID}
                    onChange={(e) => setProductID(e.target.value)}
                    required
                  >
                    <option value=''>
                      Seleccione un producto
                    </option>
                    {products.map((el) => {
                      return (
                        <option key={'ingredient' + el._id} value={el._id}>
                          {el.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <br />
                <div className="input-group">
                  <span
                    className={'input-group-text ' + classes.labelsText}
                  >
                    Unidad
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                    placeholder='Ingrese si es libra, botella, bolsa, etc'
                  />
                </div>
                <br />
                <div className="input-group">
                  <span
                    className={'input-group-text ' + classes.labelsText}
                  >
                    Total de unidades
                  </span>
                  <input
                    type="number"
                    className="form-control"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <br />
                <div className="input-group">
                  <span
                    className={'input-group-text ' + classes.labelsText}
                  >
                    Total Cancelado
                  </span>
                  <input
                    type="number"
                    className="form-control"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                  />
                </div>
                <br />
                <div className="input-group">
                  <input
                    type="submit"
                    className="btn btn-outline-primary form-control"
                    value='Agregar'
                  />
                  <Link href="/" passHref>
                    <button
                      type="button"
                      className="btn btn-outline-primary form-control"
                    >
                      Cancelar
                    </button>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div>
          <h3>Lista de items existentes</h3>
          <div className={classes.paginationNav}>
            <PaginationControls
              token={session.token}
              totalRecords={totalRecords}
              limit={10}
              toUpdateParent={updateItems}
              type={null}
              url={'/api/expenses'}
              method={'GET'}
            />
          </div>
          <Table responsive="lg" striped bordered hover style={{ width: "98%", marginLeft: "1%" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Unidad</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Precio total</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((el, i) => {
                return (
                  <tr key={el._id}>
                    <td>{el._id}</td>
                    <td>{el.product.name}</td>
                    <td>{el.metric}</td>
                    <td>{el.quantity}</td>
                    <td>${el.pricePerUnit}</td>
                    <td>${el.totalPrice}</td>
                    <td>{el.createdAt}</td>
                    <td>{/* Button to Delete Item */}
                      <button
                        type="button"
                        className={'btn btn-danger'}
                        onClick={(e) => removeItem(el._id, el.product.name)}
                      >
                        <BsFillTrashFill />
                      </button>
                      {/* Button to Modify Item */}
                      <button
                        type="button"
                        className={'btn btn-info'}
                        onClick={(e) => modifyItem(el)}
                      >
                        <BsGearFill />
                      </button></td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </div>
        <div>
          <ToastContainer />
        </div>
      </div>
    );
  } else return (<>
    <h1>Cargando...</h1>
  </>)
}
