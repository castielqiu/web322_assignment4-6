const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
  firstname:  
  {
      type:String,
      required:true
  },
  lastname:  
  {
      type:String,
      required:true
  },
  email:  
  {
      type:String,
      required:true,
      unique: true
  },
  password:  
  {
      type:String,
      required:true
  },

  birthday :
  {
    type:Date,
    default: Date.now()
  },

});



userSchema.pre("save",function(next){
    bcrypt.genSalt(10)
        .then(salt=>{
            bcrypt.hash(this.password,salt)
            .then(hash=>{
                this.password=hash;
                //this.save(); 
                next();
            })
        })

})



const userModel =mongoose.model("user",userSchema);

module.exports=userModel;
