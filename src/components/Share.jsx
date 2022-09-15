import Swal from 'sweetalert2';
const eccrypto = require('eccrypto');

export default function Share({itemSelected, fetchItems, path, addr}){

    async function openShareDialog(){
        if(itemSelected.isPublic){
          Swal.fire({
            title: `You cannot share a file or folder that is already public`,
            icon: 'error'
          })
          return;
        }
    
        Swal.fire({
            title: 'Share',
            html:
              '<div class="mb-3" style="text-align: left;" >' +
                '<label for="folder-name" class="form-label">Name</label>' +
                '<input type="text" class="form-control" id="file-name" disabled value="' + itemSelected.presentedName + '" >' + 
              '</div>' + 
              '<div class="form-check" style="text-align: left; margin-left: 10px;">' +
                '<input onclick="javascript:document.getElementById(\'identities\').disabled=true;" class="form-check-input" type="radio" name="visibility" value="public" id="isPublicShare" checked >' +
                '<label class="form-check-label"  for="flexRadioDefault2">' +
                  ' Public' +
                '</label>' +
              '</div>' +
              '<div class="form-check" style="text-align: left; margin-left: 10px; margin-top: 5px;">' +
                '<input onclick="javascript:document.getElementById(\'identities\').disabled=false;" class="form-check-input" type="radio" name="visibility" value="private" id="isRestrictedShare">' +
                '<label class="form-check-label" for="flexRadioDefault1">' +
                  ' Private' +
                '</label>' +
              '</div>' + 
              '<div id="idsFields" class="mb-3" style="text-align: left; margin-top: 10px;" >' +
                '<label for="identities" class="form-label">Identities</label>' +
                '<input placeholder="Up to 5 comma separeted ids you want to share" type="text" class="form-control" id="identities" disabled >' + 
                '<div class="form-text">Share only with trusted identities, they also will be able to share this file.</div>' + 
              '</div>' ,
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
            confirmButtonText: 'Share',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
              try{
                let isPublic = document.getElementById('isPublicShare').checked;
                if(isPublic){
                  decryptSymmetricKey = {};

                  let r = await window.point.wallet.decryptSymmetricKey({
                      encryptedSymmetricObj: itemSelected.eSymmetricObj,
                  });
                  decryptSymmetricKey.file = r.data.decryptedSymmetricKey;

                  r = await window.point.wallet.decryptSymmetricKey({
                      encryptedSymmetricObj: itemSelected.eSymmetricObjName,
                  });
                  decryptSymmetricKey.name = r.data.decryptedSymmetricKey;

                  r = await window.point.wallet.decryptSymmetricKey({
                    encryptedSymmetricObj: itemSelected.eSymmetricObjPath,
                  });
                  decryptSymmetricKey.path = r.data.decryptedSymmetricKey;

                  decryptSymmetricKey
                  let symmObjFields = JSON.stringify(decryptSymmetricKey);

                  const response = await window.point.contract.call({
                    contract: 'PointDrive', 
                    method: 'shareToPublic', 
                    params: [ itemSelected.path, 
                              symmObjFields ]});
                  console.log('$$$$$$$$$');
                  console.log(response);
                  console.log('$$$$$$$$$')
                  if(response){
                    return response;
                  }
                } else {
                  //share with private entities.
                  let identities = document.getElementById('identities').value;
                  let ids = identities.split(',');
                  if(ids.length > 5){
                    throw new Error("Maximum number of identities exceded (5)");
                  }

                  let respAll = true;
                  for(let id of ids){
                    id = id.trim();
                    console.log(id);
                    const result = await window.point.identity.identityToOwner({
                      identity: id,
                    });
                    const owner = result.data.owner;

                    //decrypt symmetric key from the file:
                    let r = await window.point.wallet.decryptSymmetricKey({
                        encryptedSymmetricObj: itemSelected.eSymmetricObj,
                    });
                    const decryptedSymmetricKeyFile = r.data.decryptedSymmetricKey;

                    //retrieve the public key of the shared identity
                    const result2 = await window.point.identity.publicKeyByIdentity({
                      identity: id
                    });
                    const pk = result2.data.publicKey;

                    // encrypt the file symmKey with public key of the shared identity -------
                    // Prepare public key buffer
                      const publicKeyBuffer = Buffer.concat([
                        Buffer.from('04', 'hex'),
                        Buffer.from(pk.replace('0x', ''), 'hex')
                    ]);
                    
                    //Encrypt secret information for the recipient with their public key
                    const encryptedSymmetricObj = await eccrypto.encrypt(
                        publicKeyBuffer,
                        Buffer.from(decryptedSymmetricKeyFile)
                    );

                    const encryptedSymmetricObjChunks = {};
                    for (const k in encryptedSymmetricObj) {
                        encryptedSymmetricObjChunks[k] = encryptedSymmetricObj[k].toString('hex');
                    }
                    //-----

                    const fileName = itemSelected.presentedName;
                    const fullPath = fileName;

                    let fileNameEnc = await window.point.wallet.encryptData({ publicKey: pk, data: fileName })
                    let fullPathEnc = await window.point.wallet.encryptData({ publicKey: pk, data: fullPath });
                    fileNameEnc = fileNameEnc.data;
                    fullPathEnc = fullPathEnc.data;
                    eSymmObjFields = {
                      name: fileNameEnc.encryptedSymmetricObjJSON,
                      path: fullPathEnc.encryptedSymmetricObjJSON,
                      file: JSON.stringify(encryptedSymmetricObjChunks)
                    }
                    eSymmObjFields = JSON.stringify(eSymmObjFields);
                    const eName = fileNameEnc.encryptedMessage;
                    const efullPath = fullPathEnc.encryptedMessage;

                    /*
                    shareFileWith(address sharedWith,
                      string calldata eFullOriginalPath,
                      string calldata eId, 
                      string calldata eName, 
                      string calldata eFullPath,
                      uint256 size, 
                      string memory eSymmetricObj
                    */
                    console.log([ owner,
                      itemSelected.path,
                      itemSelected.id,
                      eName,
                      efullPath,
                      itemSelected.size,
                      eSymmObjFields ]);
                    const response = await window.point.contract.call({
                      contract: 'PointDrive', 
                      method: 'shareFileWith', 
                      params: [ owner,
                                itemSelected.path,
                                itemSelected.id,
                                eName,
                                efullPath,
                                itemSelected.size,
                                eSymmObjFields ]});
                    console.log('1$$$$$$$$$');
                    console.log(response);
                    console.log('1$$$$$$$$$')
                    respAll = respAll && response;
                  }
                  if(respAll){
                    return respAll;
                  }
                }
              } catch(e){
                Swal.showValidationMessage(e.message);
                return;
              }
            },
            allowOutsideClick: () => !Swal.isLoading()
          }).then((response) => {
            console.log('ffffffffff');
            console.log(response);
            console.log('ffffffffff');
            if (response.isConfirmed) {
              Swal.fire({
                title: `File shared with Success!`,
              }).then(() => {
                fetchItems(addr, path, false);
              })
            }
          })
    } 

    if(itemSelected.isFolder){
      return (<></>)
    } else {
      return(<li><a className="dropdown-item" onClick={openShareDialog} href="#">Share</a></li>); 
    }
    
}