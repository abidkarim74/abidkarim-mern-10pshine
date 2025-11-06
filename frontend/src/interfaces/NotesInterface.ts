export interface Note {
  _id: string;
  content: string;
  createdAt: string;
  title: string,
  contentHtml: string; 

  creator: {
    firstname: string;
    lastname: string;
    profile_pic: string | null;
    username: string;
    _id: string;
  };
  likers: string[]
}
