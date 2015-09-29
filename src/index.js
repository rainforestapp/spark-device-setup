import DeviceSetup from './DeviceSetup';
// import React from 'react';
let state = 0;
const setup = new DeviceSetup();
const $ = require('jquery');

$(() => {

	// toggle signup/login
	$('#hasAccount').change(() => {
		if ($('#hasAccount').is(':checked')) {
			$('#auth span').html('Log In');
			$('#authButton').attr('value', 'Login');
		}
		else {
			$('#auth span').html('Sign Up');
			$('#authButton').attr('value', 'Signup');
		}
	});
	$('#startButton').click(() => {
		$('#start').hide();
		$('#auth').show();
	});
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
			$select.change(() => {
				const $network = $('#selectForm select option:selected');
				const $confButton = $('#configureButton');
				if (!$network) { return $confButton.prop('disabled', true); }
				$confButton.prop('disabled', false);
			});
		}).catch(() => {
			// TODO: Recovery
			setTimeout(scan, 2000);
		});
	}

	// state 1
	// Now probing for connection to Photon
	const interval = setInterval(() => {
		if (state !== 1) { return; }
		console.log('probing...');
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

	// state 0
	// Clicked on login/signup button
	$('#authButton').click(() => {
		const data = { };
		const form = $('#authForm').serializeArray();
		const method = $('#hasAccount').is(':checked') ? 'login' : 'signup';
		form.forEach((object) => { data[object.name] = object.value; });
		setup[method](data).then(() => {
			// TODO: Transition/spinner while doing this.

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
