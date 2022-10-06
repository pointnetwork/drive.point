import { ProvideAppContext } from './context/AppContext'
import { Route } from 'wouter'
import Header from './components/Header';
import Home from './pages/Home'
import { useAppContext} from './context/AppContext';
import { useState } from 'react';

/**
 * Main function of the application, loads the application and other components.
 * 
 */
const Main = () => {

    //general data for the application, wallet connected, identity and public key
    const { walletAddress, identity, publicKey } = useAppContext();

    //the path selected to fetch the files from the blockchain
    const [path, setPath] = useState('');

    /**
     * Change the path selected
     * 
     * @param {string} path - the path selected 
     */
    function changePathHandler(path){
        console.log('chaged path in main');
        console.log(path);
        setPath(path);
    }
    
    //render the application
    return (
        <main>
            <Header changePathHandler={changePathHandler} />
                <Route path='/'>
                    {   identity !== undefined && identity !== '' && 
                        walletAddress !== undefined && walletAddress !== '' ? 
                    <Home publicKey={publicKey} walletAddress={walletAddress} identityProp={identity} pathProp={path}/>
                    : <div className="spinner-border"></div> }
                </Route>
        </main>
    )
}

export default App = () => <ProvideAppContext><Main/></ProvideAppContext>