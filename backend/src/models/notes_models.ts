import mongoose from "mongoose";


const notes_schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User'
    }
  },
 
  { timestamps: true } 
);

export const Note = mongoose.model("Note", notes_schema);
