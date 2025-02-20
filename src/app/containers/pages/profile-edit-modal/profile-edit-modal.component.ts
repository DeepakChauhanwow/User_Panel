import { Component, EventEmitter, HostListener, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import { Helper } from 'src/app/shared/helper';
import { environment } from 'src/environments/environment';
import { DEFAULT_IMAGE } from 'src/app/constants/constants';
import { NotifiyService } from 'src/app/services/notifier.service';

@Component({
  selector: 'app-profile-edit-modal',
  templateUrl: './profile-edit-modal.component.html',
  styleUrls: ['./profile-edit-modal.component.scss']
})
export class ProfileEditModalComponent implements OnInit {
  fiveRate = 4;
  modalRef: BsModalRef;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-right'
  };
  user: UserModel = new UserModel();
  userForm: UntypedFormGroup;
  IMAGE_URL = environment.IMAGE_URL;
  DEFAULT_IMAGE = DEFAULT_IMAGE.USER_SQUARE;
  profile_image:any = this.DEFAULT_IMAGE;
  imagefile:Blob;
  email_error = "";
  buttonDisabled:boolean = false;
  first_name_error: boolean = false;
  last_name_error: boolean = false;

  @Input() setting_detail:any;
  @Output() profileHandler : EventEmitter<any> = new EventEmitter();
  @ViewChild('template', { static: true }) template: TemplateRef<any>;

  constructor(private _notifierService:NotifiyService,private modalService: BsModalService, public _authService: AuthService, public _helper: Helper, public _profileService: ProfileService) { }

  childToParentClick(){
   this.profileHandler.emit();
  }

  ngOnInit(): void {
    this._initForm();
  }

  show(): void {
    this.modalRef = this.modalService.show(this.template, this.config);
    this.fetchProfile();
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.code === 'Escape') {
      if(this.modalRef){
        this.modalRef.onHidden.subscribe(() => {
          this.resetForm();
        })
      }
    }
  }

  _initForm() {
    this.userForm = new UntypedFormGroup({
      first_name: new UntypedFormControl(null, Validators.required),
      last_name: new UntypedFormControl(null, Validators.required),
      country_phone_code: new UntypedFormControl(null, Validators.required),
      phone: new UntypedFormControl(null, Validators.required),
      email: new UntypedFormControl('', [Validators.email]),
      password: new UntypedFormControl(null, Validators.required),
      new_password: new UntypedFormControl(""),
      document: new UntypedFormControl("")
    })
  }

  onSelectImageFile(event) {
    let files = event.target.files;
    if (files.length === 0)
      return;
    const mimeType = files[0].type;
    let fileType=this._helper.uploadFile.filter((element)=> {
      return mimeType==element;
    })
    if (mimeType !=fileType) {
        this._notifierService.showNotification('error', this._helper.trans.instant('validation-title.invalid-image-format'));

        return;
    }
    this.imagefile = files[0]
    const reader = new FileReader();
    reader.readAsDataURL(this.imagefile);
    reader.onload = (_event) => {
      this.profile_image = reader.result;
      
    }
  }

  fetchProfile() {
    let json:any = { server_token: this._helper.user_details.server_token, user_id: this._helper.user_details._id }
    this._profileService.fetch_profile(json).then((user_data) => {
      if (user_data != null) {
        this.user = user_data;
        
        this.profile_image = this.IMAGE_URL + this.user.picture;
       
        this.userForm.patchValue({password:this.user.password, first_name: this.user.first_name, last_name: this.user.last_name, email: this.user.email, country_phone_code: this.user.country_phone_code, phone: this.user.phone, document: null });
      } else {
        this._helper._route.navigate(['/'])
      }
    })
  }

  updateProfile() {
    if(this.first_name_error || this.last_name_error){
      if (this.first_name_error) {
        document.getElementById('first_name')?.focus();
      } else if (!this.first_name_error && this.last_name_error) {
        document.getElementById('last_name')?.focus();
      }
      return;
    }
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.email_error = ""
    if (this.userForm.value.email && !this._helper.check_email(this.userForm.value.email)) {
      this.email_error = this._helper.trans.instant('validation-title.email-is-invalid');
      return;
    }

    let profileForm = new FormData();
    profileForm.append('user_id', this._helper.user_details._id);
    profileForm.append('token', this._helper.user_details.server_token);
    profileForm.append('phone', this.userForm.value.phone);
    profileForm.append('email', this.userForm.value.email);
    profileForm.append('first_name', this.userForm.value.first_name);
    profileForm.append('last_name', this.userForm.value.last_name);
    profileForm.append('login_by', this._helper.user_details.login_by);
    profileForm.append('country_phone_code', this.userForm.value.country_phone_code);
    profileForm.append('old_password',this.userForm.value.password);
    
    if(this.imagefile){
      
      profileForm.append('picture',this.imagefile);
    }
    if(this.userForm.value.new_password){
      profileForm.append('new_password',this.userForm.value.new_password);
    }else{
      profileForm.append('new_password',"");
    }
    this.buttonDisabled = true;
    this._profileService.update_profile(profileForm).then(is_update => {
      if (is_update) {
        this.resetForm();
        this.userForm.patchValue({
          new_password: ""
        })
        this.fetchProfile();
        this.modalRef.hide();
        setTimeout(() => {
          this.childToParentClick()
        }, 500);
        this._helper.isUpadtedlocalStorage();
        this.buttonDisabled = false;
      }else{
        this.buttonDisabled = false;
      }
    })
  }

  resetForm(){
    setTimeout(()=>{
      this.userForm.reset();
      this.profile_image = this.DEFAULT_IMAGE;
    },500)
  }

  close_modal(){
    this.modalRef.hide();
    setTimeout(()=>{
      this.userForm.reset();
    },500)
  }

  checkCharacterLimitvalidation(value, type) {
    if (type == this._helper.NAME_TYPE.FIRST_NAME) {
      this.first_name_error = this._helper.validateAndUpdateError(value, this._helper.maximum_first_name_character_limit);
    }
    if (type == this._helper.NAME_TYPE.LAST_NAME) {
      this.last_name_error = this._helper.validateAndUpdateError(value, this._helper.maximum_last_name_character_limit);
    }
  }

}
