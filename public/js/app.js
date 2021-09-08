
//____________Utitlites------------------//


const showModal = (id, data)=>{
    $(".label.error").hide();
    $(".error").removeClass("error");
    $("#"+ id).modal();
}

const hideModal = (id, data)=>{
    $("#"+ id).modal("hide");
}

const showLoader = (selector,data)=>{
    document.querySelector("#"+selector).innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    ${data}`;
}

const hideLoader = (selector,data)=>{
    document.querySelector("#"+selector).innerHTML = `
    ${data}`;
}

const showSuccess = (message)=>{
    toastr.success(message);
}

const showError = (message)=>{
    toastr.error(message);
}

