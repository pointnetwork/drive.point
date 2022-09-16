import './Item.css';
import { useState, useEffect } from 'react';
import FolderIcon from '@material-ui/icons/Folder';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import PersonIcon from '@material-ui/icons/Person';
import clsx from 'clsx';

function downloadBlob(blob, name) {
    // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
    const blobUrl = URL.createObjectURL(blob);
  
    // Create a link element
    const link = document.createElement("a");
  
    // Set link's href to point to the Blob URL
    link.href = blobUrl;
    link.download = name;
  
    // Append link to the body
    document.body.appendChild(link);
  
    // Dispatch click event on the link
    // This is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
      new MouseEvent('click', { 
        bubbles: true, 
        cancelable: true, 
        view: window 
      })
    );
  
    // Remove link from body
    document.body.removeChild(link);
  }

export default function Item({id, name, type, path, 
    openContextMenu, selected, isPublic, eSymmetricObj, eSymmetricObjName, eSymmetricObjPath,
    setItemSelected, setPath, setDecryptedPath}) {

    const [presentedName, setPresentedName] = useState('');
    const [presentedPath, setPresentedPath] = useState('');

    const downloadFileFromStorage = async ({fileId, symmetricObj, eSymmetricObj}) => {
        let blob
        if (symmetricObj || eSymmetricObj) {
            blob = await window.point.storage.getEncryptedFile({id: fileId, symmetricObj, eSymmetricObj})
        } else {
            blob = await window.point.storage.getFile({id: fileId})
        }
        const url  = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    async function openItem(e){
        console.log('opened');
        //console.log(e.target);
        if(type === 'folder'){
            setPath(path);
            setDecryptedPath(presentedPath);
        } else if (type === 'file'){
            if(!isPublic){
                await downloadFileFromStorage({fileId: id, eSymmetricObj})
            }else{
                if(eSymmetricObj !== ''){
                    //public but previously was private
                    await downloadFileFromStorage({fileId: id, symmetricObj: eSymmetricObj})
                }else{
                    await downloadFileFromStorage({fileId: id})
                }
            }
        }
    }

    function openContextMenuHandler(e){
        e.preventDefault()
        openContextMenu(parseInt(e.clientX), parseInt(e.clientY))
        setItemSelected({id, name, type, path, isPublic, presentedName, presentedPath, 
            eSymmetricObj, eSymmetricObjName, eSymmetricObjPath});
    }

    useEffect( async () => {
        if (isPublic){
            if(eSymmetricObjName !== '' || eSymmetricObjPath !== ''){
                let r = await window.point.wallet.decryptDataWithDecryptedKey({
                    encryptedData: name,
                    symmetricObj: eSymmetricObjName,
                });
                setPresentedName(r.data.decryptedData);
    
                r = await window.point.wallet.decryptDataWithDecryptedKey({
                    encryptedData: path,
                    symmetricObj: eSymmetricObjPath,
                });
                setPresentedPath(r.data.decryptedData);
            }else{
                setPresentedName(name);
                setPresentedPath(path);
            }
        } else {
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
        <div className={clsx("item", selected && "itemSelected", type === 'folder' ? "itemFolder" : "itemFile")}
            onDoubleClick={openItem}
        >
            <div className="icon">
                {type === 'folder' ?
                    isPublic ? <FolderSharedIcon /> : <FolderIcon />
                :
                    <>
                        <InsertDriveFileIcon />
                        {isPublic &&
                            <div className="publicIcon">
                                <PersonIcon />
                            </div>
                        }
                    </>
                }
            </div>

            <div className="name">
                {presentedName}
            </div>
        </div>
    )
}
