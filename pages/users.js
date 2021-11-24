import { useEffect, useState, useContext } from 'react'
import AuthContext from '../context/authContext'
import Button from 'react-bootstrap/Button';
import PaginationControls from './../components/NavigationItems/PaginationControls';
import SearchBar from './../components/NavigationItems/SearchBar';
import Table from 'react-bootstrap/Table'

export default function User() {
    const { session } = useContext(AuthContext)
    const [users, setUsers] = useState()
    const [totalRecords, setTotalRecords] = useState(1)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        fetch('/api/users?limit=10&page=1`', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${session.token}`
            },
        }).then(res => res.json()).then(res => updateStates(res))
    }, [])

    const updateStates = (res) => {
        // console.log(res)
        if (res.data !== undefined) {
            setUsers(res.data.records)
            setTotalRecords(res.data.totalRecords)
            setLoaded(true)
        }
    }

    const toggleFiar = (id, fiar) => {
        fetch(`/api/users?id=${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.token}`
            },
            body: JSON.stringify({
                fiar
            })
        })
            .then(res => res.json())
            .then(() => location.reload())
        // .then((res) => updateStates(res))
    }


    if (!loaded) {
        return <div>Loading...</div>
    } else {
        return (
            <>
                <h1 style={{ marginLeft: "37vw" }}>Usuarios registrados</h1>
                <br />
                <section style={{ marginLeft: "45vw" }}>
                    <PaginationControls
                        token={session.token}
                        totalRecords={totalRecords}
                        limit={10}
                        toUpdateParent={updateStates}
                        url={'/api/users'}
                        method={'GET'}
                    />
                    <br />
                </section>
                <br />
                <section>
                    <Table responsive="lg" striped bordered hover style={{ width: "98%", marginLeft: "1%" }}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Usuario</th>
                                <th>Correo</th>
                                <th>Telefono</th>
                                <th>Puede fiar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((el, i) => {
                                return (
                                    <tr key={el._id}>
                                        <td>{i+1}</td>
                                        <td>{el.name}</td>
                                        <td>{el.email}</td>
                                        <td>{el.tn}</td>
                                        <td>{el.canBorrow ? <Button variant="danger" onClick={() => toggleFiar(el._id, !el.canBorrow)}>Denegar</Button> : <Button variant="success" onClick={() => toggleFiar(el._id, !el.canBorrow)}>Permitir</Button>}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </section>
            </>
        )
    }
}