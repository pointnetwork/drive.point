import Container from 'react-bootstrap/Container'
import { useState, useEffect } from 'react';
import './Home.css';
import Sidebar from '../components/Sidebar';
import Toolbar from '../components/Toolbar';
import Breadcrumb from '../components/Breadcrumb';
import ItemList from '../components/ItemList';
import Swal from 'sweetalert2';
 
export default function Home({walletAddress, identityProp, pathProp}) {
  
  const [contextMenuState, setContextMenuState] = useState({open: false, x: 0, y: 0});
  const [items, setItems] = useState([]);
  const [itemSelected, setItemSelected] = useState('');
  const [path, setPath] = useState('');
  const [addr, setAddr] = useState(walletAddress);
  const [identity, setIdentity] = useState(identityProp);
  console.log('+++++++++++++++++');
  console.log(identityProp);
  console.log(identity);
  console.log('+++++++++++++++++');

  function openContextMenu(x, y){
    /*
    setContextMenuState({open: true, x, y});
    */
  }

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

  useEffect(() => {
    setAddr(walletAddress);
  }, [walletAddress]);

  useEffect(() => {
      fetchItems(addr, path);
  }, [path, addr])

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

  const fetchItems = async (addrP, pathP) => {
    
    if(addrP !== '' && addrP !== undefined){
      console.log([addrP, pathP]);
      const response = await window.point.contract.call({
        contract: 'PointDrive', 
        method: 'listElements', 
        params: [addrP, pathP]});
      if(response.data){
        const mappedData = response.data.map( e => 
          { 
            return {
              eElementId: e[0],
              eName: e[1],
              eFullPath: e[2],
              owner: e[3],
              createdAt: e[4],
              sizeInBytes: e[5],
              isFolder: e[6],
              isPublic: e[7]
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

  

  async function openUploadDialog(){
    if(identity !== identityProp){
      Swal.fire({
        title: `You cannot upload a file to a folder that is not yours.`,
        icon: 'error'
      })
      return;
    }

    const exists = await folderExists(addr, path);
    if(!exists){
      Swal.fire({
        title: `This folder does not exists. Create it to upload files.`,
        icon: 'error'
      })
      return;
    }
    
    
    Swal.fire({
      title: 'Upload File',
      input: 'file',
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
      preConfirm: async (fileToUpload) => {
        try{
          console.log(fileToUpload);
          if (fileToUpload && fileToUpload.size > 100 * 1024 * 1024){
            alert('Point Drive for now only supports files until 100 MB.')  
          }
          if(fileToUpload){
            const formData = new FormData()
            formData.append("postfile", fileToUpload);
            const res = await window.point.storage.postFile(formData);
            const fileId = res.data;
            console.log('FileId created: ' + fileId);
            if(fileId){
              const response = await window.point.contract.call({
                contract: 'PointDrive', 
                method: 'newFile', 
                params: [ fileId, 
                          fileToUpload.name,
                          path + (path !== '' ? '/' : '') + fileToUpload.name, 
                          path, 
                          fileToUpload.size,
                          true]});
              
              console.log('$$$$$$$$$');
              console.log(response);
              console.log('$$$$$$$$$')
              if(response){
                return response;
              }

            }
          }
        } catch(e){
          Swal.showValidationMessage(e.message);
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((response) => {
      console.log('ffffffffff');
      console.log(response);
      console.log('ffffffffff');
      if (response.isConfirmed) {
        Swal.fire({
          title: `File Uploaded with Success!`,
        }).then(() => {
          fetchItems(addr, path);
        })
      }
    })
  }

  async function openNewFolderDialog(){
    if(identity !== identityProp){
      Swal.fire({
        title: `You cannot create a folder inside a folder that is not yours.`,
        icon: 'error'
      })
      return;
    }
    const exists = await folderExists(addr, path);
    if(!exists){
      Swal.fire({
        title: `This folder does not exists. Create it to create inner folders.`,
        icon: 'error'
      })
      return;
    }

    Swal.fire({
        title: 'New folder name',
        input: 'text',
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
        preConfirm: async (folderName) => {
          try{
            const response = await window.point.contract.call({
                contract: 'PointDrive', 
                method: 'newFolder', 
                params: [folderName, path + (path !== '' ? '/' : '') + folderName, path, true]});
            console.log('$$$$$$$$$');
            console.log(response);
            console.log('$$$$$$$$$')
            if(response){
              return response;
            }
          } catch(e){
            Swal.showValidationMessage(e.message);
          }
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((response) => {
        console.log('ffffffffff');
        console.log(response);
        console.log('ffffffffff');
        if (response.isConfirmed) {
          Swal.fire({
            title: `Folder Created with Success!`,
          }).then(() => {
            fetchItems(addr, path);
          })
        }
      })
    } 



  return (
    <>
      <Container className="p-3" onClick={closeContextMenu}>
      <div className="row" style={{paddingBottom: 30}}>
        <div className="col-2" style={{borderRight: '1px solid gray', paddingRight: 20, minHeight: 400}}>
          <Sidebar setAddr={setAddr} walletAddress={walletAddress} setIdentity={setIdentity} identityProp={identityProp} setPath={setPath} />
        </div>
        <div className="col-10" style={{paddingLeft: 20}}>
          <Toolbar uploadHandler={openUploadDialog} newFolderHandler={openNewFolderDialog} />
          <br/>
          <Breadcrumb identity={identity} path={path} setPath={setPath} />
          <ItemList items={items} itemSelected={itemSelected} 
              openContextMenu={openContextMenu} 
              setItemSelected={setItemSelected} setPath={setPath} />  
        </div>
      </div>
      <div className="dropdown" style={{position: 'fixed', 
      left: contextMenuState.x, top: contextMenuState.y}}>
          <ul className={ contextMenuState.open ? "dropdown-menu show" : "dropdown-menu"} aria-labelledby="dropdownMenuButton1">
              <li><a className="dropdown-item" href="#">Share</a></li>
              <li><a className="dropdown-item" href="#">Download</a></li>
              <li><a className="dropdown-item" href="#">Delete</a></li>
              <li><a className="dropdown-item" href="#">Move to</a></li>
              <li><a className="dropdown-item" href="#">Copy to</a></li>
              <li><a className="dropdown-item" href="#">Rename</a></li>
              <li><a className="dropdown-item" href="#">Details</a></li>
          </ul>
      </div>
      </Container>
    </>
  );
}
