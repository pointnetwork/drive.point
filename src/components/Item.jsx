
import './Item.css'

export default function Item({id, name, type, path, openContextMenu, selected, setItemSelected, setPath}) {

    function openItem(e){
        console.log('opened');
        console.log(e.target);
        if(type == 'folder'){
            setPath(path);
        }
    }

    function openContextMenuHandler(e){
        e.preventDefault()
        openContextMenu(parseInt(e.clientX), parseInt(e.clientY))
        setItemSelected(id);
    }

    return(
        
        <div className={ selected ?  "itemSelected" : "item"} 
            onDoubleClick={openItem} 
            onContextMenu={openContextMenuHandler}
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
            </div>
            <div align="center" style={{fontSize: 11}}>{name}</div>
        </div>
            
    )
}
