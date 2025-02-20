import { Component, TemplateRef, ViewChild, Input, HostListener, NgZone } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { CountryModel } from 'src/app/models/country.model';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service'
import { Helper } from 'src/app/shared/helper';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LocationService } from 'src/app/services/location.service';
import { NotifiyService } from 'src/app/services/notifier.service';
import jwt_decode from "jwt-decode";
import { SwPush } from '@angular/service-worker';
import { OTP_TYPE } from 'src/app/constants/constants';
import { Width } from 'ngx-owl-carousel-o/lib/services/carousel.service';

declare let google:any
// declare let FB: any;

export class AdminDetail {
  userSms: boolean;
  userEmailVerification: boolean;
  is_user_social_login:boolean;
}

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent {
  admin_detail:AdminDetail = new AdminDetail();
  signUp_otp_Verification :boolean = false;
  emailotpValue:number;
  smsotpValue:number;
  otpForEmail:number;
  otpForSMS:number;
  emailError:boolean=false;
  smsError:boolean=false;
  modalRef: BsModalRef | null;
  country_code_modal: BsModalRef;
  forgot_Pass_modal: BsModalRef;
  modalRef2: BsModalRef;
  referral_modal: boolean = false;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-md modal-dialog-centered',
  };
  SearchText: any;
  otpvalue: number;
  buttonDisabled: boolean = false;
  user: UserModel;
  country: Array<CountryModel> = [];
  countries: any = [];
  maxNumberLength: number;
  minNumberLength: number;
  signupForm: UntypedFormGroup;
  loginForm: UntypedFormGroup;
  forgotPasswordForm: UntypedFormGroup;
  loginOtpForm: UntypedFormGroup;
  isChecked: boolean = false;
  contryname: string = '';
  sel_countryphonecode: string = '';
  referral_code: string = '';
  otpFiled: boolean;
  otpSMS: number;
  updatePassField: boolean;
  updatePassForm: UntypedFormGroup;
  is_invalid_email = false;
  userSubscription: Subscription;
  toastSubscription: Subscription;
  TERMS_URL = "legal/user-terms-conditions";
  PRIVACY_URL = "legal/user-privacy-policy";
  IMAGE_URL = environment.IMAGE_URL;
  current_location_phone_code: any;
  is_social_login: boolean = false;
  darkTheme = localStorage.getItem('vien-themecolor')
  logoClr:boolean=false;
  google_object :any
  // facebook_object : any
  register_with_social = false
  is_register = false
  webpush_config_value:any
  SMSOTPSubmitted:boolean = false;
  emailOTPSubmitted:boolean = false;
  singin_type : number = 1 ;
  resendDisabled: boolean = false;
  countdown: number = 60;
  countdownInterval: any;
  alpha2: any;
  first_name_error: boolean = false;
  last_name_error: boolean = false;

  @Input() islogin: any;
  @ViewChild('template', { static: true }) template: TemplateRef<any>;
  @ViewChild('templateNested', { static: true }) templateNested: TemplateRef<any>;

  constructor(private modalService: BsModalService, public _authService: AuthService,public _commanService: CommonService,public helper: Helper,public _locationService: LocationService,private _notifierService: NotifiyService,private ngZone:NgZone,private _swPush:SwPush) {}

  ngOnInit(): void {
    this._locationService.set_current_location();
    this._initForms();
    if(this.helper.user_details){
      this.fetchUserSettingDetail();
    }
    this.userSubscription = this._authService.loginObservable.subscribe((user) => {
      if (user) {
        this.user = user;
      }
    });
    if(this.darkTheme.startsWith('dark') ){
      this.logoClr=true;
    }
  }
  
  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.code === 'Escape') {
      if(this.modalRef){
        this.modalRef.onHidden.subscribe(() => {
          this.is_register = true
          setTimeout(() => {
            this.loginForm.reset()
            this.register_with_social = false
          }, 500)
        })
      }
      if(this.forgot_Pass_modal){
        this.forgot_Pass_modal.onHidden.subscribe(() => {
          this.show();
          setTimeout(() => {
            this.isChecked = true;
            this.otpFiled = false;
            this.updatePassField = false;
            this.otpvalue = null;
            this.forgotPasswordForm.reset();
            this.loginOtpForm.reset();
            this.updatePassForm.reset();
          }, 500)
        })
      }
      if(this.modalRef2){
        this.modalRef2.onHidden.subscribe(() => {
          this.is_register = false;
          this.first_name_error = false;
          this.last_name_error = false;
          setTimeout(() => {
            this.signupForm.reset()
            this.register_with_social = false
          }, 500)
        })
      }
      if(this.referral_modal){
        this.referral_modal = false;
        setTimeout(() => {
          this.referral_code = ''
        }, 500);
      }
    }
  }

  google_initialize(){
        google.accounts.id.initialize({
          client_id: "887837116941-dudds04hdripom76gslb41bpefj3h5aq.apps.googleusercontent.com",
          callback: data => this.handleCredentialResponse(data)
        });
    
        google.accounts.id.renderButton(
          document.getElementById("buttonDiv"),
          { theme: "outline", shape:'square',type:'standard',logo_alignment: "left",	width: "300"}
        );

  }

 

  google_initialize_1(){
    google.accounts.id.initialize({
      client_id: "887837116941-dudds04hdripom76gslb41bpefj3h5aq.apps.googleusercontent.com",
      callback: data => this.handleCredentialResponse(data)
    });

    google.accounts.id.renderButton(
      document.getElementById("buttonDiv1"),
      { theme: "outline", shape:'square',type:'standard',logo_alignment: "left",	width: "300"}
    );
  }

  signUpModalOpen(template: TemplateRef<any>): void {
    this.countrylist();
    if (this.current_location_phone_code) {
      this.sel_countryphonecode = this.current_location_phone_code;
    } else {
      this.sel_countryphonecode = this.countries[0].code;
    }
    this.modalRef2 = this.modalService.show(template, this.config);
    this.google_initialize_1()
  }

  openPhoneCodeModal(openPhoneCode: TemplateRef<any>): void {
    setTimeout(() => {
      let search_country = document.getElementById('search-country');
      search_country.focus();
    }, 500);
    this.country_code_modal = this.modalService.show(openPhoneCode, { class: 'modal-sm modal-dialog-centered ' });
  }

  openforgotPassModal(forgotPass: TemplateRef<any>): void {
    if (this.current_location_phone_code) {
      this.sel_countryphonecode = this.current_location_phone_code;
      this.forgotPasswordForm.patchValue({
        country_phone_code: this.sel_countryphonecode,
      })
    } else {
      this.sel_countryphonecode = this.countries[0].code;
      this.forgotPasswordForm.patchValue({
        country_phone_code: this.sel_countryphonecode,
      })
    }
    this.forgot_Pass_modal = this.modalService.show(forgotPass, this.config);
  }

  openOtpLoginModal(otpLogin: TemplateRef<any>): void {
    if (this.current_location_phone_code) {
      this.sel_countryphonecode = this.current_location_phone_code;
      this.loginOtpForm.patchValue({
        country_phone_code: this.sel_countryphonecode,
      })
    } else {
      this.sel_countryphonecode = this.countries[0].code;
      this.loginOtpForm.patchValue({
        country_phone_code: this.sel_countryphonecode,
      })
    }
  }

  show(): void {
    this.countrylist();
    if (this.sel_countryphonecode) {
      if (this.current_location_phone_code) {
        this.sel_countryphonecode = this.current_location_phone_code;
      } else {
        this.sel_countryphonecode = this.countries[0].code;
      }
    }
    this.modalRef = this.modalService.show(this.template, this.config);
    this.google_initialize()
    this.singin_type = 1;
    if (this.modalRef2) {
      this.modalRef2.hide();
    }
  }

  handleCredentialResponse(value:any){
    this.register_with_social = true
    this.google_object = jwt_decode(value.credential)
    if(this.is_register === true){
      this.registerWithGoogle(this.google_object)
      this.ngZone.run(()=>{
        this.register_with_social = true
      })
    }else{
      this.signInWithGoogle(this.google_object)
    }
  }

  showRegister(): void {
    this.countrylist();
    if (this.sel_countryphonecode) {
      if (this.current_location_phone_code) {
        this.sel_countryphonecode = this.current_location_phone_code;
        this.contryname =this._locationService._current_location.country_name;
        this.alpha2 = this._locationService._current_location.country_code;
      } else {
        this.sel_countryphonecode = this.countries[0].code;
        this.contryname =this.countries[0].name;
      }
    }
    this.is_register=true;
    this.modalRef2 = this.modalService.show(this.templateNested, this.config);
    this.google_initialize_1()
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  closeFirstModal(): void {
    if (!this.modalRef) {
      return;
    }
    this.modalRef.hide();
    this.modalRef = null;
  }

  _initForms() {
    this.signupForm = new UntypedFormGroup({
      first_name: new UntypedFormControl(null, Validators.required),
      last_name: new UntypedFormControl(null, Validators.required),
      email: new UntypedFormControl(''),
      country_phone_code: new UntypedFormControl(null, Validators.required),
      phone: new UntypedFormControl(null, Validators.required),
      password: new UntypedFormControl(null, [Validators.minLength(6)]),
      is_term_checked: new UntypedFormControl(null, Validators.required),
      login_by: new UntypedFormControl('manual'),
      city: new UntypedFormControl(''),
      address: new UntypedFormControl(''),
      social_id:new UntypedFormControl('')
    })
    this.loginForm = new UntypedFormGroup({
      country_phone_code: new UntypedFormControl(null, Validators.required),
      phone: new UntypedFormControl(null, [Validators.required]),
      password: new UntypedFormControl(null, Validators.required),
      recaptcha: new UntypedFormControl(null)
    })
    this.forgotPasswordForm = new UntypedFormGroup({
      email: new UntypedFormControl(null, [Validators.required]),
      phone: new UntypedFormControl(null, [Validators.required]),
      country_phone_code: new UntypedFormControl(null, Validators.required)
    })
    this.loginOtpForm = new UntypedFormGroup({
      phone: new UntypedFormControl(null, [Validators.required]),
      country_phone_code: new UntypedFormControl(null, Validators.required)
    })
    this.updatePassForm = new UntypedFormGroup({
      password: new UntypedFormControl(null, [Validators.required]),
      confirmPassword: new UntypedFormControl(null, [Validators.required]),
    })
  }

  countryPhoneCode(country) {
    this.contryname = country.name;
    this.current_location_phone_code =  country.code ;
    this.loginForm.patchValue({
      country_phone_code : this.current_location_phone_code
    })
    this.sel_countryphonecode = country.code;
    this.alpha2 = country.alpha2;
    this.country_code_modal.hide();
    this.SearchText = '';
  }

  forgotInput(boolean) {
    if (boolean === true) {
      this.isChecked = true;
    } else {
      this.isChecked = false;
    }
  }

  singInType(type) {
    this.singin_type = type
    if (type == 2) {
        this.loginOtpForm.patchValue({
          country_phone_code: this.loginForm.value.country_phone_code,
        })
    }
  }

  async signIn() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    let uuid = this.helper.uuid;
    let device_token = uuid;
    localStorage.setItem('device_token', device_token);
    if (this.sel_countryphonecode) {
      this.loginForm.value.country_phone_code = this.sel_countryphonecode;
    }
    this.buttonDisabled = true;
    let json: any = { country_phone_code: this.loginForm.value.country_phone_code, email: this.loginForm.value.phone, password: this.loginForm.value.password, device_token: device_token, login_by: "manual", device_type: 'web'}
    let webpush_config = await this.requestSubscription()
    json['webpush_config'] = webpush_config
    this._authService.user_login(json).then(islogin => {
      this.helper.islogin = islogin;
      if (islogin) {
        this.modalRef.hide();
        setTimeout(() => {
          this.buttonDisabled = false;
          this.loginForm.reset();
        }, 500)
      } else {
        this.buttonDisabled = false;
      }
    });
  }

  // get web push notification object
  requestSubscription = () => {
    return new Promise((resolve,reject)=>{
      if('Notification' in window && Notification.permission === 'granted'){
        if (!this._swPush.isEnabled) {
          return resolve({})
        }
        this._commanService.get_setting_detail({}).then((user_setting_detail) => {
          this._swPush.requestSubscription({
            serverPublicKey: user_setting_detail.setting_detail.webpush_public_key
          }).then((_) => {
              resolve(JSON.stringify(_))
          }).catch((_) => resolve({}));
        })
      }else{
        resolve({})
      }
    })
  };

  countrylist() {
    let json = {}
    this._commanService.get_setting_detail(json).then(data => {
      this.maxNumberLength = data.setting_detail.maximum_phone_number_length;
      this.minNumberLength = data.setting_detail.minimum_phone_number_length;
      this.admin_detail=data.setting_detail; 
    })
    this._commanService.getCountryList().then(res => {
      this.countries = res.country_list;

      let current_location_country = this.countries.filter(country => country.alpha2 == this._locationService._current_location.country_code);
      if(current_location_country.length > 0){
        this.current_location_phone_code = current_location_country[0].code;
        this.alpha2 = this._locationService._current_location.country_code;
      }else{
        this.current_location_phone_code = null;
      }
      
      if (this.current_location_phone_code) {
        this.loginForm.patchValue({
          country_phone_code: this.current_location_phone_code,
        })
        
        this.contryname=this._locationService._current_location.country_name;
        this.signupForm.patchValue({
          country_phone_code: this.current_location_phone_code,
        })
        this.forgotPasswordForm.patchValue({
          country_phone_code: this.current_location_phone_code,
        })
      } else {
        this.loginForm.patchValue({
          country_phone_code: this.countries[0].code,
        })
        this.contryname= this.countries[0].name;
        this.signupForm.patchValue({
          country_phone_code: this.countries[0].code,
        })
        this.forgotPasswordForm.patchValue({
          country_phone_code: this.countries[0].code,
        })
      }
    })
  }

  // Forgot Password Flow
  forgotPassword() {
    if (this.isChecked === true) {
      if (!this.forgotPasswordForm.value.email) {
        this.forgotPasswordForm.get('email').markAllAsTouched();
        return;
      }
      this.buttonDisabled = true;
      let json: any = { email: this.forgotPasswordForm.value.email, type: 1,device_type:'web' }
      this._authService.user_forgot_password_Email(json).then(isForgot => {
        if (isForgot) {
          this.forgot_Pass_modal.hide();
          setTimeout(() => {
            this.buttonDisabled = false;
            this.isChecked = true;
            this.forgotPasswordForm.reset();
          }, 500)
        } else {
          this.buttonDisabled = false;
        }
      });
    }
    else {
      if (!this.forgotPasswordForm.value.phone) {
        this.forgotPasswordForm.get('phone').markAllAsTouched();
        return;
      }
      if (this.sel_countryphonecode) {
        this.forgotPasswordForm.value.country_phone_code = this.sel_countryphonecode;
      }
      this.buttonDisabled = true;
      let json: any = { phone: this.forgotPasswordForm.value.phone, country_phone_code: this.forgotPasswordForm.value.country_phone_code,device_type:'web' }

      this._authService.forgotPasswordPhone(json).then(isotp => {
        this.startCountdown();
        if (isotp.success) {
          this.buttonDisabled = false;
          this.otpFiled = true;
          this.otpSMS = isotp.otpForSMS;
          this.isChecked = true;
        } else {
          this.buttonDisabled = false;
        }
      });

    }
  }

  forgotPasswordOtp() {
    if (this.sel_countryphonecode) {
      this.forgotPasswordForm.value.country_phone_code = this.sel_countryphonecode;
    }
    this.buttonDisabled = true;
    let json: any = { phone: this.forgotPasswordForm.value.phone, country_phone_code: this.forgotPasswordForm.value.country_phone_code,device_type:'web' }
    this._authService.forgotPasswordPhone(json).then(isotp => {
      this.startCountdown();
      if (isotp.success) {
        this.buttonDisabled = false;
        this.otpFiled = true;
        this.otpSMS = isotp.otpForSMS;
        this.isChecked = true;
      } else {
        this.buttonDisabled = false;
      }
    });
  }

  sendLoginOtp() {
      if (!this.loginOtpForm.value.phone) {
        this.loginOtpForm.get('phone').markAllAsTouched();
        return;
      }
      if (this.sel_countryphonecode) {
        this.loginOtpForm.value.country_phone_code = this.sel_countryphonecode;
      }
      this.buttonDisabled = true;
      let json: any = { phone: this.loginOtpForm.value.phone, country_phone_code: this.loginOtpForm.value.country_phone_code, type: OTP_TYPE.OTP_LOGIN, device_type: 'web' }
      this._authService.forgotPasswordPhone(json).then(isotp => {
        if (isotp.success) {
          this.startCountdown()
          this.buttonDisabled = false;
          this.otpFiled = true;
          this.isChecked = true;
        } else {
          this.buttonDisabled = false;
        }
      });
  }

  startCountdown() {
    this.resendDisabled = true;
    this.countdown = 60;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.countdownInterval);
        this.resendDisabled = false;
      }
    }, 1000);
  }

  async loginOtpSubmit() {
      if (!this.loginOtpForm.value.phone) {
        this.loginOtpForm.get('phone').markAllAsTouched();
        return;
      }
      if (this.sel_countryphonecode) {
        this.loginOtpForm.value.country_phone_code = this.sel_countryphonecode;
      }
      let uuid = this.helper.uuid;
      let device_token = uuid;
      localStorage.setItem('device_token', device_token);
      this.buttonDisabled = true;
      let json: any = { email: this.loginOtpForm.value.phone, country_phone_code: this.loginOtpForm.value.country_phone_code ,otp_sms : this.otpvalue, password: "", device_token: device_token, login_by: "manual", device_type: 'web'}
      let webpush_config = await this.requestSubscription()
      json['webpush_config'] = webpush_config
      this._authService.user_login(json).then(islogin => {
        this.helper.islogin = islogin;
        if (islogin) {
          this.modalRef.hide();
          this.isChecked = true;
          this.otpFiled = false;
          this.updatePassField = false;
          this.otpvalue = null;
          this.singin_type = 1;
          setTimeout(() => {
            this.buttonDisabled = false;
            this.loginForm.reset();
            this.loginOtpForm.reset();
          }, 500)
        } else {
          this.buttonDisabled = false;
        }
      });
  }

  otpsmsMatch() {
    this.buttonDisabled = true;
      if (this.sel_countryphonecode) {
        this.forgotPasswordForm.value.country_phone_code = this.sel_countryphonecode;
      }
      let json: any = { phone: this.forgotPasswordForm.value.phone, country_phone_code: this.forgotPasswordForm.value.country_phone_code , otp_sms :this.otpvalue }

      this._authService.forgotPasswordPhoneOtpCheck(json).then((response) => {
        if (response) {
          this.updatePassField = true;
          this.buttonDisabled = false;
        }else{
          this.buttonDisabled = false;
        }
      });
  }

  updatePassword() {
    if (this.updatePassForm.invalid) {
      this.updatePassForm.markAllAsTouched();
      return;
    }
    this.buttonDisabled = true;
    if (this.updatePassForm.value.password == this.updatePassForm.value.confirmPassword) {
      let json: any = { phone: this.forgotPasswordForm.value.phone, country_phone_code: this.forgotPasswordForm.value.country_phone_code, password: this.updatePassForm.value.confirmPassword }
      this._authService.userupdatePassword(json).then(isSuccess => {
        if (isSuccess) {
          this.forgot_Pass_modal.hide();
          setTimeout(() => {
            this.show();
            this.isChecked = true;
            this.otpFiled = false;
            this.updatePassField = false;
            this.otpvalue = null;
            this.forgotPasswordForm.reset();
            this.updatePassForm.reset();
            this.buttonDisabled = false;
          }, 500)
        }
      });
    } else {
      this.buttonDisabled = false;
      this._notifierService.showNotification('error', this.helper.trans.instant('validation-title.password-not-match'));
    }
  }

  signUp() {
    this.signupForm.patchValue({
      first_name: this.signupForm.value.first_name?.toString().trim(),
      last_name: this.signupForm.value.last_name?.toString().trim(),
      email: this.signupForm.value.email?.toString().trim(),
      phone: this.signupForm.value.phone?.toString().trim(),
      password: this.signupForm.value.password?.toString().trim(),
    })
    if(this.signupForm.value.login_by == 'google'){
      this.signupForm.controls['password'].setValidators(null); 
      this.signupForm.controls['password'].setErrors(null);     
    }
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    this.is_invalid_email = false;
    // refactor let email_validation = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let email_validation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.signupForm.value.email && !email_validation.test(this.signupForm.value.email)) {
      this.is_invalid_email = true;
      return;
    }
    if (this.sel_countryphonecode) {
      this.signupForm.value.country_phone_code = this.sel_countryphonecode;
    }
    if (this.signupForm.value.is_term_checked === true) {
      if (this.admin_detail.userSms) {
        this.sendRegisterOtp();
      } else {
        this.buttonDisabled = true;
        this.register();
      }
    }
  }

  sendRegisterOtp() {
    let json: any = { type: 1, email: this.signupForm.value.email, phone: this.signupForm.value.phone, country_phone_code: this.signupForm.value.country_phone_code,device_type:'web' };
    this._authService.Verification(json).then(data => {
      if (data) {
        this.startCountdown();
        this.buttonDisabled = true;
        this.signUp_otp_Verification = true;
        this.buttonDisabled = true;
        this.otpForEmail = data.otpForEmail;
        this.otpForSMS = data.otpForSMS;
      }
    })
  }

  otpVerification() {
    this.SMSOTPSubmitted = true;
    this.buttonDisabled = false;
    if (this.admin_detail.userSms) {
      if(!this.smsotpValue){
        this.smsError = true;
        return;
      }
      let json: any = { type:1, phone:this.signupForm.value.phone, country_phone_code:this.signupForm.value.country_phone_code , otp_sms :  this.smsotpValue , is_register : true};
      this._authService.forgotPasswordPhoneOtpCheck(json).then((response) => {
        if (response) {
          this.smsError = false;
        this.signUp_otp_Verification = false;
        this.SMSOTPSubmitted = false;
        this.register();
        }else{
          this.smsError = true;
        }
      });
    }
  }

  async register() {
    if(this.first_name_error || this.last_name_error){
      if (this.first_name_error) {
        document.getElementById('first_name')?.focus();
      } else if (!this.first_name_error && this.last_name_error) {
        document.getElementById('last_name')?.focus();
      }
      return;
    }
    const signUpForm = new FormData();
    signUpForm.append('first_name', this.signupForm.value.first_name);
    signUpForm.append('last_name', this.signupForm.value.last_name);
    signUpForm.append('password', this.signupForm.value.password);
    signUpForm.append('email', this.signupForm.value.email);
    signUpForm.append('phone', this.signupForm.value.phone);
    signUpForm.append('country_phone_code', this.signupForm.value.country_phone_code);
    signUpForm.append('alpha2', this.alpha2);
    signUpForm.append('country', this.contryname);
    signUpForm.append('city', this.signupForm.value.city);
    signUpForm.append('login_by', this.signupForm.value.login_by);
    signUpForm.append('address', this.signupForm.value.address);
    signUpForm.append('device_type', 'web');
    if(this.google_object){
      signUpForm.append('social_unique_id',this.google_object.sub)
    }
  
    this.webpush_config_value = await this.requestSubscription()
    if(this.webpush_config_value && Object.keys(this.webpush_config_value).length > 0){
      signUpForm.append('webpush_config',this.webpush_config_value)
    }
    this._authService.user_register(signUpForm).then(Response => {
      if (Response.success) {
        this.emailotpValue = null;
        this.smsotpValue = null;
        let json = {};
        json['user_id'] = this._authService.user_detail.user_id;
        json['server_token'] = this._authService.user_detail.token;
        this.modalRef2.hide();
        if(Response.data.user_detail.country_detail.is_referral === true){
          this.referral_modal = true;
        } else{
          window.location.reload();
        }
        setTimeout(() => {
          this.buttonDisabled = false;
          this.signupForm.reset();
          this.referral_modal = true;
        }, 800);
        this._locationService.set_current_location();
        this.helper.isUpadtedlocalStorage();
      } else {
        this.buttonDisabled = false;
      }
    })
  }

  referralCode(is_skip: number) {
    if (is_skip == 0) {
      if(this.referral_code == ''){
        this._notifierService.showNotification('error', this.helper.trans.instant('error-code.please-enter-referral-code-first'))
        return
      }
    }
    let json: any = { server_token: this.helper.user_details.server_token, user_id: this.helper.user_details._id, is_skip: is_skip, referral_code: this.referral_code };
    this._authService.UserRefrral(json).then(is_success => {
      if (is_success) {
        this.referral_modal = false;
        setTimeout(() => {
          this.referral_code = '';
        }, 500)
        this.helper.isUpadtedlocalStorage();
      }
    })
  }

  signUpClose() {
    this.first_name_error = false;
    this.last_name_error = false;
    this.is_register = false
    this.modalRef2.hide();
    setTimeout(() => {
      this.signupForm.reset()
      this.register_with_social = false
    }, 500)
  }

  loginClose() {
    this.is_register = true
    this.modalRef.hide();
    setTimeout(() => {
      this.loginForm.reset()
      this.register_with_social = false;
      this.loginOtpForm.reset();
      this.otpFiled = false;
    }, 500)
  }

  forgotClose() {
    this.forgot_Pass_modal.hide();
    this.show();
    setTimeout(() => {
      this.isChecked = true;
      this.otpFiled = false;
      this.updatePassField = false;
      this.otpvalue = null;
      this.forgotPasswordForm.reset();
      this.loginOtpForm.reset();
      this.updatePassForm.reset();
    }, 500)
  }

  otpLoginClose() {
    this.show();
    setTimeout(() => {
      this.isChecked = true;
      this.otpFiled = false;
      this.updatePassField = false;
      this.otpvalue = null;
      this.forgotPasswordForm.reset();
      this.loginOtpForm.reset();
      this.updatePassForm.reset();
    }, 500)
  }

  // Clear App Data
  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.toastSubscription) {
      this.toastSubscription.unsubscribe();
    }
  }

  async signInWithGoogle(user:any){
    let uuid = this.helper.uuid
    let device_token = uuid
    localStorage.setItem('device_token', device_token);
    let json = {
      social_unique_id: user.sub,
      login_by: 'google',
      device_token:device_token,
      device_type:'web'
    }
    let webpush_config = await this.requestSubscription()
    json['webpush_config'] = webpush_config
    this._authService.user_social_login(json).then((islogin)=>{
      this.ngZone.run(()=>{
        this.helper.islogin = islogin;
        if (islogin) {
            this.modalRef.hide();
          setTimeout(() => {
            this.buttonDisabled = false;
            this.loginForm.reset();
          }, 500)
        } else {
          this.buttonDisabled = false;
          this._notifierService.showNotification('error',this.helper.trans.instant('error-code.448'));
      }
      })
    })
  }



  registerWithGoogle(user) {
    this.register_with_social = true
    let split_name = user.name.split(' ')
    this.signupForm.patchValue({
      first_name: split_name[0],
      last_name: split_name[1],
      social_id: user.sub,
      login_by: 'google',
      email: user.email
    })
  }



  fetchUserSettingDetail() {
    let json: any = { token: this.helper.user_details.server_token, user_id: this.helper.user_details._id }
    this._commanService.get_setting_detail(json).then((user_setting_detail) => {
      if(user_setting_detail.user_detail.is_referral == 0 && user_setting_detail.country_detail.is_referral ){
        this.referral_modal = true;
      }
    })
  }

  onEditNumberClick(){
    this.otpFiled = false;
    if(this.countdownInterval){
      clearInterval(this.countdownInterval);
    }
  }

  checkCharacterLimitvalidation(value, type) {
    if (type == this.helper.NAME_TYPE.FIRST_NAME) {
      this.first_name_error = this.helper.validateAndUpdateError(value, this.helper.maximum_first_name_character_limit);
    }
    if (type == this.helper.NAME_TYPE.LAST_NAME) {
      this.last_name_error = this.helper.validateAndUpdateError(value, this.helper.maximum_last_name_character_limit);
    }
  }

}