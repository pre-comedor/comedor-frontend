import { useState, useContext } from 'react';
import AuthContext from '../context/authContext';
// import ParamsContext from '../context/paramsContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';
import  Image  from 'next/image';
import { data } from '@tensorflow/tfjs';
import { getAdjacentKeyPoints } from '@tensorflow-models/posenet';

const classes = require('./../styles/login.module.css');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setSession } = useContext(AuthContext);
  // const {params} = useContext(ParamsContext);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log(params.local_backend_nodejs)
    fetch('/api/login', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        // url: params.local_backend_nodejs
      }),
    })
      .then((res) => res.json())
      // .then((res) => console.log(res))
      .then(
        (res) => cookieSettup(res),
      );
  };

  const cookieSettup = (res) => {
    if (res.data.user !== undefined) {
      setSession(res.data.user);
      if(router.query.page){
        router.push(`${router.query.page}`);  
      }else{
      router.push('/');
    }
    } else {
      toast.error(res.data.message);
    }
  };

  const goToSigning = () => {
    if(router.query.page !== undefined){
    router.push({
      pathname: '/signing',
      query: `${router.query.page}`
    })}else {
      router.push('/signing')
    }
  }

  return (
    <div className={`${classes.bodyBackground}`}>
      <br/>
      <div className={`container ${classes.formBody}`}>
        <form className={''} onSubmit={handleSubmit}>
          <h3>Ingresar</h3>
          <br/>
          <div className="form-group">
            <label htmlFor="email">Correo electronico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="Ingrese su correo electronico"
              require='true'
            />
          </div>
          <br/>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="Ingrese su contraseña"
              require='true'
            />
          </div>
          <br/>
          <button type="submit" className="btn btn-primary btn-block">
            Ingresar
          </button>

          <button type="button" className={"btn btn-info btn-block " + classes.moveRight } onClick={(e)=>goToSigning()}>
            Registrarse
          </button>
          <br/>
          <br/>
        </form>
      </div>
      <div>
        <ToastContainer />
      </div>
      <div style={{padding: "19.7vh", visibility: "hidden"}}>
        {Date()}
      </div>
    </div>
  );
}
