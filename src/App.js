import { ProvideAppContext } from './context/AppContext'
import { Route } from 'wouter'
import Header from './components/Header';
import Footer from "./components/Footer";
import Home from './pages/Home'
import { useAppContext} from './context/AppContext';

const Main = () => {

    const { walletAddress, identity } = useAppContext();
    
    return (
        <main>
            <Header />
                <Route path='/'>
                    <Home walletAddress={walletAddress} identity={identity}/>
                </Route>
            <Footer />
        </main>
    )
}

export default App = () => <ProvideAppContext><Main/></ProvideAppContext>