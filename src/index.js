import DeviceSetup from './DeviceSetup';

let state = 0;
let ssid = '';
const setup = new DeviceSetup();
const $ = require('jquery');
$(() => {
	// state 2
	// Now selecting from available Wi-Fi networks
	function scan() {
		const $select = $('#selectForm select');
		setup.scan().then((results) => {
			$select.html('');
			results.forEach((network) => {
				const $option = $('<option>');
				$option.val('name', network.ssid);
				$option.text(network.ssid);
				$option.appendTo($select);
			});
			setup.publicKey();
		}).catch(() => {
			// TODO: Recovery
			setTimeout(scan, 2000);
		});
	}
	function done() {
		$('#select').hide();
		$('#done').show();
	}
	// toggle signup/login labels
	$('#hasAccount').change(() => {
		if ($('#hasAccount').is(':checked')) {
			$('#auth span').html('Account Details');
			$('#authButton').attr('value', 'Log In');
		}
		else {
			$('#auth span').html('Create Account');
			$('#authButton').attr('value', 'Sign Up');
		}
	});

	// configure Wi-Fi network button
	$('#selectForm select').change(() => {
		const network = $('#selectForm select option:selected').html();
		const $confButton = $('#configureButton');
		if (!network) { return $confButton.prop('disabled', true); }
		$confButton.prop('disabled', false);
		ssid = network;
		if (setup.needsPassword(network)) {
			$('#network-passphrase').show();
		}
	});

	// go to build.particle.io
	$('#buildButton').click(() => {
		window.location.href = 'https://build.particle.io/';
	});

	$('#configureButton').click(() => {
		if (!ssid) { return; }
		if (!setup.needsPassword(ssid)) {
			configure();
			return;
		}
		const password = $('#network-passphrase input').val();
		const config = setup.getNetwork(ssid);
		config.password = password;
		setup.configure(config).then((results) => {
			setup.connect().then((results) => {
				done();
			});
		}).catch((error) => {
			console.log(error);
		});
	});

	// 'Get Started' button
	$('#startButton').click(() => {
		$('#start').hide();
		$('#auth').show();
	});

	// rescan for Wi-Fi networks
	$('#rescanButton').click(scan);

	// state 1 -> 2
	// Now probing for connection to Photon
	const interval = setInterval(() => {
		if (state !== 1) { return; }
		setup.deviceInfo().then(() => {
			state = 2;
			clearInterval(interval);
			$('#connect').hide();
			$('#select').show();
			scan();
		}).catch(() => {
			// TODO: intelligent error handling:
			// ERR_ADDRESS_UNREACHABLE, ERR_NETWORK_CHANGED, ERR_CONNECTION_TIMED_OUT
		});
	}, 5000);

	// state 0 -> 1
	// Clicked on login/signup button
	$('#authButton').click(() => {
		const data = { };
		const form = $('#authForm').serializeArray();
		const method = $('#hasAccount').is(':checked') ? 'login' : 'signup';
		form.forEach((object) => { data[object.name] = object.value; });
		setup[method](data).then(() => {
			// TODO: Transition/spinner while doing this; it can lag a bit.
			setup.getClaimCode().then(() => {
				state = 1;
				$('#auth').hide();
				$('#connect').show();
			});
		}, () => {
			// TODO: error handling
		});
	});
});
