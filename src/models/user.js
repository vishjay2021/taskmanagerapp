const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require ("bcryptjs");
const ObjectId = require ("mongodb").ObjectId;


const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    default: 0,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    isLogin: true,
    validate: (value) => {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email");
      }
    },
  },
  password: {
    type: String,
    required: true,
    min: 6,
    trim: true,
    validate: (value) => {
      if (value.toLowerCase().includes("password")) {
        throw new Error("Try Anthoer Password");
      }
    },
  },
  imagePath:{
    type: String,
    default: "profile.png"
  },
  confirmed:{
    type: Boolean,
    default: false
  },
  secret:{
    type: String
  }
})

userSchema.pre("save", async function(next){
  const user = this;
  if(user.isModified("password")){
    user.password= await bcryptjs.hash(user.password, 8);
  }

  next();
});

userSchema.statics.finByCredentials = async(email,password)=>{
  const user = await User.findOne({email : email});
  if(!user){
    return {error: "Invalid Credentials"};
  }

  const isMatch = await bcryptjs.compare(password, user.password)


if(!isMatch){
  return {error: "Invalid Credentials"};;
}
if(!user.confirmed){
  return {error: "Please Confirm you Email"};;
}

 return user

};


userSchema.statics.getUserPublicData = (user)=>{
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    age: user.age,
    imagePath: user.imagePath
  }
};


userSchema.statics.uploadAvatar = (file) => {
  const fileName = file.name;
  console.log(fileName)

  const allowedFiles = ["jpg", "jpeg", "JPEG", "png"];
  const fileExtension = fileName.split(".").pop();

  if(!allowedFiles.includes(fileExtension)){
      return {error: "Please upload image files"}
  }

  const newFileName = new ObjectId().toHexString() + "." + fileExtension;
  var result = {fileName: newFileName};

  file.mv(path.resolve("./public/images/" + newFileName), (e) => {
      if(e){
          result.error = "Something went wrong. Unable to upload profile image."
      }
  });
  return result;
}



userSchema.statics.deleteAvatar = async (fileName) =>{
  if (fileName === "profile.png"){
    return "";
  }
  var result = "File remove successfully";
  await fs.unlink("./public/images/"+  fileName, (e)=>{
    if(e){
      result = "unable to remove";
    }
  })
  return result;
};



const User = mongoose.model("User",userSchema);


  module.exports = User;