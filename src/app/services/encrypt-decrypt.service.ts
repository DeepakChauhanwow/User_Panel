import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionDecryptionService {

  private api_key = 'secretKey';
  private localstorage_key = 'localStorageSecretKey';

  async encryptData(data): Promise<any> {
    try {
      const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), this.localstorage_key).toString();
      return ciphertext;
    } catch (error) {
      return error;
    }
  }

  async decryptData(encryptedData): Promise<any> {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.localstorage_key);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      return decryptedData;
    } catch (error) {
      return error;
    }
  }


  async APIEncryptData(data): Promise<any> {
    try {
      const key = CryptoJS.enc.Utf8.parse(this.api_key);
      const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }).toString();
      return ciphertext;
    } catch (error) {
      return error;
    }
  }

  async APIdecryptData(encryptedData): Promise<any> {
    try {
      const key = CryptoJS.enc.Utf8.parse(this.api_key);
      const bytes = CryptoJS.AES.decrypt(encryptedData, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      });
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedData);
    } catch (error) {
      return error;
    }
  }

}
