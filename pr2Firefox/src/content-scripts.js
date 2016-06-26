// constants
var GMAIL = 0;
var HUST_MAIL = 1;
var MAIL_SERVICE = getMailService();

// variables and functions
var STR_SEPERATOR = 'ngocdon';
// monospace
var ALIGN_OPEN_TAG = "<pre>";

var ALIGN_CLOSE_TAG = "</pre>";
// user info
var user = {};

// save editor frame of Gmail.
var element = '';
var editable = '';

// Number of recipients
var noOfRecipients = 0;

// email of recipients
var recipients = [];

// email content
var emailContent = '';

// encrypted email content
var encryptedEmailContent = '';

// Number of encrypted email for recipients
var encryptedEmail = 0;

// use this key to encrypt attachments.
var aesKeyFile = '';

// public key of recipients
var publicKeys = {};

/**
 *	Detect current Email Service
 *
 * @return GMAIL or HUST_MAIL
 */
function getMailService () {
	var gmail = ["mail.google.com"];
	var hustMail = ["mail.hust.vn", "mail.hust.edu.vn"];
	var hostname = window.location.hostname;
	if (gmail.indexOf(hostname) >= 0){
		return GMAIL;
	}
	if (hustMail.indexOf(hostname) >= 0){
		return HUST_MAIL;
	}
	return -1;
}

// button to render extension frame
var e = document.createElement('div');
e.innerHTML = 'Encrypt';
e.id = 'eframe-cryptojs';
e.addEventListener('click', clickHandler);

// check login status
chrome.runtime.sendMessage({
		actionType: 'get-login-status1',
	},
	function (response) {
		if (response.isLoggedIn == 1){
			user = response;
			 console.log(user);
		}
	}
);

/**
 * Get all recipients
 *
 * @return {array} all recipents' email
 */
function getRecipients(){
	if (window.location.hostname === "mail.google.com"){
		var divRecipients = document.getElementsByClassName('vR');
		var result = [];
		for (var i = 0; i < divRecipients.length; i++){
			result.push(divRecipients[i].children[0].getAttribute('email'));
		}
		return result;
	}
	else if (window.location.hostname === "mail.hust.vn"){
		var to = ob('To').value.match(/([\w\.0-9_]*@[\w\.0-9]*)/g);
		var cc = ob('CC').value.match(/([\w\.0-9_]*@[\w\.0-9]*)/g);
		var result = [];
		if (to){
			result = result.concat(to);
		}
		if (cc){
			result = result.concat(cc);
		}
		return result;
	}
}

/**
 * Render button
 */
