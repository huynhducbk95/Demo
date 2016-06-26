

// id of Gmail tab.
var sourceTabId = '';

// use this key to encrypt and decrypt attachment.
var aesKeyFile = '';

chrome.browserAction.onClicked.addListener(function (tab) {
	chrome.tabs.create({url: '/src/key-list.html'}, function (tab) {
		// body...
	});
})
// add context menu
chrome.contextMenus.create({
	title: "Decrypt this message.",
	contexts: ["selection"],
	onclick: clickHandler
});

// Context Menu click handler
function clickHandler (data, tab) {
	console.log(data.selectionText);
	chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {actionType:'get-content-ecrypted'}, function (response) {
				var content = response.content;
				console.log(content);
				chrome.tabs.create({
					url: "/src/decrypt-email.html"
				});
				chrome.runtime.onConnect.addListener(function(port) {
					port.postMessage({

						/**
						* Character ZERO WIDTH SPACE (unicode u200B - 8203) 
						* sometimes appears in selectionText when user double click.
						*		 remove it and trim() string before sending to decrypt-email.html
						*/
						data: content
					});
				});
			})
	});
}
chrome.runtime.onConnect.addListener(function (port) {
	port.onMessage.addListener(function (msg,sender,sendResponse) {
		if (msg.actionType === 'send-aes-key-file-to-background'){
				aesKeyFile = msg.aesKeyFile;
				console.log(aesKeyFile);
				chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
					chrome.tabs.sendMessage(sourceTabId, {actionType: 'send-aes-key-file-to-content-script', aesKeyFile: aesKeyFile}, function (response) {
						
					})
				})
		}
			
	});
});

// handle message from content scripts/*
chrome.runtime.onConnect.addListener(function (port){
	port.onMessage.addListener(function (msg) {

		// check login
		if (msg.name == "get-login-status"){
			chrome.storage.local.get("info", function (items) {
				console.log(items);
				if (items.info.isLoggedIn == 1){
					port.postMessage({
						name: 'login-status',
						isLoggedIn: 1,
						email: items.info.email
					});
				}
				else{
					port.postMessage({
						name: 'login-status',
						isLoggedIn: 0
					})
				}
			})
		}

		// login
		else if (msg.name == 'login'){
			var username = msg.username;
			var password = msg.password;

		}
	})
});
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
	if(request.actionType=="get-login-status1"){
		chrome.storage.local.get("info", function (items) {
			console.log(items);
			if (items.info.isLoggedIn == 1){
				//console.log("items.info.isLoggedIn=  ");
				sendResponse({
					name: 'login-status',
					isLoggedIn: 1,
					email: items.info.email,
					hashedPassword: items.info.hashedPassword,
					publicKey: items.info.publicKey,
					userId: items.info.userId,
					encryptedPrivateKey: items.info.encryptedPrivateKey
				});
			}
			else{
				sendResponse({
					name: 'login-status',
					isLoggedIn: 0
				})
			}
		});
	}else if (request.actionType === 'check-recipients-exist'){
		var data = request;
		console.log(data);
		$.ajax({
			url: 'http://localhost:8081/E2EE/user/checkExistedUsers',
			type: 'POST',
			data: JSON.stringify(data),
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Accept", "application/json");
				xhr.setRequestHeader("Content-Type", "application/json");
			},
			success: function(data) { 
				// alert("success");
				sendResponse({
					name: 'recipients-status',
					data: data
				});
				return false;
			},
			error:function(data,status,er) { 
				alert("error");
			}
		})
	}
	else if (request.actionType === 'request-public-key'){
		
		var data = request;
		$.ajax({ 
			url: 'http://localhost:' + SERVER_PORT + '/E2EE/key/requestPublicKey', 
			type: 'POST', 
			dataType: 'json', 
			data: JSON.stringify(data),
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Accept", "application/json");
				xhr.setRequestHeader("Content-Type", "application/json");
				// console.log(data);
				// console.log(JSON.stringify(data));
			},
			success: function(data) { 
				// alert("success");
				console.log(data);
				sendResponse({
					name: 'requested-public-keys',
					data: data
				});
				return false;
			},
			error:function(data,status,er) { 
				alert("error");
			}
		});
	}
	else if (request.actionType === 'register-multiple-users'){
		// handle later
		var data = request;
		console.log(data);
		var ru = data['requestedUsers'];
		for (var i = 0; i < ru.length; i++) {

			// 123123 is implicit
			ru[i].password = CryptoJS.MD5('123123').toString(CryptoJS.enc.Base16);
			var rsa = generateRSAKey(ru[i].email, ru[i].password, 1024);
			ru[i].publicKey = rsa.public;
			ru[i].encryptedPrivateKey = rsa.private;
		}
		jQuery.ajax({
			url: 'http://localhost:' + SERVER_PORT + '/E2EE/user/registerUsers',
			type: 'POST',
			data: JSON.stringify(data),
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Accept", "application/json");
				xhr.setRequestHeader("Content-Type", "application/json");
			},
			success: function(data) { 
				// alert("success");
				console.log(data);
				if (data.result === 'success'){
					for (var i = 0; i < ru.length; i++) {

						// 123123 is implicit
						delete ru[i].password;
						delete ru[i].encryptedPrivateKey;
					}
					sendResponse({
						name: 'send-registered-users',
						data: ru
					});
				}
				return false;
			},
			error:function(data,status,er) { 
				alert("error");
			}
		});
	}
	else if (request.actionType === 'open-add-attachments-frame'){
		// Save Gmail tab id.
		chrome.tabs.query({active: true, currentWindow: true}, function (tabs){ 
			sourceTabId = tabs[0].id;
		});
		chrome.tabs.create({
			url: "/src/add-attachments.html"
		});
	}
	else if (request.actionType === 'get-aes-key-file'){
		sendResponse({
			aesKeyFile: aesKeyFile
		});
	}
	return true;  // call sendResponse async - very important
})