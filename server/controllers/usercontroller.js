// Sign up a new user

import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import cloudinary from '../lib/cloudinary.js'
import bcrypt from "bcryptjs"
export const signup = async (req,res)=>{
    const {fullName,email,password,bio} = req.body;
    try{
        if(!fullName || !email || !password || !bio){
            return res.json({success: false , message:"Missing details"})
        }
        const user = await User.findOne({email});
        if(user){
            return res.json({success: false , message:"Account already exists"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(password,salt);

        const newuser = await User.create({
            fullName,email,password:hashedpassword,bio
        });
        const token = generateToken(newuser._id)
        res.json({success: true, userdata : newuser, token , message: "Account created successfully"})
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Controller to login a user

export const login  = async (req,res)=>{
    const {email,password} = req.body;
    try{
        const userData = await User.findOne({email});
        const isPasswordcorrect = await bcrypt.compare(password,userData.password);
        if(!isPasswordcorrect){
            res.json({success:false , message:"Invalid credentials"});
        }
        const token = generateToken(userData._id)
        res.json({success: true, userData, token , message: "Login successfull"})
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}
export const checkAuth = async (req,res)=>{
    res.json({success: true, user:req.user});
}

export const updatedprofile = async (req,res)=>{
    try{
        const {profilePic , bio , fullName} = req.body;
        
        const userId = req.user._id;
        let updateduser;
        
        if(!profilePic){
            updateduser = await User.findByIdAndUpdate(userId, {bio , fullName} , {new : true});
        }
        else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updateduser = await User.findByIdAndUpdate(userId, {profilePic : upload.secure_url, bio , fullName} , {new : true});
        }
        res.json({success: true, user: updateduser});
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}