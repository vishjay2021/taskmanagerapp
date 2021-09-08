const express = require("express");

const Task = require("../models/tasks.js");
const auth = require("../middleware/auth.js");
const apiAuth = require("../middleware/api-auth.js");


const router = express.Router();

router.get("/tasks",auth,(req,res)=>{
    res.render("task", {user: req.session.user});
});



//________API Endpoints______________

//endpoint for creating tasks
router.post("/api/tasks",apiAuth, async (req,res)=>{
    req.body.owner = req.session.user._id;
    const task = new Task (req.body);
    try {
        await task.save();
        res.send(task);
    } catch (error) {
        res.send(error);
    }
    
    // task.save().then(()=>{
    //     res.send(task);
    // }).catch((error)=>{
    //     res.send(error);
    // })
});


//Reading all tasks
router.get("/api/tasks/",apiAuth, async(req,res)=>{
    const searchText = req.query.search;
    const ownerId = req.session.user._id;

    var tasks= [];
    try {
        if(searchText){
            tasks = await Task.find({owner:ownerId, description: {$regex: searchText, $options: "i"}});
        }else{
          tasks = await Task.find({owner:ownerId});
        }
        res.send(tasks);
    } catch (error) {
        res.send(error);
    }
});

//endpoint for read a task
router.get("/api/tasks/:id",apiAuth, async (req,res)=>{
    const userId = req.session.user._id;
    const id = req.params.id; 
    try {
        const task = await Task.findOne({_id: id, owner: userId}); 
        if(!task){
           return res.send({error:"Task not found."});
        }
        res.send(task);
    } catch (error) {
        res.send(error);
    } 
});

// //endpoint for Update a task
router.patch("/api/tasks/:id",apiAuth, async (req,res)=>{
    const userId = req.session.user._id;
    const id = req.params.id;
    const allowedFileds = ["description", "completed"];
    const updateFileds= Object.keys(req.body);
    const isValid = updateFileds.every((field)=>{
        return allowedFileds.includes(field)
    });

    if(!isValid){
        return res.send({error: "Theres no such a filed"})
    }
    try {
        const task = await Task.findOneAndUpdate({_id: id, owner: userId},req.body,{new:true});
         if(!task){
             return res.send("Invalid ID");
         } 
        res.send(task)
    } catch (error) {
        res.send(error);
    }
});


// //endpoint for delete a task
router.delete("/api/tasks/:id",apiAuth, async (req,res)=>{
    const id = req.params.id;
    const userId= req.session.user._id;
    try {
        const task= await Task.findOneAndDelete({_id: id, owner: userId});
        if(!task){
           return res.send("Invalid ID");
        }
     res.send(task)   
    } catch (error) {
        res.send(error)
    }
});





module.exports = router;