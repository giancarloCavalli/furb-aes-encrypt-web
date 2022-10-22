async function download(content) {
  if (isDownloadReady() === false) {
    alert("Informe a chave de criptografia para prosseguir com o download do arquivo cifrado!")

    return
  }

  const fileHandle = await getNewFileHandle()

  await writeFile(fileHandle, content)
}

async function getNewFileHandle() {
  const options = {
    suggestedName: 'aes-encrypt.txt', 
    types: [
      {
        description: 'Text Files',
        accept: {
          'text/plain': ['.txt'],
        },
      },
    ],
  };
  const handle = await window.showSaveFilePicker(options);
  return handle;
}

// fileHandle is an instance of FileSystemFileHandle..
async function writeFile(fileHandle, contents) {
  // Create a FileSystemWritableFileStream to write to.
  const writable = await fileHandle.createWritable();
  // Write the contents of the file to the stream.
  await writable.write(contents);
  // Close the file and write the contents to disk.
  await writable.close();
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

function logAes(keyRawValue) {
  console.log('key', generateKey(keyRawValue))
  console.log('Finale', encrypt(textAreaInput.value, keyInput.value).map(hexMatrix => getSameWithInvertedColsAndRows(hexMatrix)))
}

function getCypher(textAreaValue, keyRawValue) {
  const matrix = encrypt(textAreaValue, keyRawValue)
  
  let cypherText = ''

  matrix.forEach(hexArrayOfArrays => {
    hexArrayOfArrays.forEach(hexArray => {
      hexArray.forEach(hex => {
        cypherText = cypherText.concat(hex)
      })
    })
  })

  console.log('cypherText', cypherText)

  return cypherText
}