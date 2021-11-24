import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Link from 'next/link';
import AuthContext from '../context/authContext';
import Image from 'next/image';
const classes = require('./../styles/menu.module.css');
import CarousselSSR from '../components/Caroussel';
import MenuAdmin from '../components/MenuAdmin';

export default function Menu({ items }) {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [msg, setMsg] = useState('');

  const handleClose = () => setShow(false);
  const handleShow = (title, msg) => {
    setTitle(title);
    setMsg(msg);
    setShow(true);
  }

  useEffect(() => {
    // console.log(router.query.redirect_status)
    if (router.query.redirect_status !== undefined) {
      if (router.query.redirect_status === 'succeeded') {
        handleShow('Exito', 'Su transaccion fue procedada con exito');
      } else if (router.query.redirect_status === 'cancelled') {
        handleShow('Cancelacion', 'Su transaccion fue cancelada, por favor pague en el comedor');
      }
    }

    fetch('/api/counter', {
      method: 'GET',
    })
      .then(res => res.json())
      .then(res => {
        // console.log(res.data.records[0].count)
        setCount(res.data.records[0].count);
        // setCount(res.count)
      });

  }, [router.query]);

  const SSRElements = (
    <>
      <MenuAdmin
        title={'Disfruta de nuestros platillos preparados para hoy'}
        componentName={'Carusel'}
        visible={false}
        Component={<CarousselSSR items={items} />}
      />
    </>
  );

  return (
    <div className={`text-center ${classes.section2}`}>
      {/* Main section */}
      <section className={`text-center ${classes.section1}`}>
        <div style={{ backgroundColor: '#fcf8f5', width: "50%", height: "20vh", paddingTop: "4vh", marginLeft: "25vw" }}>
          <h1>Bienvenido a Comedor Buen Amanecer</h1>
          <h2>Actualmente hay {count} clientes en el local</h2>
        </div>
        <br />
        <Image src={`/logo.jpg`} alt="logo" width="250" height="250" />
        <br />
        <h2>Disfruta de nuestra seleccion del día.</h2>
        {SSRElements}
        <Link href="/menu/sell" passHref>
          <a className="btn btn-success" style={{ width: "25vw" }}>Comprar</a>
        </Link>

      </section>
      <br />
      <br />
      <section className={`text-center ${classes.section2}`}>
        <Container fluid>
          <h3>Te esperamos para ofrecerte:</h3>
          <Row>
            <Col>
              <h4>Desayunos</h4>
              <Image
                src='/assets/breakfast.jpg'
                className="card-img-top"
                alt="breakfast"
                width="950"
                height="900"
              />
            </Col>
            <Col>
              <h4>Almuerzos</h4>
              <Image
                src='/assets/lunch.jpg'
                className="card-img-top"
                alt="breakfast"
                width="950"
                height="900"
              />
            </Col>
            <Col>
              <h4>Cenas</h4>
              <Image
                src='/assets/dinner.jpg'
                className="card-img-top"
                alt="breakfast"
                width="950"
                height="900"
              />
            </Col>
          </Row>
        </Container>
      </section>


      {/* Modal box */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{msg}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export async function getServerSideProps(context) {
  const res = await fetch(
    `${process.env.BACKEND}/api/v1/menu?limit=100`,
    {
      method: 'GET',
      mode: 'cors',
    }
  );
  const data = await res.json();
  const items = data.records;

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: { items }, // will be passed to the page component as props
  };
}
