

export async function getElementMetadataDecrypted(address, eFullPath){

    const response = await window.point.contract.call({
        contract: 'PointDrive', 
        method: 'getElementMetadata', 
        params: [ address, eFullPath]});

    if(response.data[0] !== ''){
        const d = response.data;
        let metadata = {
            eElementId: d[0],
            eName: d[1],
            eFullPath: d[2],
            owner: d[3],
            createdAt: d[4],
            sizeInBytes: d[5],
            isFolder: d[6],
            isPublic: d[7],
            eSymmObj: d[8],
        };

        if(metadata.isPublic){
            return metadata;
        }

        eSymmObjFiels = {
            file: '',
            name: '',
            path: ''
        }
        eSymmObjFiels = JSON.parse(d[8]);
        metadata.eSymmObj = eSymmObjFiels;
        
        let r = await window.point.wallet.decryptData({
            encryptedData: metadata.eName,
            encryptedSymmetricObj: eSymmObjFiels.name,
        });
        metadata.eName = r.data.decryptedData;

        r = await window.point.wallet.decryptData({
            encryptedData: metadata.eFullPath,
            encryptedSymmetricObj: eSymmObjFiels.path,
        });
        metadata.eFullPath = r.data.decryptedData;

        return metadata;
    }
    return false;

}