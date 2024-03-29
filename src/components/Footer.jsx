import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import { Link } from "wouter";
import logo from '../assets/pointlogowhite.png'

/**
 * Render the footer of the application
 */
const Footer = () => {
    return (
        <>
           <Navbar fixed="bottom" bg="dark" variant="dark">
            <Container>
                <Link to="/">
                    <Navbar.Brand href="/">
                        <img
                        alt=""
                        src={logo}
                        width="30"
                        height="30"
                        className="d-inline-block align-top"
                        />{' '}
                    &copy; {new Date().getFullYear()} Copyright: Point Network
                    </Navbar.Brand>
                </Link>
            </Container>
          </Navbar>
        </>
    )
}

export default Footer
