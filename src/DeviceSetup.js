import Particle from './Particle';
import SoftAP from 'softap-setup';

class DeviceSetup {
	constructor() {
		this.api = new Particle();
		this.sap = new SoftAP();
		this.token = undefined;
		this.claim = undefined;
		this.scans = undefined;
		this.networks = { };
	}
	login(opts) {
		return this.api.login(opts).then((results) => {
			this.token = results.access_token;
			return Promise.resolve(results);
		}).catch((error) => {
			return Promise.reject(error);
		});
	}
	signup(opts) {
		return this.api.createUser(opts).then((results) => {
			this.token = results.access_token;
			return Promise.resolve();
		}).catch(() => {
			return Promise.reject();
		});
	}
	getClaimCode() {
		const props = { auth: this.token };
		return this.api.getClaimCode(props).then((results) => {
			this.claim = results.claim_code;
			return Promise.resolve();
		}).catch(() => {
			return Promise.reject();
		});
	}
	deviceInfo() {
		return new Promise((resolve, reject) => {
			this.sap.deviceInfo((error) => {
				if (error) { return reject(error); }
				resolve();
			});
		});
	}
	publicKey() {
		return new Promise((resolve, reject) => {
			this.sap.publicKey((error) => {
				if (error) { return reject(error); }
				console.log('got public key');
				resolve();
			});
		});
	}
	scan() {
		return new Promise((resolve, reject) => {
			this.sap.scan((error, results) => {
				if (error) { return reject(error); }
				if (results && results.scans) {
					results.scans.forEach((network) => {
						this.networks[network.ssid] = network;
					});
					return resolve(results.scans);
				}
				reject(new Error('Malformed response from device.'));
			});
		});
	}
	configure(opts) {
		return new Promise((resolve, reject) => {
			this.sap.configure(opts, (error, results) => {
				if (error) { return reject(error); }
				resolve(results);
			});
		});
	}
	connect() {
		return new Promise((resolve, reject) => {
			this.sap.connect((error, results) => {
				if (error) { return reject(error); }
				resolve(results);
			});
		});
	}
	getNetwork(name) {
		return ( this.networks[name] || undefined );
	}
	needsPassword(name) {
		const network = this.getNetwork(name);
		if (network) { return network.sec > 0; }
		return undefined;
	}
}

export default DeviceSetup;
