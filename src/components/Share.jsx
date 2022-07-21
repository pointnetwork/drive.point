import Swal from 'sweetalert2';

export default function Share({itemSelected, fetchItems, path, addr}){

    async function openShareDialog(){
        if(itemSelected.isPublic){
          Swal.fire({
            title: `You cannot share a folder that is already public`,
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
                '<input class="form-check-input" type="radio" name="visibility" value="public" id="isPublicShare" checked >' +
                '<label class="form-check-label"  for="flexRadioDefault2">' +
                  ' Public' +
                '</label>' +
              '</div>' +
              '<div class="form-check" style="text-align: left; margin-left: 10px; margin-top: 5px;">' +
                '<input class="form-check-input" type="radio" name="visibility" value="private" id="isRestrictedShare">' +
                '<label class="form-check-label" for="flexRadioDefault1">' +
                  ' Private' +
                '</label>' +
              '</div>',
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
                }

              } catch(e){
                Swal.showValidationMessage(e.message);
                throw e;
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
                fetchItems(addr, path);
              })
            }
          })
    } 


    return(<li><a className="dropdown-item" onClick={openShareDialog} href="#">Share</a></li>);
}