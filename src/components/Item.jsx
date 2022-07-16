
import './Item.css';
import { useState, useEffect } from 'react';

export default function Item({id, name, type, path, 
    openContextMenu, selected, isPublic, eSymmetricObj, eSymmetricObjName, eSymmetricObjPath,
    setItemSelected, setPath, setDecryptedPath}) {

    const [presentedName, setPresentedName] = useState('');
    const [presentedPath, setPresentedPath] = useState('');

    async function openItem(e){
        console.log('opened');
        console.log(e.target);
        if(type === 'folder'){
            setPath(path);
            setDecryptedPath(presentedPath);
        } else if (type === 'file'){
            if(!isPublic){
                window.open(`/_encryptedStorage/${id}?eSymmetricObj=${eSymmetricObj}`, target='_blank');
            }else{
                window.open(`/_storage/${id}`, target='_blank');
            }
        }
    }

    function openContextMenuHandler(e){
        e.preventDefault()
        openContextMenu(parseInt(e.clientX), parseInt(e.clientY))
        setItemSelected(id);
    }



    useEffect( async () => {
        if (!isPublic){
            let r = await window.point.wallet.decryptData({
                encryptedData: name,
                encryptedSymmetricObj: eSymmetricObjName,
            });
            setPresentedName(r.data.decryptedData);

            r = await window.point.wallet.decryptData({
                encryptedData: path,
                encryptedSymmetricObj: eSymmetricObjPath,
            });
            setPresentedPath(r.data.decryptedData);

            
        }
    }, [name, eSymmetricObjName]);

    return(
        
        <div className={ selected ?  "itemSelected" : "item"} 
            onDoubleClick={openItem} 
            /*onContextMenu={openContextMenuHandler}*/
            >
            <div align="center">
            
                {type === 'folder' ? 
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-folder" viewBox="0 0 16 16">
                        <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4H2.19zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707z"/>
                    </svg>
                : 
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-file-earmark" viewBox="0 0 16 16">
                        <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                    </svg>
                }
                {isPublic ? 
                <svg style={{position: 'absolute'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-people" viewBox="0 0 16 16">
                    <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                </svg>
                : ''}
            </div>
            <div align="center" style={{fontSize: 11}}>
                {isPublic ? name : presentedName}
            </div>
        </div>
            
    )
}
