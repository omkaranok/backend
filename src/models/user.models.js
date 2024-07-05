import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema= new mongoose.Schema( 
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            index:true,
            trim:true,
            index:true
        },

        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            index:true,
            trim:true,
        },

        fullName:{
            type:String,
            required:true,
            index:true,
            trim:true,
        },

        avatar:{
            type:String,
            required:true,
        },

        coverImage:{
            type:String,
        },

        watchHistory:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Video"
            }
        ],

        password:{
            type:String,
            required:[true,'Password is required']
        },

        refreshToken:{
            type:String
        }


    },{timestamps:true}
)

// userSchema.pre("save",async function(next){  //we are not using arrow function because we document't get acces of this pointer in arroe function
//     if(this.isModified("password")){//if password has been modigied then apply change
//          return next();
//     } 
//     this.password=await bcrypt.hash(this.paasword, 10)//10 represent number of round
//     next() //we don't have this reference inside arrow function
//     //The problem with next() execution is that whenever we press save button no matter what password will automatically get updated
//     //so when the password hasn't been updated avoid it
// })

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// userSchema.methods.isPasswordCorrect=async function(password){ //method is object and ispassword nis property
//     return await bcrypt.compare(password,this.password); //password our original //bcrpt have compare method this.paasword represent encrypted password
// }

userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },

        process.env.ACCESS_TOKEN_SECRET,
        {  //ACCESS TAOKEN EXPIRY ALWAYS GOES IN OBJECT FORMED
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,     
        },

        process.env.REFRESH_TOKEN_SECRET,
        {  //ACCESS TAOKEN EXPIRY ALWAYS GOES IN OBJECT FORMED
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
// userSchema.methods.generateRefreshToken=function(){}


export const User = mongoose.model("User",userSchema)