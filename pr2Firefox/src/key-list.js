var ul = ob('ulKeys');

(function () {
	chrome.storage.local.get('indexes', function (items) {
		if (!jQuery.isEmptyObject(items)){
			var indexes = items.indexes;
			indexes.forEach(function (i) {
				chrome.storage.local.get(i, function (obs) {
					var key = obs[i];
					var li = document.createElement('li');
					var span = document.createElement('span');
					span.setAttribute('class', 'col-md-7');
					span.innerHTML = i;
					li.appendChild(span);
					li.setAttribute('class', 'list-group-item');
					li.style.height = '60px';
					var div = document.createElement('div');
					div.style.display = 'inline-block';
					li.appendChild(div);
					li.addEventListener('mouseover', function () {
						li.children[1].children[0].style.transition = 'linear all 0.3s';
						li.children[1].children[1].style.transition = 'linear all 0.3s';
						jQuery(li.children[1].children[0]).css('background', '#d9534f');
						jQuery(li.children[1].children[0]).css('border-color', '#d9534f');
						jQuery(li.children[1].children[1]).css('background', '#337ab7');
						jQuery(li.children[1].children[1]).css('border-color', '#337ab7');
					});
					li.addEventListener('mouseout', function () {
						jQuery(li.children[1].children[0]).css('background', 'white');
						jQuery(li.children[1].children[0]).css('border-color', 'white');
						jQuery(li.children[1].children[1]).css('background', 'white');
						jQuery(li.children[1].children[1]).css('border-color', 'white');
					})
					if (key.isPairKey == 1){
						span.innerHTML += ' <span class="badge">Full</span>';

					}
					var btnDel = document.createElement('button');
					btnDel.setAttribute('data', i);
					btnDel.setAttribute('class', 'btn-del btn btn-danger');
					btnDel.innerHTML = 'Delete this key';
					div.appendChild(btnDel);
					ul.appendChild(li);
					var btnShow = document.createElement('button');
					btnShow.setAttribute('data', i);
					btnShow.setAttribute('class', 'btn-show btn btn-primary');
					btnShow.innerHTML = 'Show';
					div.appendChild(btnShow);
					jQuery(li.children[1].children[0]).css('background', 'white');
					jQuery(li.children[1].children[0]).css('border-color', 'white');
					jQuery(li.children[1].children[1]).css('background', 'white');
					jQuery(li.children[1].children[1]).css('border-color', 'white');
					jQuery(li.children[1].children[0]).hover(
						function () {
							jQuery(this).css('background', 'yellow');
					}, function () {
							jQuery(this).css('background', '#d9534f');
					})
				})
			})
		}
	});
})();

/**
 * Add onclick event for button
 */
function addEventBtns () {

	// event for Delete buttons
	var btns = document.getElementsByClassName('btn-del');
	// console.log(btns);
	for (var i = 0; i < btns.length; i++) {
		var btn = btns[i];
		btn.addEventListener('click', function (evt) {
			// console.log(evt.target.getAttribute('data'));
			var email = evt.target.getAttribute('data');
			var c = confirm('Delete key for ' + email + '?');
			if (c == false){
				return;
			}
			chrome.storage.local.remove(email, function () {
				chrome.storage.local.get('indexes', function (items) {
					var indexes = items.indexes;
					var pos = -1;
					while ((pos = indexes.indexOf(email)) > -1){
						indexes.splice(pos, 1);
					}
					chrome.storage.local.set({indexes: indexes}, function () {
						window.location = (window.location.href);
					})
				})
			})
		})
	}

	// event for Show buttons
	var btns = document.getElementsByClassName('btn-show');
	for (var i = 0; i < btns.length; i++) {
		var btn = btns[i];
		btn.addEventListener('click', function (evt) {
			var email = evt.target.getAttribute('data');
			chrome.storage.local.get(email, function (items) {
				var key = items[email];
				jQuery('#modal-show-key').modal('show');
				// Fill data to modal
				ob('email').value = email;
				ob('email').innerHTML = email;
				ob('pubKey').value = key.public;
				ob('pubKey').innerHTML = key.public;
				ob('privKey').innerHTML = '';
				ob('privKey').setAttribute('data', key.private);
			})
		})
	}
}

