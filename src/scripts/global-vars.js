let file = {}

const textAreaInput = document.getElementById('text-area-input')
const keyInput = document.getElementById('key-input')

const logButton = document.getElementById('log-aes-button')

logButton.setAttribute('onclick', 'logAes(keyInput.value)')