function clickHandler() {
	console.log('clicked');

	// check login status
	chrome.runtime.sendMessage({
			actionType: 'get-login-status1',
		},
		function (response) {
			console.log('response.isLoggedIn: '+response.isLoggedIn);
			if (response.isLoggedIn == 1){
				user = response;
				console.log(user);
			}
		}
	)
	noOfRecipients = 0;
	recipients = [];
	encryptedEmail = 0;
	encryptedEmailContent = '';

	var isGmail = 0;
	var isHustMail = 1;
	var myEmail;

	var divRecipients = getRecipients();
	for(var i = 0; i < divRecipients.length; i++){
		var e = divRecipients[i];
		if ((recipients.indexOf(e) < 0) && (typeof(e) != 'undefined'))
			recipients.push(e);
	}

	myEmail = getEmailAddress();
	console.log('my Email: '+myEmail);
	if ((recipients.indexOf(myEmail) < 0) && (typeof(myEmail) != 'undefined')){
		recipients.push(myEmail);
	}
	noOfRecipients = recipients.length;
	if (MAIL_SERVICE === GMAIL){
		emailContent = document.getElementsByClassName('Am Al editable LW-avf')[0].innerHTML;
	}
	else if (MAIL_SERVICE == HUST_MAIL){
		emailContent = document.getElementsByTagName("iframe")[0].contentWindow.document.body.innerHTML;
	}
	console.log("emailcontentttttttttttt: "+emailContent);
	
	// request public key

	// need to check if recipient has E2EE account or not
	var data = {};
	if (!user.hasOwnProperty('userId')){
		alert("login first.");
		return;
	}
	data['requestUser'] = {
		userId: user.userId,
		password: user.hashedPassword
	};
	var users = [];
	for (var i = 0; i < recipients.length; i++) {
		users.push({'email': recipients[i]});
	}
	data['requestedUsers'] = users;
	chrome.runtime.sendMessage(
		{
			actionType: 'check-recipients-exist',
			requestUser: data['requestUser'],
			requestedUsers: users
		},
		function (response) {
			if (response.name !== 'recipients-status'){
				return;
			}
			var exist = [];
			var notExist = [];
			var d = response.data;

			// optimize later.
			// Using data['requestedUsers'].filter
			for (var i in d){
				if (d[i] === 'Exist'){
					exist.push({'email': i});
				}
				else if (d[i] === 'Not Exist'){
					notExist.push({'email': i});
				}
			}
			// request public key for user in exist[]
			chrome.runtime.sendMessage({
					actionType: 'request-public-key',
					requestUser: data['requestUser'],
					requestedUsers: exist,
				},
				function (response) {
					if (response.name !== 'requested-public-keys'){
						return;
					}
					// save to global variable.
					publicKeys = response.data;
				}
			)
			// register account for user in notExist[]
			chrome.runtime.sendMessage({
					actionType: 'register-multiple-users',
					requestUser: data['requestUser'],
					requestedUsers: notExist,
				},
				function (response) {
					if (response.name !== 'send-registered-users'){
						return;
					}
					// save to global variable.
					for(var i = 0; i < response.data.length; i++){
						publicKeys[response.data[i].email] = response.data[i].publicKey;
					}
				}
			)
		}
	);

	var intervalEncrypt = setInterval(function () {
		console.log(Object.keys(publicKeys).length + " : " + noOfRecipients);
		if (Object.keys(publicKeys).length >= noOfRecipients){
			clearInterval(intervalEncrypt);

			// Now extension can start encrypting email.
			console.log('start encrypting');
			chrome.runtime.sendMessage({actionType: "get-aes-key-file"}, function (response) {
				aesKeyFile = response.aesKeyFile;
				console.log('aesKeyFile get from background');
				console.log(aesKeyFile);
				encryptEmail();
			});
			console.log('done');
		}
	}, 1000);

}

var interval;
if (MAIL_SERVICE === GMAIL){
	fRender = function () {
		try{
			// try to bind Gmail editor
			editable = document.getElementsByClassName('Am Al editable LW-avf')[0];
			// toolbar in Gmail editor.
			var tr = document.getElementsByClassName('n1tfz')[0];
			var div = null;
			element = editable.parentElement;

			// if Gmail editor is opening
			if (tr != null){
				var check = 0;
				var td = tr.children[3];
				div = td.children[0];
				for (var i = 0; i < div.children.length; i++) {
					child = div.children[i];
					if (child.id == 'eframe-cryptojs'){
						check = 1;
						break;
					}
				}
				if (check != 1){
					// element.appendChild(e);
					e.setAttribute('class', 'wG J-Z-I btn btn-primary');
					div.appendChild(e);
					var atms = document.getElementsByClassName('wG J-Z-I')[0];
					atms = $(atms).clone();
					$(atms).prop('id', 'e2eesa');
					$(atms).appendTo(div);

					// handle click event for Encrypted Attachment Button
					$(atms).on('click', function () {
						chrome.runtime.sendMessage(
							{
								actionType: 'open-add-attachments-frame',
							}, 
							function (response) {
								console.log(response);
						});
					})
				}
				else{
				}
			}
		}
		catch (e){

		}
	}
}

else if (MAIL_SERVICE === HUST_MAIL){
	fRender = function () { 
		try{
			// try to bind HustMail editor
			// editable = document.getElementsByClassName('cke_show_borders')[0];
			editable = document.getElementsByTagName("iframe")[0].contentWindow.document.body;

			// toolbar in HustMail editor.
			var table = document.getElementsByClassName('Header')[1];

			var img = $(".HeaderImg").detach();
			table.children[0].children[0].appendChild(e);
			var atms = document.createElement("td");
			atms.innerHTML = "attach";
			$(atms).appendTo($(table.children[0].children[0]));
			$(img[1]).appendTo($(table.children[0].children[0]));

			// handle click event for Encrypted Attachment Button
			$(atms).on('click', function () {
				chrome.runtime.sendMessage(
					{
						actionType: 'open-add-attachments-frame',
					}, 
					function (response) {
						console.log(response);
				});
			})
		}
		catch (err){
			console.log(err);
		}
	}
}

