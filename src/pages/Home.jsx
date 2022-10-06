import Container from 'react-bootstrap/Container'
import { useState, useEffect } from 'react';
import './Home.css';
import Toolbar from '../components/Toolbar';
import Breadcrumb from '../components/Breadcrumb';
import ItemList from '../components/ItemList';
import Share from '../components/Share';
import Swal from 'sweetalert2';
import '@fontsource/source-sans-pro';

/**
 * @typedef {Object} StorageElement
 * @property {string} eElementId - the id of the file stored in arweave
 * @property {string} eName - the name of the file (encrypted when private)
 * @property {string} eFullPath - the full path of the file (encrypted when private)
 * @property {string} owner - the address of the owner of the file/folder
 * @property {string} createdAt - timestamp (blocknumber) when the file/folder was created
 * @property {number} sizeInBytes - the size in bytes of the file
 * @property {boolean} isFolder - if the element is a folder
 * @property {boolean} isPublic - if the element is public
 * @property {object} eSymmetricObj - the symmetric object from the file (used for decryption)
 * @property {object} eSymmetricObjName - the symmetric object from the name (used for decryption)
 * @property {object} eSymmetricObjPath - the symmetric object from the path (used for decryption)
 * @property {boolean} isShared - if the file is shared with me (owner)
 * 
*/

/**
 * Render the home page from drive
 * 
 * @param {object} props
 * @param {string} props.publicKey - Public key from the user logged in
 * @param {string} props.walletAddress - The address from the user logged in
 * @param {string} props.identityProp - Identity from the user logged in
 * @param {string} props.pathProp - Path to be searched for files and folders
 * @returns render the home page from drive.
 */
