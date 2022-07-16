
import { useState, useEffect } from 'react';
import {getElementMetadataDecrypted} from '../services/elementServices';

export default function Breadcrumb({identity, path, setPath, addrParam, isPublic}){
    
    const [pathParts, setPathParts] = useState([]);

    useEffect(() => {
        fetchParts(path, addrParam, isPublic);
    }, [path, addrParam, isPublic]);

    async function fetchParts(pathFetch, addrFetch, isPublicFetch){
        console.log('---------------!!')
        console.log(pathFetch);
        console.log('---------------!!')

        if (pathFetch === ''){
            isPublicFetch = true;
        }

        let localPathParts = [];
        if (isPublicFetch){
            localPathParts = pathFetch ? pathFetch.split('/') : [];
            localPathParts = localPathParts.map(part => {return {name: part, path: part, isPublic: true}});
            console.log(localPathParts);
        }else{
            let left = pathFetch;
            let part = '';
            do{
                let leftBeforDecrypt = left;
                try{
                    console.log(addrFetch);
                    console.log(left);
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
                localPathParts.push({name: part, path: leftBeforDecrypt, isPublic: false});

                let tempParts = left.split('/');
                part = tempParts.pop();
                left = left.replace('/' + part, '');
                left = left.replace(part, '');
                console.log('next part ' + part);
                console.log('next left ' + left);
            } while(left.length > 0);
            
            localPathParts.reverse();
        }
        setPathParts(localPathParts);
    }
    
    

    function navigate(part){
        if(part === ''){
            setPath(part);
        }else{
            if(part.isPublic){
                const subpath = path.replace(path.slice(path.search(part.name) + part.name.length), '');
                setPath(subpath);
            }else{
                console.log('call navigate to: ' + part.path);
                setPath(part.path);
            }
        }
        
    }

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