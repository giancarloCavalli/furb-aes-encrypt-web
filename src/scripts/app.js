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
      {
        description: 'Images',
        accept: {
          'image/*': ['.png', '.gif', '.jpeg', '.jpg']
        }
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
async function openFile(keyRawValue){
  let fileHandle;
  // Destructure the one-element array.
  [fileHandle] = await window.showOpenFilePicker();
  // Do something with the file handle.
  const file = await fileHandle.getFile();

  const cypherContent = getCypher(await getAsByteArray(file), keyRawValue)

  console.log('cypherContent', cypherContent)

  saveFile(cypherContent)
  
  const contents = await file.text();
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

function getCypher(byteArray, keyRawValue) {
  console.log('byteArray', byteArray)

  const matrix = encrypt(byteArray, keyRawValue)
  
  let aesEncryptedBytes = []

  matrix.forEach(hexArrayOfArrays => {
    hexArrayOfArrays.forEach(hexArray => {
      hexArray.forEach(hex => {
        aesEncryptedBytes.push(hexToBytes(hex))
      })
    })
  })

  return aesEncryptedBytes  
}

async function saveFile(content) {
  let rawData = [...content]
  let blob = new Blob([new Uint8Array(rawData)],{type:'application/octet-stream'})

  downloadBlob(blob, 'aes-encrypt.bin');
}

async function getAsByteArray(file) {
  return new Uint8Array(await readFile(file))
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    // Create file reader
    let reader = new FileReader()

    // Register event listeners
    reader.addEventListener("loadend", e => resolve(e.target.result))
    reader.addEventListener("error", reject)

    // Read file
    reader.readAsArrayBuffer(file)
  })
}

// Convert a hex string to a byte array
function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }

  return bytes[0];
}

const downloadURL = (data, fileName) => {
  const a = document.createElement('a')
  a.href = data
  a.download = fileName
  document.body.appendChild(a)
  a.style.display = 'none'
  a.click()
  a.remove()
}

const downloadBlob = (data, fileName) => {

  const url = window.URL.createObjectURL(data)

  downloadURL(url, fileName)

  setTimeout(() => window.URL.revokeObjectURL(url), 1000)
}