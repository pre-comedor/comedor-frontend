import { useState, useEffect, useContext } from 'react';
import AuthContext from './../../context/authContext';
import { useRouter } from 'next/router';
import PaginationControls from './../../components/NavigationItems/PaginationControls';
import Table from 'react-bootstrap/Table'
const classes = require('./../../styles/sellHistory.module.css');

export default function sellHistory() {
  const router = useRouter();
  const { typeHistory } = router.query;

  const { session } = useContext(AuthContext);

  const [items, setItems] = useState([]);
  const [totalRecords, setTotalRecords] = useState();
  const [sort, setSort] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    //window.location.href.split('/').pop() retrieves the params from the URL, as in useEffect the Router.query is empty at build time
    if (session === undefined) router.push('/');
    fetch(`/api/getTables`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        limit: 10,
        sort,
        type: window.location.href.split('/').pop(),
        // url: params.local_backend_nodejs
      }),
    })
      .then((res) => res.json())
      // .then((res) => console.log(res))
      .then((res) => {
        // console.log(res)
        setItems(res.data.records),
          setTotalRecords(res.data.totalRecords);
      })
      .then(() => setLoaded(true));
  }, [typeHistory]);

  const parentItemsUpdate = (res) => {
    setItems(res.data.records);
  };

  if (!loaded) {
    return <></>;
  } else {
    return (
      <div>
        <h1 className={classes.centerItem}>
          Historial de ventas
        </h1>
        <br />
        <div className={classes.paginationNav}>
          <PaginationControls
            token={session.token}
            totalRecords={totalRecords}
            limit={10}
            sort={sort}
            toUpdateParent={parentItemsUpdate}
            type={typeHistory}
            url={'/api/getTables'}
            method={'POST'}
          />
        </div>
        <Table responsive="lg" striped bordered hover style={{width: "98%", marginLeft: "1%"}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Total de Platos</th>
              <th>Precio cancelado</th>
              <th>Estado</th>
              <th>Dia</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {items.map((el, i) =>{
              return (
                <tr key={el._id}>
                  <td>{el._id}</td>
                  <td>{el.totalDishes}</td>
                  <td>${el.totalPrice}</td>
                  <td>{el.estado}</td>
                  <td>{el.day}</td>
                  <td>{el.createdAt}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>
    );
  }
}
