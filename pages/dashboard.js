import { useState, useEffect } from 'react';
import { useContext } from 'react';
import Script from 'next/script'
import AuthContext from './../context/authContext';
import dynamic from 'next/dynamic';
const classes = import('./../styles/dashboard.module.css');
const LineChart = dynamic(() => import('../components/Charts/LineChart'), {
  ssr: true,
});
const DonutChart = dynamic(() => import('../components/Charts/DonutChart'), {
  ssr: false,
});

export default function dashboard() {
  const { session } = useContext(AuthContext);
  const dateTime = new Date();

  const [stats, setStats] = useState({});
  const [lineChartData, setLineChartData] = useState({});
  const [donutLoaded, setDonutLoaded] = useState(false);
  const [lineLoaded, setLineLoaded] = useState(false);

  const options = {
    plugins: {
      datalabels: {
        display: true,
        color: 'black',
      },
    },
    rotation: 1 * Math.PI,
    circumference: 1 * Math.PI,
  };

  useEffect(() => {
    const today = new Date()
      .toISOString()
      .split('T')[0]
      .split('-')
      .reverse()
      .join('-');

    fetch(`/api/getStats?mode=day&day=${today.split('-')[0]}&month=${today.split('-')[1]}&year=${today.split('-')[2]}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Authorization': `Bearer ${session.token}`,
      }
    })
      .then((res) => res.json())
      // .then((res) => console.log(res))
      .then((res) => valitateIfemtpy(res))
      .then(() => setDonutLoaded(true))
    
      fetch(`/api/lineChart`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Authorization': `Bearer ${session.token}`,
        }
      })
        .then((res) => res.json())
        .then((res) => setLineChartData(res.data.result))
        .then(() => setLineLoaded(true))

  }, []);

  const valitateIfemtpy = (res) => {
    if (res.data.result !== undefined) {
      if (res.data.result.length > 0) {
        setStats(res.data.result[0]);
      } else {
        setStats({})
      }
    } else {
      setStats({})
    }
  };

  const loadNewData = () => {

    const pickedDate = document.getElementById('calendar').value;

    fetch(`/api/getStats?mode=day&day=${pickedDate.split('-')[2]}&month=${pickedDate.split('-')[1]}&year=${pickedDate.split('-')[0]}`, {
      method: 'GET',
      mode: 'cors',
      headers: { 
        Authorization: `Bearer ${session.token}`,
      },
    })
      .then((res) => res.json())
      // .then((res) => console.log(res))
      .then((res) => valitateIfemtpy(res));
  };

  const putValue = (category) => {
    setValue(category);
  };


  if (!donutLoaded || !lineLoaded) {
    return <div></div>; //show nothing or a loader
  } else {
    return (
      <div>
        <div className="container">
          <h1>Estadisticas</h1>
          <div>
            <div className="row">
              <div className="col">
                <input type="date" id="calendar" className="form-control" />
              </div>
            </div>
            <br/>
            <input type="button" value="Buscar" onClick={() => loadNewData()} />
          </div>
          <br/>
          <div className="row">
            <div className="col">
              <DonutChart
                category={'Platos'}
                name={'Platos vendidos'}
                labels={['Vendido', 'Restante']}
                values={[
                  stats.totalFiadoDishes + stats.totalSoldDishes,
                  50 - (stats.totalFiadoDishes + stats.totalSoldDishes),
                ]}
                options={options}
                chartId={'platos'}
              />
            </div>
            <div className="col">
              <DonutChart
                category={'Comparacion'}
                name={'Pagado vs Fiado'}
                labels={['Pagado', 'Fiado']}
                values={[stats.totalSoldDishes, stats.totalFiadoDishes]}
                chartId={'pagadoVsFiado'}
              />
            </div>
            <div className="col">
              <DonutChart
                category={'Finanzas'}
                name={'Ganancias'}
                labels={['Entrada', 'Meta']}
                values={[stats.earnings, 100 - stats.earnings]}
                options={options}
                chartId={'ganancias'}
                className={classes.lineChart}
              />
            </div>
          </div>
          <h1>Total de venta por Dia</h1>
          <div className={'row'}>
            <LineChart
              labels={lineChartData.map(el => el.day)}
              values={lineChartData.map(el => el.total)}
              dataSetLabel={'Ventas'}
              chartId={'lineChart'}
            />
          </div>
        </div>
        <br />
        <Script
          src="http://google.com"
          onLoad={() => {
            document.getElementById('calendar').value = new Date()
              .toISOString()
              .split('T')[0];
          }}
        />
      </div>
    );
  }
}