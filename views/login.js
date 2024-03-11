
async function login_save(e){
    try{
    e.preventDefault();
    const loginDetails={
    gmail:e.target.gmail.value,
    password:e.target.pwd.value,
        }
    await axios.post(`http://localhost:9000/login`,loginDetails)
    .then((resp)=>{
        if(resp.status==200){
        localStorage.setItem('token',resp.data.token);
        window.location.href="./expense-tracker.html";
        }
    })
    .catch((err)=>{
        document.getElementById('add-err-info').innerHTML=err.response.data.message
    })
    

    }catch(err){
        console.log(err);
        
    }
    }

    document.getElementById('forget_pwd').onclick=async(req,res)=>{
        try{
            window.location.href='./forgot-password.html';
        }catch(err){
            console.log(err)
        }
    }
    
    function signup(){
        window.location.href="./signup.html";
    }
