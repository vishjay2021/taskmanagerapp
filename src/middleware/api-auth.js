
const apiAuth = (req,res,next) => {
    if(!req.session.user){
        return res.send({error: "you are not allowed"});
    }
    next();
}

module.exports = apiAuth;