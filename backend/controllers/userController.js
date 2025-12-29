import uploadOnCloudinary from "../configs/cloudinary.js";
import User from "../models/userModel.js";

export const getCurrentUser = async (req,res) => {
    try {
        const user = await User.findById(req.userId).select("-password").populate("enrolledCourses")
         if(!user){
            return res.status(404).json({message:"User not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
        console.log(error);
        return res.status(400).json({message:"get current user error"})
    }
}

export const UpdateProfile = async (req,res) => {
    try {
        const userId = req.userId
        const {name , description} = req.body
        const updateData = {name, description}
        
        if(req.file){
           try {
               const photoUrl = await uploadOnCloudinary(req.file.path)
               console.log("photoUrl from cloudinary:", photoUrl)
               if(photoUrl){
                   updateData.photoUrl = photoUrl
               }
           } catch (uploadError) {
               console.log("Upload error:", uploadError)
               // Don't fail the update if upload fails
           }
        }
        
        const user = await User.findByIdAndUpdate(userId, updateData, {new: true})


        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
         console.log("Error in UpdateProfile:", error);
       return res.status(500).json({message:`Update Profile Error  ${error}`})
    }
}
