// connect to background page
var port = chrome.runtime.connect({name: "get-login-status"});

// send message to get login status
port.postMessage({
	name: 'get-login-status'
});

// receive login status
port.onMessage.addListener(function (msg) {
	//console.log(msg);
	if (msg.name === 'login-status'){
		if (msg.isLoggedIn == 1){
			// alert('ok');
			ob('home').children[0].children[0].innerHTML = "<h2>" + msg.email + "</h2>";
			var btn = document.createElement('button');
			$(btn).addClass('btn btn-primary');
			$(btn).text('Log out');
			$(btn).on('click', function () {
				chrome.storage.local.clear(function () {
					alert('Signed Out.');
					window.close();
				})
			});
			ob('home').children[0].children[0].appendChild(btn);
			// need to do something here to switch tab
		}
		else{
			// alert('no no');
		}
	}
});

$('#btnLogIn').on('click', function () {
	var email = $('#email').val();
	var password = $('#password').val();
	var hashedPassword = CryptoJS.MD5(password).toString(CryptoJS.enc.Base16);

	// connect to server to check infomation
	var data = {
		'email': email,
		'password': hashedPassword
	}
	console.log("sdfsadfsadf");
	$.ajax({ 
		url: 'http://localhost:8081/E2EE/user/login', 
		type: 'POST', 
		dataType: 'json', 
		data: JSON.stringify(data),
		beforeSend: function(xhr) {
			xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("Content-Type", "application/json");
			console.log(data);
			console.log(JSON.stringify(data));
		},
		success: function(data) {
			console.log(data.email);			
			//alert("success");
			
			if ((data.hasOwnProperty('result')) && (data.result == 'Login Fail')){
				alert("User or password is invalid");
				console.log("ccccccccccccc");
				return;
			};
			ob('home').children[0].children[0].innerHTML = "<h2>" + data.email + "</h2>";
			var btn = document.createElement('button');
			$(btn).addClass('btn btn-primary');
			$(btn).text('Log out');
			$(btn).on('click', function () {
				chrome.storage.local.clear(function () {
					alert('Signed Out.');
					window.close();
				})
			});
			ob('home').children[0].children[0].appendChild(btn);
			var info = {
				isLoggedIn: 1,
				userId: data.userId,
				email: data.email,
				hashedPassword: hashedPassword,
				publicKey: data.publicKey,
				encryptedPrivateKey: data.encryptedPrivateKey
			}
			console.log(info);
			alert('start saving');
			chrome.storage.local.set({info: info}, function (item) {
				console.log("success login");
			})
			localStorage.storage.local.get("info", function (items) {
				console.log(items);
			});
		},
		error:function(data,status,er) { 
			alert("error");
			// user = {};
		}
	});
});

$('#btnReg').on('click', function () {

	// Email is used to seed random in cryptico library by this statement:
	// Math.seedrandom(sha256.hex(email));
	var email = ob('reg-email').value.trim();
	if (email.length < 1){
		alert('Email must not be null.');
		return;
	}

	// check if email is valid or not.
	var emailRegex = /.+@.+\..+/;
	if (emailRegex.test(email) == false){
		alert('Invalid email.');
		return;
	}

	var password = ob('reg-password').value;
	if (password.length < 1){
		alert('Passphrase must not be null.');
		return;
	}

	if (password !== ob('reg-password-repeat').value){
		alert('Password not match.');
		return;
	}

	var hashedPassword = CryptoJS.MD5(password).toString(CryptoJS.enc.Base16);

	var key = generateRSAKey(email, hashedPassword, 1024);

	var data = {
		"email": email,
		"password": hashedPassword,
		"publicKey": key.public, 
		"encryptedPrivateKey": key.private
	}

	console.log(data);
	
	$.ajax({ 
		url: 'http://localhost:8081/E2EE/user/register', 
		type: 'POST', 
		dataType: 'json', 
		data: JSON.stringify(data),
		beforeSend: function(xhr) {
			xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("Content-Type", "application/json");
			console.log(data);
			console.log(JSON.stringify(data));
		},
		success: function(data) { 
			alert("success");
			console.log(data);
			return false;
		},
		error:function(data,status,er) { 
			alert("Email is already exist.");
		}
	});
});

// dany santos
function sign_up() {
	var inputs = document.querySelectorAll('.input_form_sign');
	document.querySelectorAll('.ul_tabs > li')[0].className="";
	document.querySelectorAll('.ul_tabs > li')[1].className="active";
	for (var i = 0; i < inputs.length ; i++  ) {
		if(i == 2  ) {
		} else {
			document.querySelectorAll('.input_form_sign')[i].className = "input_form_sign d_block";
		}
	}
	setTimeout( function() {
		for (var d = 0; d < inputs.length ; d++  ) {
			document.querySelectorAll('.input_form_sign')[d].className = "input_form_sign d_block active_inp";
		}
	}
	,100 );
	document.querySelector('.link_forgot_pass').style.opacity = "0";
	document.querySelector('.link_forgot_pass').style.top = "-5px";
	document.querySelector('.btn_sign').innerHTML = "SIGN UP";
	setTimeout(function() {
		document.querySelector('.terms_and_cons').style.opacity = "1";
		document.querySelector('.terms_and_cons').style.top = "5px";
	}
	,500);
	setTimeout(function() {
		document.querySelector('.link_forgot_pass').className = "link_forgot_pass d_none";
		document.querySelector('.terms_and_cons').className = "terms_and_cons d_block";
	}
	,450);
}
function sign_in() {
	var inputs = document.querySelectorAll('.input_form_sign');
	document.querySelectorAll('.ul_tabs > li')[0].className = "active";
	document.querySelectorAll('.ul_tabs > li')[1].className = "";
	for (var i = 0; i < inputs.length ; i++  ) {
		switch(i) {
			case 1:
				console.log(inputs[i].name);
				break;
			case 2:
				console.log(inputs[i].name);
			default: 
			document.querySelectorAll('.input_form_sign')[i].className = "input_form_sign d_block";
		}
	}
	setTimeout( function() {
		for (var d = 0; d < inputs.length ; d++  ) {
			switch(d) {
				case 1:
						console.log(inputs[d].name);
				break;
				case 2:
						console.log(inputs[d].name);
				default:
				document.querySelectorAll('.input_form_sign')[d].className = "input_form_sign d_block";
				document.querySelectorAll('.input_form_sign')[2].className = "input_form_sign d_block active_inp";
			}
		}
	}
	,100 );
	document.querySelector('.terms_and_cons').style.opacity = "0";
	document.querySelector('.terms_and_cons').style.top = "-5px";
	setTimeout(function() {
		document.querySelector('.terms_and_cons').className = "terms_and_cons d_none";
		document.querySelector('.link_forgot_pass').className = "link_forgot_pass d_block";
	}
	,500);
	setTimeout(function() {
		document.querySelector('.link_forgot_pass').style.opacity = "1";
		document.querySelector('.link_forgot_pass').style.top = "5px";
		for (var d = 0; d < inputs.length ; d++  ) {
			switch(d) {
				case 1:
				 console.log(inputs[d].name);
				break;
				case 2:
				 console.log(inputs[d].name);
				break;
				default:
				 document.querySelectorAll('.input_form_sign')[d].className = "input_form_sign";
			}
		}
	}
	,1500);
	document.querySelector('.btn_sign').innerHTML = "SIGN IN";
}



$('#li_sign_in').on('click', sign_in)
$('#li_sign_up').on('click', sign_up)