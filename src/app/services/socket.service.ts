import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class SocketService {
	private socket: any;

	constructor() {
		this.setupSocketConnection();
	}

	// setup socket
	setupSocketConnection() {
		// this.socket = io(CONFIG.apiUrl, {
		this.socket = io(environment.SOCKET_URL, {
			query: {
				token: 'test-auth-token'
			}
		});
	}

	/** @deprecated use listener insted of listen*/
	listen = (eventName: string) => {
		return new Observable((subscriber) => {
			this.socket.on(eventName, (data) => {
				subscriber.next(data);
			});
		});
	}

	listener = (eventName: string) => {
		return new Observable((subscriber) => {
			this.socket.on(eventName, (data) => {
				subscriber.next(data);
			});
		});
	}

	emit = (eventName, data) => {
		this.socket.emit(eventName, data);
	}

	removeListener = (eventName, data) => {
		this.socket.removeListener(eventName, data);
	}

	connectRoom = (roomId) => {
		this.socket.emit('room', roomId);
	}
	disconnetRoom = (roomId) => {
		this.socket.emit('removeRoom', roomId);
	}

}
