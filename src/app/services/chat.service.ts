import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { BehaviorSubject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export enum ChatType {
    "USER",
    "ADMIN",
    "PROVIDER"
}

@Injectable({ providedIn: 'root' })
export class ChatService {

    sender_type = '10';
    _chatObservable = new BehaviorSubject<any>(null);
    chatRef;

    constructor(private fireDB: AngularFireDatabase, private afAuth: AngularFireAuth, private _auth: AuthService, private http: HttpClient) {
        this._auth.loginSession.subscribe((data) => {
            if (data) {
                this.afAuth.signInWithCustomToken(data.firebase_token).then((userCredential) => { }).catch((error) => { console.error(error); });
            }
        })
    }

    readChat(order_id, is_read, user_id) {
        return new Promise((resolve, rejects) => {
            let chatRef = this.fireDB.database.ref(order_id)
            chatRef.on("value", snapshot => {
                if (snapshot) {
                    let chat_object = snapshot.val()
                    if (chat_object != null && is_read) {
                        let _Object = chat_object[user_id];
                        let keys = Object.keys(_Object)
                        keys.forEach((element, index) => {
                            if (_Object[element].type != this.sender_type && _Object[element].is_read === false) {
                                chatRef.child(user_id).child(element).child("is_read").set(true)
                            }
                        });
                    }
                    this._chatObservable.next(snapshot.val());
                } else {
                    this._chatObservable.next({});
                }
            });

        })
    }


    sendMessage(order_id, chat_type: ChatType, user_id, message) {
        let ref = this.fireDB.database.ref(order_id);
        let key = ref.push().key;
        ref.child(user_id).child(key).set({
            "id": key,
            "is_read": false,
            "message": message,
            "time": new Date().toISOString(),
            "type": Number(this.sender_type),
            'user_id': user_id
        }, function (error) {
            if (error) {
                return false;
            } else {
                return true;
            }
        });
    }

    sendPushNotification(token: string, title: string, body: string, fireBaseKey: string): void {
        const urlString = 'https://fcm.googleapis.com/fcm/send';
        const paramString = {
            to: token,
            notification: { title: title, body: body, sound: 'default' },
            data: { id: '244' }
        };

        let authorization: string = `key=${fireBaseKey}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': authorization
            })
        };

        this.http.post(urlString, paramString, httpOptions)
            .subscribe({
                next: (data) => {
                    console.log('Notification sent successfully:', data);
                },
                error: (error) => {
                    console.error('Error sending notification:', error);
                }
            });
    }

    clearSubscription() {
        if (this.chatRef) {
            this.chatRef.off();
        }
    }
}
