import './Item.css';
import { useState, useEffect } from 'react';
import FolderIcon from '@material-ui/icons/Folder';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import PersonIcon from '@material-ui/icons/Person';
import clsx from 'clsx';

/**
 * Render an item (folder or file)
 * 
 * @param {object} props
 * @param {string} props.id - the id of the file
 * @param {string} props.name - the name of the file
 * @param {string} props.type - file or folder
 * @param {string} props.path - the full path of the folder 
 * @param {function} props.openContextMenu - the function to open the context menu 
 * @param {boolean} props.selected - if the item is selected
 * @param {string} props.isPublic - if the item is public
 * @param {object} props.eSymmetricObj - Encrypted Symmetric Object used in the encryption of the file
 * @param {object} props.eSymmetricObjName - Encrypted Symmetric Object used in the encryption of the name of the file
 * @param {object} props.eSymmetricObjPath - Encrypted Symmetric Object used in the encryption of the path of the file
 * @param {function} props.setItemSelected - Function to mark an item as selected
 * @param {function} props.setPath - Function to set the selected path to fetch items 
 * @param {function} props.setDecryptedPath - Function to set the selected path decrypted to fetch items
 * @param {boolean} props.isFolder - if it is a folder
 * @param {number} props.size - the size of the file 
 *  
 * @returns {JSX.Element} - render the item
 */
export default function Item({id, name, type, path, 
    openContextMenu, selected, isPublic, eSymmetricObj, eSymmetricObjName, eSymmetricObjPath,
    setItemSelected, setPath, setDecryptedPath, isFolder, size}) {
    
    //variables to set the name and path presented (decrypted)
    const [presentedName, setPresentedName] = useState('');
    const [presentedPath, setPresentedPath] = useState('');
    
    /**
     * Function used to download files in backgroud without open a new tab.
     * 
     * @param {object} props
     * @param {string} props.fileId - the id of the file
     * @param {string} props.symmetricObj - the symmetric object to download the file 
     * @param {string} props.eSymmetricObj - the encrypted symmetric object to download the file
     * 
     */
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

    /**
     * Function to open an element.
     * 
     * @param {object} e - the event triggered to open the item (double-click)
     */
    async function openItem(e){
        console.log('opened');
        //console.log(e.target);
        if(type === 'folder'){
            setPath(path);
            setDecryptedPath(presentedPath);
        } else if (type === 'file'){
            if(!isPublic){
                //await downloadFileFromStorage({fileId: id, eSymmetricObj})
                window.open(`/_encryptedStorage/${id}?eSymmetricObj=${eSymmetricObj}`, target='_blank');
            }else{
                if(eSymmetricObj !== ''){
                    //public but previously was private
                    //await downloadFileFromStorage({fileId: id, symmetricObj: eSymmetricObj})
                    window.open(`/_encryptedStorage/${id}?symmetricObj=${eSymmetricObj}`, target='_blank');
                }else{
                    //await downloadFileFromStorage({fileId: id})
                    window.open(`/_storage/${id}`, target='_blank');
                }
            }
        }
    }

    /**
     * Function to open the context menu.
     * 
     * @param {object} e - event triggered to open the item (double-click)
     */
    function openContextMenuHandler(e){
        e.preventDefault()
        if(!isFolder){
            openContextMenu(parseInt(e.clientX), parseInt(e.clientY))
            setItemSelected({id, name, type, path, isPublic, presentedName, presentedPath, 
                eSymmetricObj, eSymmetricObjName, eSymmetricObjPath, isFolder, size});
        }
    }

    //effect used to proper render the presented name and presented path of an item
    useEffect( async () => {
        //public
        if (isPublic){
            //it was private before
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
                //always was public
                setPresentedName(name);
                setPresentedPath(path);
            }
        } else {
            //private
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

    //render the item
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
