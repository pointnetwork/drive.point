import { ProvideAppContext } from './context/AppContext'
import { Route } from 'wouter'
import Header from './components/Header';
import Footer from "./components/Footer";
import Home from './pages/Home'
import { useAppContext} from './context/AppContext';
import { useState } from 'react';

const Main = () => {

    const { walletAddress, identity, publicKey } = useAppContext();
    const [path, setPath] = useState('');

    function changePathHandler(path){
        console.log('chaged path in main');
        console.log(path);
        setPath(path);
    }
    
    return (
        <main>
            <Header changePathHandler={changePathHandler} />
                <Route path='/'>
                    {   identity !== undefined && identity !== '' && 
                        walletAddress !== undefined && walletAddress !== '' ? 
                    <Home publicKey={publicKey} walletAddress={walletAddress} identityProp={identity} pathProp={path}/>
                    : <div className="spinner-border"></div> }
                </Route>
            <Footer />
        </main>
    )
}

export default App = () => <ProvideAppContext><Main/></ProvideAppContext>