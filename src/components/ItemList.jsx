import Item from './Item';
import './ItemsList.css';

export default function ItemList({items, openContextMenu, itemSelected, setItemSelected, setPath, setDecryptedPath}) {
    const folders = items.filter(item => item.isFolder);
    const files = items.filter(item => !item.isFolder);

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