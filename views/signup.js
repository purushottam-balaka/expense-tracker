
function login(){
    window.location.href='./login.html';
}
async function signup_save(event){
    try{
        
        event.preventDefault();
        const signUpDetails={
            name:event.target.name.value,
            gmail:event.target.gmail.value,
            password:event.target.pwd.value
        }
        await axios.post("http://localhost:9000/signup",signUpDetails)
        .then((resp)=>{
            console.log('resp',resp)
            if(resp.status==201){
                const ele=document.getElementById('add-err-info')
                ele.style.color='green'
                ele.textContent=resp.data.message
            }
        })
        .catch((err)=>{
            document.getElementById('add-err-info').innerHTML=err.response.data.message
        })      
    }
    catch(err){
            console.log(err)
            document.getElementById('add-err-info').innerHTML='Internal server error when siningup'
        }

    
}