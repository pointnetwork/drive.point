import Container from 'react-bootstrap/Container'
import { useState, useEffect } from 'react';
import './Home.css';
import Sidebar from '../components/Sidebar';
import Toolbar from '../components/Toolbar';
import Breadcrumb from '../components/Breadcrumb';
import ItemList from '../components/ItemList';
import Swal from 'sweetalert2';
 
export default function Home({walletAddress, identity}) {
  
  const [contextMenuState, setContextMenuState] = useState({open: false, x: 0, y: 0});
  const [items, setItems] = useState([]);
  const [itemSelected, setItemSelected] = useState('');
  const [path, setPath] = useState('');
  const [addr, setAddr] = useState(walletAddress);

  function openContextMenu(x, y){
    setContextMenuState({open: true, x, y});
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

  useEffect(() => {
    setAddr(walletAddress);
  }, [walletAddress]);

  useEffect(() => {
      fetchItems(addr, path);
  }, [path, addr])


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

  function openNewFolderDialog(){
  }

  function openNewFolderDialog(){
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
          <Sidebar setPath={setPath} />
        </div>
        <div className="col-10" style={{paddingLeft: 20}}>
          <Toolbar newFolderHandler={openNewFolderDialog} />
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
