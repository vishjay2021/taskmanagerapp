//create middleware instead for placing each path  router.get("/tasks",(req,res)=>{if(!req.session.user){return res.redirect("/");};res.render("task");});



const auth = (req,res,next) => {
    if(!req.session.user){
        return res.redirect("/");
    }
    next();
}

module.exports = auth;