export interface Note {
  content: string;
  createdAt: string;
  creator: {
    firstname: string;
    lastname: string;
    profile_pic: string | null;
    username: string;
    _id: string;
  };
}
