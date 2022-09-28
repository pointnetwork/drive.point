import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import NoteAddIcon from '@material-ui/icons/NoteAdd';

const Toolbar = ({newFolderHandler, uploadHandler, shared}) => {

    return (
        <div className="btn-toolbar justify-content-between" role="toolbar" aria-label="Toolbar with button groups">
            <button type="button" className="btn btn-outline-secondary" onClick={newFolderHandler}>
                <CreateNewFolderIcon />
                New Folder
            </button>
            <button type="button" className="btn btn-primary" onClick={uploadHandler}>
                <NoteAddIcon />
                Upload File
            </button>
            {/*
            <div className="btn-group" role="group" aria-label="Second group">
            <button type="button" className="btn btn-outline-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" className="bi bi-sort-down" viewBox="0 0 16 16">
                <path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293V2.5zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z"/>
                </svg>
                &nbsp;Sort
            </button>
            <button type="button" className="btn btn-outline-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                </svg>
                &nbsp; 
                List
            </button>
            </div>
            */}
        </div>
    );
}
    
export default Toolbar
