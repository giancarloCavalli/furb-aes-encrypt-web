const textAreaInput = document.getElementById('text-area-input')
const keyInput = document.getElementById('key-input')

//https://stackoverflow.com/questions/13405129/create-and-save-a-file-with-javascript
function download(data, type) {
  if (isDownloadReady() === false) {
    alert("Informe a chave de criptografia para prosseguir com o download do arquivo cifrado!")

    return
  }

  const file = new Blob([data], {type: type});
  if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, '');
  else { // Others
      const a = document.createElement("a"),
      url = URL.createObjectURL(file);
      a.href = url;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);  
      }, 0); 
  }
}

//https://web.dev/file-system-access/#read-file
async function openFile(){
  let fileHandle;
  // Destructure the one-element array.
  [fileHandle] = await window.showOpenFilePicker();
  // Do something with the file handle.
  const file = await fileHandle.getFile();
  const contents = await file.text();
  console.log(contents);
  textAreaInput.value = contents;
};

function isDownloadReady() {
  if (keyInput.value === '') return false

  return true
}