export default function Home({publicKey, walletAddress, identityProp, pathProp}) {
  
  //position used to open the context menu
  const [contextMenuState, setContextMenuState] = useState({open: false, x: 0, y: 0});
  //the items loaded (Storage Elements)
  const [items, setItems] = useState([]);
  //the selected item
  const [itemSelected, setItemSelected] = useState('');
  //the path used to search for files and folders
  const [path, setPath] = useState('');
  //the path decrypted
  const [decyptedPath, setDecryptedPath] = useState('');
  //the address of the owner of the path
  const [addr, setAddr] = useState(walletAddress);
  //the identity of the owner of the path
  const [identity, setIdentity] = useState(identityProp);
  //the current folder metadata
  const [folderMetadata, setFolderMetadata] = useState({});
  //if the path to is shared or not
  const [shared, setShared] = useState(false);
  
  console.log('pk = ' + publicKey);
  console.log('+++++++++++++++++');
  console.log(identityProp);
  console.log(identity);
  console.log('+++++++++++++++++');

  /**
   * Open the context menu in the position (x,y)
   * @param {number} x - position in x axis to open context menu 
   * @param {number} y - position in y axis to open context menu
   */
  function openContextMenu(x, y){
    setContextMenuState({open: true, x, y});
  }

  /**
   * Close the context menu
   * 
   * @param {object} e - the event that triegered the open of context menu (right click of mouse) 
   */
  function closeContextMenu(e){
    if (e.shiftKey) {
      // shift key was down during the click
      console.log("shift pressed");
    }
    if (e.ctrlKey) {
      // ctrl key was down during the click 
      console.log("ctrl pressed");
    }
    setContextMenuState({open: false, x: contextMenuState.x, y: contextMenuState.y});
    setItemSelected('');
  }

  /**
   * Checks if a folder exists
   * 
   * @param {string} addrParam - the address of the owner of the path
   * @param {string} pathParam - the path to be checked
   * @returns {boolean} - if the folder exists
   */
  async function folderExists(addrParam, pathParam){
    if(pathParam !== ''){
      const response = await window.point.contract.call({
        contract: 'PointDrive', 
        method: 'getElementMetadata', 
        params: [ addrParam, pathParam]});
      if(response.data[0] === ''){
        return false;
      }else{
        return true;
      }
    }else{
      return true;
    }
  }

  /**
   * Fetch the folder metadata
   * 
   * @param {string} addrParam - the address of the owner of the path
   * @param {string} pathParam - the path to be fetched
   * @returns {StorageElement} - the folder metadata
   */
  async function fetchFolderMetadata(addrParam, pathParam){
    if(pathParam !== ''){
      const response = await window.point.contract.call({
        contract: 'PointDrive', 
        method: 'getElementMetadata', 
        params: [ addrParam, pathParam]});

      if(response.data[0] !== ''){
        const d = response.data;
        setFolderMetadata({
          eElementId: d[0],
          eName: d[1],
          eFullPath: d[2],
          owner: d[3],
          createdAt: d[4],
          sizeInBytes: d[5],
          isFolder: d[6],
          isPublic: d[7]
        });
        console.log('|||||||||1');
        console.log({
          eElementId: d[0],
          eName: d[1],
          eFullPath: d[2],
          owner: d[3],
          createdAt: d[4],
          sizeInBytes: d[5],
          isFolder: d[6],
          isPublic: d[7]
        });
        console.log('|||||||||');
      }else{
        return false;
      }
    }else{
      //root folder
      setFolderMetadata({
        eElementId: '',
        eName: '',
        eFullPath: '',
        owner: addrParam,
        createdAt: 0,
        sizeInBytes: 0,
        isFolder: true,
        isPublic: true
      });
      console.log('|||||||||');
      console.log({
        eElementId: '',
        eName: '',
        eFullPath: '',
        owner: addrParam,
        createdAt: 0,
        sizeInBytes: 0,
        isFolder: true,
        isPublic: true
      });
      console.log('|||||||||');
    }
  }

  //set the address if the wallet address change
  useEffect(() => {
    setAddr(walletAddress);
  }, [walletAddress]);

  //fetch items and folder metadata if path, address or shared property changed
  useEffect(() => {
      fetchItems(addr, path, shared);
      fetchFolderMetadata(addr, path);
  }, [path, addr, shared])

  //handle the validation when the pathProp is changed before fetch the items and metadata. 
  useEffect( async () => {
    try{
      if(pathProp === '' || pathProp === undefined){
        setAddr(walletAddress);
        setPath('');
        return;
      }

      const identityParam = pathProp.split('/')[0];
      const result = await window.point.identity.identityToOwner({
        identity: identityParam,
      });
      let pathParam = '';
      if(pathProp.search('/') > 0){
        pathParam = pathProp.slice(pathProp.search('/') + 1);
      }

      const exists = await folderExists(result.data.owner, pathParam);
      if(!exists){
        Swal.fire({
          title: `This folder does not exists.`,
          icon: 'error'
        })
        return;
      }

      setIdentity(identityParam);
      setAddr(result.data.owner);
      setPath(pathParam);
    }catch(e){
      console.log(e);
      Swal.fire({
        title: `Fail to fetch the path!`,
        icon: 'error'
      })
    }
  }, [pathProp]);

  /**
   * Fetch the items that has a specific path as parent.
   * call setItems with an array of StorageElement fetched. 
   * 
   * @param {string} addrP - Address of the owner 
   * @param {string} pathP - Path for fetching the items
   * @param {boolean} sharedP - If the search if for shared folders with me.
   * 
   * 
   */
  const fetchItems = async (addrP, pathP, sharedP) => {
    
    if(addrP !== '' && addrP !== undefined){
      console.log([addrP, pathP, sharedP]);
      const response = await window.point.contract.call({
        contract: 'PointDrive', 
        method: 'listElements', 
        params: [addrP, pathP, sharedP]});
      if(response.data){
        const mappedData = response.data.map( e => 
          { 
            let eSymmObjFiels;
            if(!e[7] || e[8] !== ''){
              //private or first private and after then public
              eSymmObjFiels = JSON.parse(e[8]);
            }else{
              //public files
              eSymmObjFiels = {
                file: '',
                name: '',
                path: ''
              }
            }
            
            return {
              eElementId: e[0],
              eName: e[1],
              eFullPath: e[2],
              owner: e[3],
              createdAt: e[4],
              size: e[5],
              isFolder: e[6],
              isPublic: e[7],
              eSymmetricObj: eSymmObjFiels.file,
              eSymmetricObjName: eSymmObjFiels.name,
              eSymmetricObjPath: eSymmObjFiels.path,
              isShared: e[9]
            }
          }
        )
        console.log('--------------')
        console.log(mappedData);
        console.log('--------------')
        setItems(mappedData);
      }
      
    }
  }

  /**
   * Opens the dialog for upload a file
   * 
   */  
  async function openUploadDialog(){
    if(identity !== identityProp){
      Swal.fire({
        title: `You cannot upload a file to a folder that is not yours.`,
        icon: 'error'
      })
      return;
    }

    //check if the folder exists
    const exists = await folderExists(addr, path);
    if(!exists){
      Swal.fire({
        title: `This folder does not exists. Create it to upload files.`,
        icon: 'error'
      })
      return;
    }
    
    //open the dialog
    //TODO: Improve or remove this inline HTML
    Swal.fire({
      title: 'Upload File',
      html:
      '<input id="file-input" class="form-control" type="file">' +
      '<div class="form-check" style="text-align: left; margin-left: 10px; margin-top: 5px;">' +
        '<input class="form-check-input" type="radio" name="visibility" value="private" id="isFilePrivate" checked>' +
        '<label class="form-check-label" for="flexRadioDefault1">' +
          ' Private' +
        '</label>' +
      '</div>' + 
      '<div class="form-check" style="text-align: left; margin-left: 10px;">' +
        '<input class="form-check-input" type="radio" name="visibility" value="public" id="isFilePublic" >' +
        '<label class="form-check-label"  for="flexRadioDefault2">' +
          ' Public' +
        '</label>' +
      '</div>',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showClass: {
          popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
      },
      showCancelButton: true,
      confirmButtonText: 'Upload',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        //method called to save, show the spinner while saving 
        try{
          const fileToUpload = document.getElementById('file-input').files[0];
          const isPublic = document.getElementById('isFilePublic').checked;
          console.log(fileToUpload);
          console.log(isPublic);

          //validate file existence and size
          if (fileToUpload && fileToUpload.size > 100 * 1024 * 1024){
            alert('Point Drive for now only supports files until 100 MB.')  
          }
          //upload the file
          if(fileToUpload){
            //setup data
            const formData = new FormData()
            formData.append("postfile", fileToUpload);
            let fileId = '';
            let encryptedSymmetricObj = '';
            let pathName = path + (path !== '' ? '/' : '') + fileToUpload.name;
            let fileName = fileToUpload.name;

            if(isPublic){
              //public file
              const res = await window.point.storage.postFile(formData);
              fileId = res.data;
            }else{
              //private file
              const res = await window.point.storage.encryptAndPostFile(formData, [identity], [fileName, pathName]);
              console.log(res);
              fileId = res.data;
              console.log('-------- METADATA --------- ');
              console.log(res.metadata);
              console.log('--------------------------- ');
              fileName = res.metadata[0];
              pathName = res.metadata[1];

              //just first field (file)
              encryptedSymmetricObj = JSON.stringify({
                file: res.encryptedMessagesSymmetricObjs[0][0].encryptedSymmetricObjJSON,
                name: res.encryptedMessagesSymmetricObjs[1][0].encryptedSymmetricObjJSON,
                path: res.encryptedMessagesSymmetricObjs[2][0].encryptedSymmetricObjJSON,
              });

              console.log('-------- SYMM --------- ');
              console.log(res.encryptedMessagesSymmetricObjs);
              console.log(encryptedSymmetricObj);
              console.log('--------------------------- ');
            }

            console.log('FileId created: ' + fileId);
            if(fileId){
              //if the file was uploaded

              /*
              let fileName = fileToUpload.name;
              let fileIdSO = '';
              if(!isPublic){
                let result = await window.point.wallet.encryptData({ publicKey, data: fileId });
                fileId = result.data.encryptedMessage;
                fileIdSO = result.data.encryptedSymmetricObjJSON;
              }
              */

              console.log('File create:')
              console.log([ fileId, 
                fileName,
                pathName, 
                folderMetadata.eFullPath, 
                fileToUpload.size,
                isPublic,
                encryptedSymmetricObj]);

              //store index data in the blockchain
              const response = await window.point.contract.call({
                contract: 'PointDrive', 
                method: 'newFile', 
                params: [ fileId, 
                          fileName,
                          pathName, 
                          folderMetadata.eFullPath, 
                          fileToUpload.size,
                          isPublic,
                          encryptedSymmetricObj]});
              
              console.log('$$$$$$$$$');
              console.log(response);
              console.log('$$$$$$$$$')
              if(response){
                return response;
              }

            }
          } else {
            //no file selected
            throw new Error('Select a file to upload');
          }
        } catch(e){
          //show validation errors
          Swal.showValidationMessage(e.message);
        }
      },
      allowOutsideClick: () => !Swal.isLoading()  
    }).then((response) => {
      //after save is confirmed
      console.log('ffffffffff');
      console.log(response);
      console.log('ffffffffff');
      if (response.isConfirmed) {
        //show the success msg
        Swal.fire({
          title: `File Uploaded with Success!`,
        }).then(() => {
          //fetch the items again
          fetchItems(addr, path, false);
        })
      }
    })
  }

  /**
   * Open the dialog for creating a new folder
   */
  async function openNewFolderDialog(){

    //check the authorization to create a folder
    if(identity !== identityProp){
      Swal.fire({
        title: `You cannot create a folder inside a folder that is not yours.`,
        icon: 'error'
      })
      return;
    }

    //check if the folder already exists
    const exists = await folderExists(addr, path);
    if(!exists){
      Swal.fire({
        title: `This folder does not exists. Create it to create inner folders.`,
        icon: 'error'
      })
      return;
    }

    //Open the dialog for creating a new folder
    //TODO: Improve or remove this inline HTML
    Swal.fire({
        title: 'New folder',
        html:
          '<div class="mb-3" style="text-align: left;" >' +
            '<label for="folder-name" class="form-label">Name</label>' +
            '<input type="text" class="form-control" id="folder-name" >' + 
          '</div>' + 
          '<div class="form-check" style="text-align: left; margin-left: 10px; margin-top: 5px;">' +
            '<input class="form-check-input" type="radio" name="visibility" value="private" id="isFolderPrivate" checked>' +
            '<label class="form-check-label" for="flexRadioDefault1">' +
              ' Private' +
            '</label>' +
          '</div>' + 
          '<div class="form-check" style="text-align: left; margin-left: 10px;">' +
            '<input class="form-check-input" type="radio" name="visibility" value="public" id="isFolderPublic" >' +
            '<label class="form-check-label"  for="flexRadioDefault2">' +
              ' Public' +
            '</label>' +
          '</div>',
        inputAttributes: {
          autocapitalize: 'off'
        },
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        },
        showCancelButton: true,
        confirmButtonText: 'Create',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          //method called to save, show the spinner while saving 
          try{
            //get and prepare data
            let folderName = document.getElementById('folder-name').value;
            let isPublic = document.getElementById('isFolderPublic').checked;
            console.log('!!!!!!!!!!!!!!');
            console.log(folderName);
            console.log(isPublic);
            console.log('!!!!!!!!!!!!!!');

            let fullPath = path + (path !== '' ? '/' : '') + folderName;
            let eSymmObjFields = '';
            //if is not public (private)
            if(!isPublic){
              //encrypt name name and folder path metadata
              let folderNameEnc = await window.point.wallet.encryptData({ publicKey, data: folderName })
              let fullPathEnc = await window.point.wallet.encryptData({ publicKey, data: fullPath });
              folderNameEnc = folderNameEnc.data;
              fullPathEnc = fullPathEnc.data;
              eSymmObjFields = {
                name: folderNameEnc.encryptedSymmetricObjJSON,
                path: fullPathEnc.encryptedSymmetricObjJSON
              }
              eSymmObjFields = JSON.stringify(eSymmObjFields);
              folderName = folderNameEnc.encryptedMessage;
              fullPath = fullPathEnc.encryptedMessage;
            }
            //encryptedMessage, encryptedSymmetricObj, encryptedSymmetricObjJSON

            console.log([folderName, 
              fullPath, 
              path, 
              isPublic, eSymmObjFields]);
            
            //call the contract to save metadata
            const response = await window.point.contract.call({
                contract: 'PointDrive', 
                method: 'newFolder', 
                params: [folderName, 
                  fullPath, 
                  path, 
                  isPublic, eSymmObjFields]});
            console.log('$$$$$$$$$');
            console.log(response);
            console.log('$$$$$$$$$')
            if(response){
              return response;
            }
          } catch(e){
            //show errors
            Swal.showValidationMessage(e.message);
          }
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((response) => {
        //after confirming the savbe
        console.log('ffffffffff');
        console.log(response);
        console.log('ffffffffff');
        if (response.isConfirmed) {
          //show the success mgs
          Swal.fire({
            title: `Folder Created with Success!`,
          }).then(() => {
            //fetch new items
            fetchItems(addr, path, false);
          })
        }
      })
    } 


  //render the home page
  return (
    <>
      <div className="sub-navbar">
        <Container onClick={closeContextMenu}>
          <Breadcrumb addrParam={addr} identity={identity} path={path} setPath={setPath} decyptedPath={decyptedPath} isPublic={folderMetadata.isPublic} />
          <Toolbar uploadHandler={openUploadDialog} newFolderHandler={openNewFolderDialog} />
        </Container>
      </div>

      <Container className="p-3">
      <div className="row" style={{paddingBottom: 30}}>
        {/* <div className="col-2" style={{borderRight: '1px solid gray', paddingRight: 20, minHeight: 400}}>
          <Sidebar setAddr={setAddr} walletAddress={walletAddress} setIdentity={setIdentity} identityProp={identityProp} setPath={setPath} />
        </div> */}

        <div className="col-12">
          <ItemList items={items} itemSelected={itemSelected}
              openContextMenu={openContextMenu} setDecryptedPath={setDecryptedPath}
              setItemSelected={setItemSelected} setPath={setPath} />
        </div>
      </div>
      <div className="dropdown" style={{position: 'fixed', 
      left: contextMenuState.x, top: contextMenuState.y}}>
          <ul className={ contextMenuState.open ? "dropdown-menu show" : "dropdown-menu"} aria-labelledby="dropdownMenuButton1">
              <Share itemSelected={itemSelected} fetchItems={fetchItems} addr={addr} path={path} />
              {
              /*
              <li><a className="dropdown-item" href="#">Download</a></li>
              <li><a className="dropdown-item" href="#">Delete</a></li>
              <li><a className="dropdown-item" href="#">Move to</a></li>
              <li><a className="dropdown-item" href="#">Copy to</a></li>
              <li><a className="dropdown-item" href="#">Rename</a></li>
              <li><a className="dropdown-item" href="#">Details</a></li>
              */
              }
          </ul>
      </div>
      </Container>
    </>
  );
}
