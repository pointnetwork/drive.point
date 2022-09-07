import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import { Link } from "wouter";
import { useAppContext} from '../context/AppContext';
import { useState } from 'react';

const Header = ({changePathHandler}) => {
    const { walletAddress, identity } = useAppContext();

    const [path, setPath] = useState('');

    function changeHandler(e){
        console.log(e);
        setPath(e.target.value);
    }

    function clickHandler(e){
        changePathHandler(path);
    }

    function enterHandler(e){
        if (e.key === 'Enter') {
            clickHandler(e);
        }
    }

    function handleSubmit(e){
        e.preventDefault();
    }

    return (
        <>
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Container>
                <Link to='/'>
                    <Navbar.Brand href="/">Point Drive</Navbar.Brand>
                </Link>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                    <form className="d-flex" onSubmit={handleSubmit} >
                        <input className="form-control me-2" type="search" placeholder="Identity/path" aria-label="Search" onChange={changeHandler} value={path} onKeyDown={enterHandler}/>
                        <button className="btn btn-outline-success" type="button" onClick={clickHandler}>Open</button>
                    </form>
                    </Nav>
                    <Nav>
                    {/*
                    <Nav.Link href="#deets">
                        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                        </svg>
                        &nbsp;&nbsp;Info
                    </Nav.Link>
                    */}
                    <Nav.Link eventKey={2} href="#">
                        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" className="bi bi-person" viewBox="0 0 16 16">
                          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                        </svg>
                        &nbsp;{identity}
                    </Nav.Link>

                    </Nav>
                </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    )
}

export default Header
