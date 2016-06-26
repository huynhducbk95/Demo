'use strict';

// user info
var user = {};
var STR_SEPERATOR = 'ngocdon';
// storage single email for 1 recipient
// structure:
// singleEmails = {
// 	'e1@ex.com': 'CtnIuSOas...QkK240ieyL8/VHE',
// 	'e2@ex.net': 'tnIsdfexi...jde25s0ie/tiAcs'
// }
// will be filled right after the time popup windows is created.
var singleEmails = {};

chrome.runtime.sendMessage({
		actionType: 'get-login-status1',
	},
	function (response) {
		if (response.isLoggedIn == 1){
			user = response;
			console.log(user);
		}
	}
)

// Log data to console when user choose files.
function handleFileSelect (event) {
	var files = event.target.files;
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		console.log(file);
	};

}

// add event listener for choosing-files event.
ob('attach').addEventListener('change', handleFileSelect, false);


// use this key to decrypt attachments.
var aesKeyFile = '';

// user's email
var myEmail = getEmailAddress();

// decrypt worker.
var dw = undefined;

/** 
 * Decrypt attachments.
 */
function decryptFile () {
	if (ob('attach').files.length < 1){
		return;
	}

	// check file name.
	if (ob('attach').files[0].name.indexOf('.encrypted') < 0){
		alert('Choose *.encrypted file to decrypt.');
		return;
	}

	if (typeof(Worker) !== 'undefined'){
		if (typeof(dw) == 'undefined'){
			dw = new Worker('file-worker.js');
			dw.postMessage({
				type: 'decrypt',
				file: ob('attach').files[0],
				key: aesKeyFile
			});
		}
		dw.onmessage = function (event) {
			var blob = undefined;
			var dataURL = event.data.dataURL;
			var filenames = event.data.filenames.split(STR_SEPERATOR);
			for (var i = 0; i < dataURL.length; i++) {
				var data = dataURL[i];
				var filename = filenames[i];
				try{
					blob = dataURLToBlob(data);
					var link = document.createElement("a");
					if (link.download !== undefined) { // feature detection
						// Browsers that support HTML5 download attribute
						link.setAttribute("href", window.URL.createObjectURL(blob));
						link.setAttribute("download",filename);
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
					} else {
						alert('CSV export only works in Chrome, Firefox, and Opera.');
					}
					removeAnimation(0);
				}
				catch (e){
					alert('Invalid key.');
					removeAnimation(0);
				}
			}
			dw.terminate();
			dw = undefined;
			removeAnimation(0);
		}
	}
}

// connect to background page
var port = chrome.runtime.connect({name: "Retrieve decrypted email"});
port.onMessage.addListener(function(msg) {
	console.log("contentMaillllllll: "+msg.data);
	// reset
	singleEmails = {};
	
	if (!msg.hasOwnProperty('data')){
		return;
	}
	if (msg.data.length < 1){
		return;
	}
	var d = msg.data;
	$('#text').text(deAlignEmail(d));
	$('#text').val(deAlignEmail(d));

});

/**
 * Decrypt encrypted email
 *
 * @param {string} data Encrypted email
 */
function decryptEmail(data) {
	data = preDecrypt(data);

	// data must be in this format:
	// U2FsdGVkX1/YoCfyJ...IatQmW5q4jfSewveW37HbgA6pGgPuap9mKM=|user@gmail.com
	data = data.split('|');

	if (data.length < 2){
		alert('Data is corrupted.');
		console.log('Data is corrupted.');
		return;
	}
	
	// start decrypting
	if (!user.hasOwnProperty('userId')){
		alert("You have to log in first.");
		return;
	}

	// Chrome has already storaged key pair of this email before.
	try {
		var privateKey = user.encryptedPrivateKey;
		// console.log(privateKey);
		var passphrase = prompt('Enter passphrase of ' + data[1] + ':', '');
		passphrase = CryptoJS.MD5(passphrase).toString(CryptoJS.enc.Base16);
		privateKey = CryptoJS.AES.decrypt(privateKey, passphrase).toString(CryptoJS.enc.Utf8);
		privateKey = preDecrypt(privateKey);
		// console.log('done privateKey');
		var plainText = cryptico.decrypt(data[0], cryptico.RSAKeyFromString(privateKey));
		plainText = decodeURIComponent(escape(plainText.plaintext)).split('|');

		// plainText should consist of 1 or 2 parts.
		// The first part is the original email Alice sends to Bob.
		// The second part (if exist) is the AES secret key used to encrypt attachments.
		// These two parts is seperated by '|'

		// Ex:
		// This is an encrypted email without any attachments.
		// This is an encrypted email with attachments|somekey.
		$('#decrypted').html(function () {
			return plainText[0];
		});
		$('#decrypted').fadeIn();
		if (ob('attach').files.length < 1){

			// without decrypting files, extension can decrypt email very fast.
			// => let it animate in a short time before reverting it to the original state.
			removeAnimation(500);
			// console.log('remove loading UI effect');
		}
		else{
			aesKeyFile = plainText[1];
			console.log(aesKeyFile);
			decryptFile();
		}
	}
	catch (e){
		alert('Email is corrupted or invalid passphrase.');
		removeAnimation(0);
	}
}

ob('btnDecrypt').addEventListener('click', function () {

	// insert data to select#slRecipients
	var contents = ob('text').value.split(STR_SEPERATOR);
	contents.forEach(function (content) {
		var c = '';
		try{
			c = preDecrypt(content);
		}
		catch (e){
			console.log('1 single email corrupted.');
			// window.close();
			return;
		}

		// each element of contents is a email for 1 recipient.
		// in format:
		// cipher|recipient.
		// Example: CtnIuSOas...QkK240ieyL8/VHE|ngocdon127@gmail.com
		var data = c.split('|');
		if (data.length < 2){
			console.log('1 single email content corrupted.');
			// window.close();
			return;
		}
		var emailContent = data[0]; // what???
		var recipient = data[1];

		// fill data to singleEmails object
		singleEmails[recipient] = content;
	});

	if (!user.hasOwnProperty("email") || (typeof(user.email) == 'undefined')){
		alert("Login first.");
		removeAnimation(500);
		return;
	}

	if (singleEmails.hasOwnProperty(user.email)){
		decryptEmail(singleEmails[user.email]);
	}
	else {
		alert("This email wasn't encrypted for " + user.email);
		removeAnimation(500);
	}

});

// Add loading effect
ob('btnDecrypt').addEventListener('click', BUTTON_LOADING);

// remove animation of button decrypt

function removeAnimation (time) {
	var time = parseInt(time);
	if (time < 0) 
		time = 0;
	setTimeout(function () {
		ob('btnDecrypt').classList.remove('loading');
		ob('btnDecrypt').removeAttribute('disabled');
	}, time);
}