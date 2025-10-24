export interface AuthUser {
  id: string,
  username: string,
  profile_pic: string,
  firstname: string,
  lastname: string
}



export interface SignupFormData {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface SignupErrors {
  firstname?: string;
  lastname?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  general?: string;
}
