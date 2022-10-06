import Item from './Item';
import './ItemsList.css';

/**
 * Render the list of items
 * 
 * @param {object} props 
 * @param {StorageElement[]} props.items - The items from the list (see Home.jsx - StorageElement)
 * @param {function} props.openContextMenu - Callback function to open the context menu
 * @param {string} props.itemSelected - id of the item selected
 * @param {function} props.setItemSelected - Function to mark an item as selected
 * @param {function} props.setPath - Function to set the selected path to fetch items 
 * @param {function} props.setDecryptedPath - Function to set the selected path decrypted to fetch items
 * 
 * @returns {JSX.Element} - render of the list of items
 */
export default function ItemList({items, openContextMenu, itemSelected, 
    setItemSelected, setPath, setDecryptedPath}) {
    //the list of folders
    const folders = items.filter(item => item.isFolder);
    //the list of files
    const files = items.filter(item => !item.isFolder);
     
    if (folders.length === 0 && files.length === 0) return <i>No items found.</i>;

    return (
        <>
            {folders && folders.length > 0 && (
                <div className="itemsContainer">
                    <h4>Folders</h4>

                    <div className="itemsList folders">
                        {folders.map( (item) =>
                            <Item key={item.eElementId} type="folder"
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
                        )}
                    </div>
                </div>
            )}

            {files && files.length > 0 && (
                <div className="itemsContainer">
                    <h4>Files</h4>

                    <div className="itemsList files">
                        {files.map( (item) =>
                            <Item key={item.eElementId} type="file"
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
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
