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

export default function products() {
  const { session } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [expires, setExpires] = useState('day');
  const [itemID, setItemID] = useState();
  const [items, setItems] = useState([]);
  const [totalRecords, setTotalRecords] = useState(1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
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
        updateItems(res);
      })
      .then(() => setLoaded(true));
  }, []);

  const updateItems = (res) => {
    setItems(res.data.records);
    setTotalRecords(res.data.totalRecords);
  };

  const addItemHandler = (e, mode) => {
    if (e) e.preventDefault();
    if (name === '') return;
    fetch(`/api/products`, {
      method: mode,
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        expires,
        id: itemID,
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
    fetch(`/api/products`, {
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
    setItemID(el._id);
    setName(el.name);
    setExpires(el.expires);
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
                    style={{ width: '6vw' }}
                  >
                    Nombre
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <span
                    className={'input-group-text ' + classes.labelsText}
                    style={{ width: '6vw' }}
                  >
                    Duracion
                  </span>
                  <select
                    id="ingredients"
                    className="form-select"
                    aria-label="Default select example"
                    value={expires}
                    onChange={(e) => setExpires(e.target.value)}
                  >
                    <option value="day" defaultValue>
                      Dia
                    </option>
                    <option value="week">semana</option>
                    <option value="month">Mes</option>
                    <option value="year">Año</option>
                  </select>
                </div>
                <br />
                <div className="input-group">
                  <input
                    type="submit"
                    className="btn btn-outline-primary form-control"
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
              url={'/api/ingredients'}
              method={'GET'}
            />
          </div>
          <div className={`${classes.InLineBlock} ${classes.Table}`}>
            <Table responsive="lg" striped bordered hover style={{ width: "98%", marginLeft: "1%" }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Duracion</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((el, i) => {
                  return (
                    <tr key={el._id}>
                      <td>{el._id}</td>
                      <td>{el.name}</td>
                      <td>{el.expires}</td>
                      <td>
                        {/* Button to Delete Item */}
                        <button
                          type="button"
                          className={'btn btn-danger'}
                          onClick={(e) => removeItem(el._id, el.name)}
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
        </div>
        <div>
          <ToastContainer />
        </div>
      </div>
    );
  } else return (<>
    <h1>Cargando...</h1>
  </>);
}