// render extension button after DOM loaded 5s.
setTimeout(function () {
	if (MAIL_SERVICE === GMAIL){
		// Try to render every 1000
		interval = setInterval(fRender, 1000);
	}
	else if (MAIL_SERVICE === HUST_MAIL){
		fRender();
	}
}, 5000);
var fRender;

// receive encrypted email
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.actionType === 'send-aes-key-file-to-content-script'){
		console.log(sender);
		aesKeyFile = request.aesKeyFile;
		console.log("1111111111111: "+request.aesKeyFile);
	}else if(request.actionType==='get-content-ecrypted'){
		var urlCurrent = $(location).attr('hostname');
		console.log(urlCurrent);
		var temp = "";
		var content = "";
		if(urlCurrent == "mail.google.com"){
			temp = $('.a3s div pre').html();
            var arrTemp = temp.split("<wbr>");
            for(i=0; i < arrTemp.length; i++){
                   content += arrTemp[i];
            }
		} else if((urlCurrent === "mail.hust.vn")||(urlCurrent==="mail.hust.edu.vn")){
			content = top.frames["Main"].document.getElementsByClassName('Fixed')[0].children[0].children[0].textContent;
			console.log('content: '+content);
		}
		sendResponse({content:content});
	}
});

/**
 * Encrypt the whole email
 */
function encryptEmail () {

	//add aesKeyFile to the original email.
	//send it to recipient.
	//so that recipient can decrypt attachments.
	console.log('emailContentt: '+emailContent);
	var plainText = emailContent + '|' + aesKeyFile;
	 console.log('plainText:'+ plainText);
	// var plainText = emailContent;
	var flags = {
		ef: 0
	}

	if (noOfRecipients < 1){
		alert('Select at least 1 recipient.');
		// ob('btnEncrypt').classList.remove('loading');
		// ob('btnEncrypt').removeAttribute('disabled');
		return;
	}

	// Encrypt email for recipients.
	for (var i = 0; i < recipients.length; i++) {
		var recipient = recipients[i];
		log('start encrypting email for ' + recipient);
		ee(recipient, plainText, flags);
	}
	var interval = setInterval(function () {
		log(encryptedEmail + ' / ' + noOfRecipients + ' done.');
		// finish encrypting
		if (encryptedEmail >= noOfRecipients){
			// remove the last STR_SEPERATOR
			encryptedEmailContent = encryptedEmailContent.substring(0, encryptedEmailContent.length - STR_SEPERATOR.length);
			// align email
			encryptedEmailContent = alignEmail(encryptedEmailContent);
			if (MAIL_SERVICE === GMAIL){
				document.getElementsByClassName('Am Al editable LW-avf')[0].innerHTML = encryptedEmailContent;
			}
			else if (MAIL_SERVICE === HUST_MAIL){
				document.getElementsByTagName("iframe")[0].contentWindow.document.body.innerHTML = encryptedEmailContent;
			}
			clearInterval(interval);
			log('done');
		}
	}, 1);
}

/**
 * Encrypt 1 single email for 1 recipient.
 *
 * @param {string} recipient Email address of recipient
 * @param {string} plainText The original email that will be encrypt
 * @param {object} obj Flags
 */
function ee (recipient, plainText, obj) {

	var data = preDecrypt(publicKeys[recipient]);
	data = data.split('|');
	if (data[1] != recipient){
		alert('Email is not matched.');
		return;
	}
	var publicKey = data[0];
	var cipher = cryptico.encrypt(unescape(encodeURIComponent(plainText)), publicKey);
	encryptedEmailContent += preEncrypt(cipher.cipher + '|' + recipient) + STR_SEPERATOR;
	encryptedEmail++;
}