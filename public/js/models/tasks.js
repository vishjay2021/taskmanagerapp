//___________CRUD Operations_____________//

const getTask= async (searchText)=>{
    var url= "/api/tasks";
    if(searchText && searchText != ""){
        url= "/api/tasks?search="+searchText;
    }

    try {
        const response = await fetch(url);
        const tasks= await response.json();

        if(tasks.length < 1){
            return  $("#task-wrapper").html("<p>No task Found</p>");
        }

        var taskHTML ="";
    
        tasks.forEach((task)=>{
            taskHTML += card(task);
        });
            $("#task-wrapper").html(taskHTML);

    } catch (error) {
        console.log(error);
    }
   
}

const createTask = async () =>{
    const url = "/api/tasks";
    
    const data = {
        description: $("#descriptionTextarea1").val(),
        completed: document.querySelector("#taskCheck1").checked
    }
    showLoader("addBtn","Loading")

   try {
    const response = await fetch(url,{
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const task = await response.json();
    if(!task){
       return console.log("cant create task");
    }
    const taskCard = card(task);

    const taskList = document.querySelector("#task-wrapper");
    taskList.innerHTML= taskCard + taskList.innerHTML;
    hideModal("createTask")

    showSuccess("Created Sucessfull!");

   } catch (error) {
       console.log(error);
   }finally{
        hideLoader("addBtn","Add +");
   }
}
 
const  initiateUpdate = async (id) =>{
    const url = "/api/tasks/"+id;


    try {
        const response= await fetch(url);
        const task = await response.json();
    
        if(!task){
            return console.log("no task found!")
        }
        document.querySelector("#updateDesc").value = task.description;
        document.querySelector("#updateCompleted").checked = task.completed;
        document.querySelector("#taskId").value= task._id;
        showModal("updateTask");

    } catch (error) {
        console.log(error);
    }
}

const updateTask = async () =>{
    const taskID = document.querySelector("#taskId").value;
    const url = "/api/tasks/"+taskID
    const data = {
        description: $("#updateDesc").val(),
        completed: document.querySelector("#updateCompleted").checked
    }
    hideModal("updateTask");
    showLoader( "taskID"+ taskID +" .btn-primary","");
    try {
        
    const response = await fetch(url, {
        method: "PATCH",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const task =await response.json();
    if(!task){
      return  console.log("Task not found");
    }
   document.querySelector("#taskID"+ task._id + " h5").textContent= task.description;
   if(task.completed){
    document.querySelector("#taskID"+ task._id).classList.add("blue-bg")
   }else{
    document.querySelector("#taskID"+ task._id).classList.remove("blue-bg")
   }
   toastr.success("Update Successfully!")
        
    } catch (error) {
       console.log(error) 
    }finally {
        document.querySelector("#taskID"+ taskID +" .btn-primary").innerHTML = `<i class="fas fa-pen"></i>`;
    }
}

const initiateDelete= async (id) =>{
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this data!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
        deleteTask(id);
        }
      });
}

const deleteTask = async (id) =>{
    const url = "/api/tasks/"+ id;
    showLoader( "taskID"+ id +" .btn-danger","");
    try {
        const response = await fetch(url,{
            method: "DELETE",
            headers:{
                "Content-Type": "application/json"
            }
        });
        const task = await response.json();
        if(!task){
            console.log("tasknot found");
        }
        document.querySelector("#taskID"+id).remove();


    } catch (error) {
        console.log(error)
    }
}



getTask();
 

const createForm = $("#create-task-form");
const updateForm = $("#update-task-form");
const searchForm = $("#searchForm");


    createForm.validate({
    rules: {
        description:{
            required: true
        }
    }
    })

   const updateValidation = updateForm.validate({
        rules: {
            updateDesc:{
                required: true
            }
        }
        })
    


createForm.on("submit",(e)=>{
    e.preventDefault();
    if(createForm.valid()){
        createTask();
        $("#create-task-form")[0].reset();
    } 
});


updateForm.on("submit",(e)=>{
    e.preventDefault();
    if(updateValidation.valid()){
        updateTask();
    } 
})
 
searchForm.on("submit",(e)=>{
    e.preventDefault();
   const searchText= $("#searchForm input").val();
    getTask(searchText);
})


//___________Card Genarator_____________//
    
const card = (task)=>{
    var color = "";
    if(task.completed){
        color= "blue-bg"
    }

    return `<div class="task-card ${color}" id="taskID${task._id}"> 
    <h5>${task.description}</h5>
    <div class="crud-buttons">
        <button class="btn btn-primary btn-sm" onclick="initiateUpdate('${task._id}')" ><i class="fas fa-pen"></i></button>
        <button class="btn btn-danger btn-sm" onclick="initiateDelete('${task._id}')"><i class="fas fa-trash"></i></button>
    </div>
    </div>`
}


