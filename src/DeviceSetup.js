import Particle from './Particle';
import SoftAP from 'softap-setup';

class DeviceSetup {
	constructor() {
		this.api = new Particle();
		this.sap = new SoftAP();
		this.token = undefined;
		this.claim = undefined;
		this.scans = undefined;
	}
	login({ username, password }) {
		return this.api.login({ username, password }).then((results) => {
			this.token = results.access_token;
			return Promise.resolve(results);
		}).catch((error) => {
			return Promise.reject(error);
		});
	}
	signup({ username, password }) {
		return this.api.createUser({ username, password }).then((results) => {
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
	scan() {
		return new Promise((resolve, reject) => {
			this.sap.scan((error, results) => {
				if (error) { return reject(error); }
				if (results && results.scans) {
					this.scans = results.scans;
					return resolve(results.scans);
				}
				reject(new Error('Malformed response from device.'));
			});
		});
	}
}

export default DeviceSetup;
