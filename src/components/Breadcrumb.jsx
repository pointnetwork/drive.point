
import { useState, useEffect } from 'react';
import {getElementMetadataDecrypted} from '../services/elementServices';

/**
 * Renders the breadcrumb component
 * 
 * @param {object} props
 * @param {string} props.idenity - which identity is selected
 * @param {string} props.path - which oath is selected
 * @param {function} props.setPath - the function to be called when changing a path
 * @param {string} props.addrParam - the address of the owner of the path selected 
 * @param {boolean} props.isPublic - if the folder is public
 * 
 */
export default function Breadcrumb({identity, path, setPath, addrParam, isPublic}){
    
    //parts of the path
    const [pathParts, setPathParts] = useState([]);

    //fetch the parts of the path. Important because the path is encrypted for private folders
    useEffect(() => {
        fetchParts(path, addrParam, isPublic);
    }, [path, addrParam, isPublic]);

    /**
     * Fetch the parts of the path
     * 
     * @param {string} pathFetch - the path to be used
     * @param {string} addrFetch - the address of the owner of the path
     * @param {boolean} isPublicFetch - if the path is public
     */
    async function fetchParts(pathFetch, addrFetch, isPublicFetch){
        console.log('---------------!!')
        console.log(pathFetch);
        console.log('---------------!!')

        //root is public by default
        if (pathFetch === ''){
            isPublicFetch = true;
        }

        let localPathParts = [];
        if (isPublicFetch){
            //public path, just split the parts because is not encrypted
            localPathParts = pathFetch ? pathFetch.split('/') : [];
            localPathParts = localPathParts.map(part => {return {name: part, path: part, isPublic: true}});
            console.log(localPathParts);
        }else{
            //private path, need to fetch each part of the full path
            let left = pathFetch;
            let part = '';
            //loop until finish
            do{
                let leftBeforDecrypt = left;
                try{
                    console.log(addrFetch);
                    console.log(left);
                    //get the metadata decrypted
                    let metadata = await getElementMetadataDecrypted(addrFetch, left);
                    console.log(metadata);

                    part = metadata.eName;
                    left = metadata.eFullPath;
                    console.log('part = ' + part);
                    console.log('left = ' + left);
                } catch (e){
                    console.log('failed to get and decrypt:' + left);
                    console.log(e);
                    break;
                }
                //add to the parts
                localPathParts.push({name: part, path: leftBeforDecrypt, isPublic: false});

                //remove the part used from the path
                let tempParts = left.split('/');
                part = tempParts.pop();
                left = left.replace('/' + part, '');
                left = left.replace(part, '');
                console.log('next part ' + part);
                console.log('next left ' + left);

                //iterate until the path is empty
            } while(left.length > 0); 
            
            //reverse to get the right order for the path
            localPathParts.reverse();
        }
        //set the state variable
        setPathParts(localPathParts);
    }
    
    
    /**
     * Navigate to a specific part of the path
     * 
     * @param {string} part - the part to navigate
     */
    function navigate(part){
        if(part === ''){
            //root, just set the path
            setPath(part);
        }else{

            if(part.isPublic){
                //part is public
                const subpath = path.replace(path.slice(path.search(part.name) + part.name.length), '');
                //set the path with the full path until the part selected
                setPath(subpath);
            }else{
                //private
                //encrypted, the path is the full part encrypted.
                console.log('call navigate to: ' + part.path);
                setPath(part.path);
            }
        }
        
    }

    //render the breadcrumb
    return(
        <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
                <li className="breadcrumb-item">
                    <a href="#" onClick={() => navigate('')}>
                        {identity ? identity : ''}
                    </a>
                </li>
                {pathParts.map((part) => 
                    <li className="breadcrumb-item"><a href="#" onClick={() => navigate(part)}>{part.name}</a></li>
                )}
            </ol>
        </nav>
    )

}