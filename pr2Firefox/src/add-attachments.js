'use strict';
// use this key to encrypt attachments.
var aesKeyFile = '';

var ew = undefined;
var files = undefined;

/**
 * Log chosen files to console. Just for debugging.
 */
function handleFileSelect (event) {
	var files = event.target.files;
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		console.log(file);
	};

}
ob('attach').addEventListener('change', handleFileSelect, false);

/**
 * Encrypt attachments
 *
 * @param {object} evt Event button clicked or null
 */
function encryptFile (evt) {
	
	if (ob('attach').files.length > 0){
		if (checkFile()){
			alert('The maximum size of a single file is 25 MB and total size must less than 90 MB.');
			ob('btnEncrypt').classList.remove('loading');
			ob('btnEncrypt').removeAttribute('disabled');
			return;
		}
	}
	var date1 = new Date();
	files = ob('attach').files;
	console.log("xxxxxxxxxx:"+files);

	// generate a random key
	Math.seedrandom((new Date()).getTime() + ' ');
	aesKeyFile = (new Date()).getTime() + ' ' + Math.random();
	aesKeyFile = CryptoJS.MD5(aesKeyFile).toString(CryptoJS.enc.Base16);
	console.log(aesKeyFile);

	// connect to background page to send aesKeyFile.
	var port = chrome.runtime.connect({name: 'send-aes-key-file'});
	port.postMessage({
		actionType: 'send-aes-key-file-to-background',
		aesKeyFile: aesKeyFile
	});

	ob('btnEncrypt').disabled = true;
	ob('btnEncrypt').innerHTML = 'Encrypting...';
	if (typeof(Worker) !== 'undefined'){
		if (typeof(ew) == 'undefined'){
			ew = new Worker('file-worker.js');
			ew.postMessage({
				type: 'encrypt',
				files: files,
				key: aesKeyFile
			});
		}
		ew.onmessage = function (event) {
			ob('btnEncrypt').classList.remove('loading');
			ob('btnEncrypt').removeAttribute('disabled');
			// ob('file-info').value = 'File has been encrypted.';
			var tmpcipher = event.data.cipher;
			var filenames = event.data.filenames;
			var data = event.data.data.split('?');
			filenames = data[0];
			tmpcipher = data[1];
			var arrCipher = tmpcipher.split(STR_SEPERATOR);
			// ob('file-info').value = '';
			var fCipher = '';
			for (var i = 0; i < arrCipher.length; i++) {
				var f = arrCipher[i];
				fCipher += f + STR_SEPERATOR;
				var oldSize = files[i].size;
				var tmpbrowser = event.data.browser;
				// ob('file-info').value += "\n\nName: " + files[i].name + ".";
				// ob('file-info').value += "\nOriginal Size: " + (oldSize / 1024 / 1024).toFixed(2) + " MiB.";
				// ob('file-info').value += "\nSize after Encrypting: " + (f.length / 1024 / 1024).toFixed(2) + " MiB.";
				// ob('file-info').value += "\nBrowser: " + tmpbrowser + ".";
			}
			fCipher = fCipher.substring(0, fCipher.length - STR_SEPERATOR.length);
			// console.log(fCipher.substring(fCipher.length - 10));
			console.log(event.data.data);
			var blob = new Blob([event.data.data], {Type: 'text/plain'});
			var url = URL.createObjectURL(blob);
			console.log(url);
			//saveAs(new Blob([event.data.data], {Type: 'text/plain'}), 'attachments.encrypted');
			// test
			var link = document.createElement("a");
			if (link.download !== undefined) { // feature detection
				// Browsers that support HTML5 download attribute
				link.setAttribute("href", window.URL.createObjectURL(blob));
				link.setAttribute("download","attachments.encrypted");
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			} else {
				alert('CSV export only works in Chrome, Firefox, and Opera.');
			}
			ew.terminate();
			ew = undefined;
			aesKeyFile = '';
			files = undefined;
		}
	}
	else{
		alert('This browser does not support web worker.');
	}
}

// Number of recipients
var noOfRecipients = 0;

// Number of encrypted email for recipients
var encryptedEmail = 0;

// Add event handler for btnEncrypt
// Loading effect
ob('btnEncrypt').addEventListener('click', BUTTON_LOADING);
// Encrypt Email
ob('btnEncrypt').addEventListener('click', encryptFile);

/**
 * Check the files user choose.
 *
 * @return true if there is at least 1 file bigger than 25 MB, 
 * or total size of all files is greater than 90 MB.
 * false otherwise.
 */
function checkFile () {
	var files = ob('attach').files;
	var total = 0;
	for (var i = 0; i < files.length; i++) {
		if (files[i].size > 1024 * 1024 * 25){
			return true;
		}
		total += files[i].size;
		if (total > 90 * 1024 * 1024){
			return true;
		}
	}
	return false;
}