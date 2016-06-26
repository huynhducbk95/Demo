function encrypt () {
	var text = ob('text').value;
	var key = ob('key').value;
	var encrypted = CryptoJS.AES.encrypt(text, key);
	ob('encrypted').value = encrypted.toString();
}
function decrypt() {
	var encrypted = ob('encrypted').value;
	var decrypted = CryptoJS.AES.decrypt(encrypted, ob('key').value);
	ob('decrypted').value = decrypted.toString(CryptoJS.enc.Utf8);
}
function handleFileSelect (event) {
	var files = event.target.files;
	for (var i = 0; i < files.length; i++) {
		file = files[i];
		console.log(file);
	};

}
ob('attach').addEventListener('change', handleFileSelect, false);


var tmpcipher = '';
var tmpFileName = '';

// Async Functions => Good

var ew = undefined;
var dw = undefined;
var oldSize = 0;
var files;
var filenames;

function encryptFile (evt) {
	console.log('start funcs encryptFile');
	var date1 = new Date();
	files = ob('attach').files;
	evt.target.disabled = true;
	evt.target.innerHTML = 'Encrypting...';
	if (typeof(Worker) !== 'undefined'){
		if (typeof(ew) == 'undefined'){
			ew = new Worker('file-worker.js');
			ew.postMessage({
				type: 'encrypt',
				files: files,
				key: ob('key').value
			});
		}
		ew.onmessage = function (event) {
			// var date2 = new Date();
			evt.target.disabled = false;
			evt.target.innerHTML = 'Encrypt File';
			ob('file-info').value = 'File has been encrypted.';
			ob('btnDecryptFile').disabled = false;
			tmpcipher = event.data.cipher;
			filenames = event.data.filenames;
			var data = event.data.data.split('?');
			filenames = data[0];
			tmpcipher = data[1];
			var arrCipher = tmpcipher.split(STR_SEPERATOR);
			console.log(arrCipher.length);
			ob('file-info').value = '';
			var fCipher = '';
			for (var i = 0; i < arrCipher.length; i++) {
				f = arrCipher[i];
				fCipher += f + STR_SEPERATOR;
				oldSize = files[i].size;
				var tmpbrowser = event.data.browser;
				// console.log(f);
				ob('file-info').value += "\n\nName: " + files[i].name + ".";
				ob('file-info').value += "\nOriginal Size: " + (oldSize / 1024 / 1024).toFixed(2) + " MiB.";
				ob('file-info').value += "\nSize after Encrypting: " + (f.length / 1024 / 1024).toFixed(2) + " MiB.";
				// ob('file-info').value += "\nTime Encrypt: " + (date2.getTime() - date1.getTime()) + " ms.";
				ob('file-info').value += "\nBrowser: " + tmpbrowser + ".";
			}
			fCipher = fCipher.substring(0, fCipher.length - STR_SEPERATOR.length);
			console.log(fCipher.substring(fCipher.length - 10));
			// saveAs(new Blob([fCipher], {Type: 'text/plain'}), 'attachments.encrypted');
			saveAs(new Blob([event.data.data], {Type: 'text/plain'}), 'attachments.encrypted');
			ew.terminate();
			ew = undefined;
		}
	}
	else{
		alert('Does not support web worker');
	}
}

function decryptFile (evt) {
	if (ob('attach').files[0].name.indexOf('.encrypted') < 0){
		alert('Chọn file .encrypted để giải mã.');
		return;
	}
	evt.target.disabled = true;
	evt.target.innerHTML = 'Decrypting...';
	if (typeof(Worker) !== 'undefined'){
		if (typeof(dw) == 'undefined'){
			dw = new Worker('file-worker.js');
			dw.postMessage({
				type: 'decrypt',
				file: ob('attach').files[0],
				key: ob('key').value
			});
		}
		dw.onmessage = function (event) {
			var blob = undefined;
			console.log(event.data);
			var dataURL = event.data.dataURL;
			var filenames = event.data.filenames.split(STR_SEPERATOR);
			console.log(filenames);
			for (var i = 0; i < dataURL.length; i++) {
				var data = dataURL[i];
				var filename = filenames[i];
				try{
					blob = dataURLToBlob(data);
					// console.log(evt.target);
					evt.target.disabled = false;
					evt.target.innerHTML = 'Decrypt File';
					saveAs(blob, filename);
				}
				catch (e){
					alert('Key không đúng');
					evt.target.disabled = false;
					evt.target.innerHTML = 'Decrypt File';
				}
			};
			dw.terminate();
			dw = undefined;
		}
	}
}

ob('btnEncryptFile').addEventListener('click', encryptFile);
ob('btnDecryptFile').addEventListener('click', decryptFile);
ob('btnEncrypt').addEventListener('click', encrypt);
ob('btnDecrypt').addEventListener('click', decrypt);
ob('btnOptions').addEventListener('click', function () {
	chrome.tabs.create({url: 'generate-rsa-key.html'}, function (tab) {
	});
});

// connect to background page
var port = chrome.extension.connect({name: "get-email-content"});
port.onMessage.addListener(function (msg) {
	if (msg.emailContent != null){
		$('#text').val(msg.emailContent);
	}
});
port.postMessage({
	encryptedData: $('#encrypted').val()
});

ob('btnTransfer').addEventListener('click', function () {
	console.log('transfer');
	console.log($('#encrypted').val());
	var port = chrome.extension.connect({name: 'transfer-encrypted-data'});
	port.postMessage({
		encryptedData: $('#encrypted').val()
	});
	window.close();
});