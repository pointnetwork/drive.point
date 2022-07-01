
import Item from './Item';

export default function ItemList({items, openContextMenu, itemSelected, setItemSelected, setPath}){

    return(
        <div style={{overflow: "hidden"}} >
            {items && items.length > 0 ? items.map( (item) => 
                        <Item key={item.eElementId} type={item.isFolder ? 'folder' : 'file' } 
                            id={item.eElementId} name={item.eName} path={item.eFullPath}
                            selected={itemSelected === item.eElementId} 
                            isPublic={item.isPublic}
                            eElementIdSymmetricObj={item.eElementIdSymmetricObj}
                            openContextMenu={openContextMenu} 
                            setItemSelected={setItemSelected}
                            setPath={setPath}
                            />
            ) : <i>No items found.</i>}
        </div>
    )

}