
export default function Item({identity, path, setPath}){

    console.log(path);
    const pathParts = path ? path.split('/') : [];
    console.log(pathParts);

    function navigate(part){
        if(part === ''){
            setPath(part);
        }else{
            const subpath = path.replace(path.slice(path.search(part) + part.length), '');
            setPath(subpath);
        }
    }

    return(
        <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
                <li className="breadcrumb-item">
                    <a href="#" onClick={() => navigate('')}>
                        {identity ? identity : ''}
                    </a>
                </li>
                {pathParts.map((part) => 
                    <li className="breadcrumb-item"><a href="#" onClick={() => navigate(part)}>{part}</a></li>
                )}
            </ol>
        </nav>
    )

}