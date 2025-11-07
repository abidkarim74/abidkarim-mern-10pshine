import type { Request, Response } from "express";
import { User } from "../models/auth_models.js";
import { hash_password_func, verify_password } from "../services/hashing_services.js";
import { generateAccessTokenFunc, generateRefreshTokenFunc } from "../services/token_services.js";
import { verifyAsync, CustomJwtPayload, AuthenticatedRequest } from "../interfaces/auth_interface.js";


export const user_signup = async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, username, password } = req.body;

    const existing_user = await User.findOne({ username });

    console.log("Existing user: ", existing_user)

    if (existing_user) {
      res.status(403).json({ error: 'User already exists!' });
      return;
    }
    const hashed_password = await hash_password_func(password);

    const new_user = await User.create({ username, password: hashed_password, firstname, lastname });

    if (!new_user) {
      res.status(400).json({ error: 'There was an error signing up!' });
      return;
    }

    const access_token = generateAccessTokenFunc({
      id: new_user.id,
      username: new_user.username
    });
    const refresh_token = generateRefreshTokenFunc({
      id: new_user.id,
      username: new_user.username
    });

    res.cookie("refreshToken", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'User created successfully!',
      new_user: {
        id: new_user.id,
        firstname: new_user.firstname,
        lastname: new_user.lastname,
        username: new_user.username,
        profile_pic: new_user.profile_pic
      },
      access_token
    })
   
  } catch (err: any) {
    console.log(err.message);
    res.status(500).json({ error: 'Internal server error!' });
  }
}


export const user_login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await hash_password_func(password);

    const user = await User.findOne({ username });

    if (!user) {
      res.status(403).json({ error: "User does not exist!" });
      return;
    }
    const match = await verify_password(password, user.password);

    if (!match) {
      res.status(403).json({ message: "Password is incorrect!" });
      return;
    }
    const accessToken = generateAccessTokenFunc({
      id: user.id,
      username: user.username,
    });

    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw Error("Error");
    }
    const refreshToken = generateRefreshTokenFunc({
      id: user.id,
      username: user.username,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "User logged in successfully!", accessToken });

  } catch (err: any) {
    console.log(err.message);
    res.status(500).json({ error: 'Internal server error!' });
  }
}


export const auth_user = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'You are not authenticated!' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found!' });
      return;
    }

    res.status(200).json(user);

  } catch (err: any) {
    console.log(err.message);
    res.status(500).json({ error: 'Internal server error!' });
  }
}


export const refresh_token = async (req: Request, res: Response) => {
  try {
    const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

    if (!REFRESH_SECRET) {
      throw new Error("Refresh Token key does not exist in .env!");
    }
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ error: "You are not authenticated!" });
      return;
    }
    const decoded = await verifyAsync(refreshToken, REFRESH_SECRET) as CustomJwtPayload;
    
    if (!decoded) {
      res.status(403).json({error: 'Invalid user!'});
    }
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      res.status(403).json({ error: 'Invalid user!' });
      return;
    }
    const newAccessToken = generateAccessTokenFunc({
      id: decoded.id,
      username: decoded.username,
    });

    res.status(200).json({ accessToken: newAccessToken });

  } catch (err: any) {
    console.log(err.message);
    res.status(500).json({ error: "Internal server error while refreshing token" });
  }
}


export const logout_user = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      console.log("dasda");
      res.status(401).json({ error: "You are not authenticated!" });
      return;
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: '/', 
    });

    res.status(200).json('Logout successfully!');

  } catch (err: any) {
    console.log(err.message);
    res.status(500).json({ error: "Internal server error while logging out" });
  }
}


export const update_profile_image = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "You are not authorized to perform this task!" });
      return;
    }
    
    let updatedData: any = {};

    if (req.file) {
      updatedData.profile_pic = `/uploads/profile-pictures/${req.file.filename}`;
    } else {
      
      res.status(400).json({ error: "No file uploaded!" });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.log("hh")
      res.status(400).json({ error: "Could not update user!" });
      return;
    }

    res.status(200).json(updatedUser);

  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error while updating profile!" });
  }
};
