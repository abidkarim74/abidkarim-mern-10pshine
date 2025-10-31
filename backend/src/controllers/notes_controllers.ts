import { Note } from "../models/notes_models.js";
import { AuthenticatedRequest } from "../interfaces/auth_interface.js";
import { Response } from "express";


export const auth_notes_list = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: "You are not authenticated!" });
      return;
    }

    const notes = await Note.find({ creator: req.user.id }).populate({
      path: 'creator',
      select: '-password'
    });

    res.status(200).json(notes);

  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};


export const general_notes_list = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: 'You are not authenticated!' });
      return;
    }

    const { search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const filter: any = {
      creator: { $ne: req.user.id }
    };

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: { $regex: searchRegex } },
        { content: { $regex: searchRegex } }
      ];
    }

    const sort: any = {};
    if (typeof sortBy === 'string') {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const notes = await Note.find(filter)
      .populate({
        path: 'creator',
        select: '-password'
      })
      .sort(sort);

    res.status(200).json(notes);

  } catch (err: any) {
    console.log(err.message);
    res.status(500).json({ error: 'Internal server error!' });
  }
}


export const create_note = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: 'You are not authenticated!' });
      return;
    }
    
    const { title, content } = req.body;

    const new_note = await Note.create({ title, content, creator: req.user.id });

    res.status(201).json("New note created!");

  } catch (err: any) {
    console.log(err.message);
    res.status(500).json({ error: 'Internal server error!' });
  }
}


export const update_note = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "You are not authenticated!" });
      return;
    }

    const noteId = req.params.id;
    const { title, content } = req.body;

    const note = await Note.findById(noteId);

    if (!note) {
      res.status(404).json({ error: "Note not found!" });
      return;
    }

    if (note.creator.toString() !== req.user.id.toString()) {
      res.status(403).json({ error: "You cannot edit this note!" });
      return;
    }

    if (title) {
      note.title = title;
    } 
    if (content) {
      note.content = content;
    }

    await note.save();

    res.status(200).json({ message: "Note updated successfully!", note });

  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error!" });
  }
}


export const delete_note = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "You are not authenticated!" });
    }

    const noteId = req.params.id;

    const note = await Note.findById(noteId);
    if (!note) {
      res.status(404).json({ error: "Note not found!" });
      return;
    }

    if (note.creator.toString() !== req.user.id.toString()) {
      res.status(403).json({ error: "You cannot delete this note!" });
      return;
    }

    await Note.findByIdAndDelete(noteId);

    res.status(200).json({ message: "Note deleted successfully!" });

  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};