/**
 * Show private key
 */
ob('btnShowPrivateKey').addEventListener('click', function () {
	var email = ob('email').innerHTML;
	ob('privKey').innerHTML = ob('privKey').value = '';
	var priv = ob('privKey').getAttribute('data');
	if (priv.length < 1){
		alert('Private Key of ' + email + ' is not exist.');
		return;
	}
	var passphrase = prompt('Enter passphrase for email ' + ob('email').innerHTML);
	try{
		var p = CryptoJS.AES.decrypt(priv, passphrase).toString(CryptoJS.enc.Utf8);
		p = preDecrypt(p).split('|');
		/**
		 * p[0] is Private Key
		 * p[1] is the corresponding email
		 */
		if (email != p[p.length - 1]){
			alert('Email not match');
		}
		else{
			ob('privKey').innerHTML = priv;
			ob('privKey').value = priv;
		}
	}
	catch (e){
		alert('Passphrase is incorrect.');
	}
})

// Handle buttons' click event
document.addEventListener('DOMContentLoaded', function () {
	setTimeout(addEventBtns, 100);
})

// Import public key of other people, save to Chrome LocalStorage
ob('btnImportPublicKey').addEventListener('click', function () {
	var p = ob('pub').value;
	if (p.length < 1){
		alert('Paste public key.');
		return;
	}
	publicKey = preDecrypt(p);

	/**
	 * Public Key should have 2 parts which are seperated by '|' : publicKey|email:
	 * Ex: NBC1kO...CqHd3i=|huyfly14@yahoo.com.vn
	 * The first part is the real public key thay Cryptio can understand.
	 * The second part is the corresponding email.
	 */
	var data = publicKey.split('|');
	if (data.length < 2){
		alert('Public key is invalid.');
		return;
	}
	console.log(publicKey);
	var email = data[1];
	chrome.storage.local.get(email, function (items) {
		if (!jQuery.isEmptyObject(items)){
			var c = confirm('Email ' + email + ' has already saved before. Overwrite?');
			if (c == true){
				var ob = {};
				ob[email] = {
					isPairKey: 0,
					public: p,
					private: ''
				}
				chrome.storage.local.set(ob, function () {
					location.reload(true);
				});
			}
		}
		else{
			var ob = {};
			ob[email] = {
				isPairKey: 0,
				public: p,
				private: ''
			}
			chrome.storage.local.set(ob, function () {
				addIndexes(email, function () {
					location.reload(true);
				});
			});
		}
	})
});

// Import Key Pair, save to Chrome LocalStorage
ob('btnImportKeyPair').addEventListener('click', function () {
	var encryptedPriv = ob('priv').value;
	if (encryptedPriv.length < 1){
		alert('Paste Private Key.');
		return;
	}
	var passphrase = ob('passphrase').value;
	try{
		var priv = CryptoJS.AES.decrypt(encryptedPriv, passphrase).toString(CryptoJS.enc.Utf8);
		priv = preDecrypt(priv);
		var data = priv.split('|');

		/**
		 * Private Key must have enough parameters
		 */
		if (data.length < parametersBigint.length){
			throw new Error('Private Key is corrypted.');
		}
		var email = data[data.length - 1];
		var p = data[0] + '|' + email;
		p = preEncrypt(p);
		chrome.storage.local.get(email, function (items) {
			if (!jQuery.isEmptyObject(items)){
				var c = confirm('Email ' + email + ' has already saved before. Overwrite?');
				if (c == true){
					var ob = {};
					ob[email] = {
						isPairKey: 1,
						public: p,
						private: encryptedPriv
					}
					chrome.storage.local.set(ob, function () {
						location.reload(true);
					});
				}
			}
			else{
				var ob = {};
				ob[email] = {
					isPairKey: 1,
					public: p,
					private: encryptedPriv
				}
				chrome.storage.local.set(ob, function () {
					addIndexes(email, function () {
						location.reload(true);
					});
				});
			}
		})
	}
	catch (e){
		alert(e.toString());
	}
});