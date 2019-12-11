const hasAccessAdmin = (req,res,next)=>
{
    if(req.session.userInfo==null || req.session.userInfo.admin == undefined)
    {
        res.redirect("/user/user");
    }
    else
    {
        next();
    }
}

module.exports=hasAccessAdmin;