
import Item from './Item';

export default function ItemList({items, openContextMenu, itemSelected, setItemSelected, setPath, setDecryptedPath}){

    return(
        <div style={{overflow: "hidden"}} >
            {items && items.length > 0 ? items.map( (item) => 
                        <Item key={item.eElementId} type={item.isFolder ? 'folder' : 'file' } 
                            id={item.eElementId} name={item.eName} path={item.eFullPath}
                            selected={itemSelected === item.eElementId} 
                            isPublic={item.isPublic}
                            eSymmetricObj={item.eSymmetricObj}
                            eSymmetricObjName={item.eSymmetricObjName}
                            eSymmetricObjPath={item.eSymmetricObjPath}
                            openContextMenu={openContextMenu} 
                            setItemSelected={setItemSelected}
                            setPath={setPath}
                            setDecryptedPath={setDecryptedPath}
                            />
            ) : <i>No items found.</i>}
        </div>
    )

}