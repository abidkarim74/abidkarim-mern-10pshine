import { auth_notes_list, general_notes_list, create_note, update_note, delete_note, toogle_like_note } from "../controllers/notes_controllers.js";
import { Router } from "express";
import { verify_authentication } from "../middleware/auth_middleware.js";


const notes_router = Router();


notes_router.get('/auth-notes', verify_authentication, auth_notes_list);
notes_router.get('/general-notes', verify_authentication, general_notes_list);
notes_router.post('/create-note', verify_authentication, create_note);
notes_router.put('/update-note/:id', verify_authentication, update_note);
notes_router.delete('/delete-note/:id', verify_authentication, delete_note);
notes_router.post('/toogle-like', verify_authentication, toogle_like_note);


export default notes_router;