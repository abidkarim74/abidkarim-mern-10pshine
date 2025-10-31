export interface AuthUser {
  _id: string,
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
}

export interface SignupErrors {
  firstname?: string;
  lastname?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}
