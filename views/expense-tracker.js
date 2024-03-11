window.addEventListener('DOMContentLoaded',async()=>{
    try{
    const objURLParams=new URLSearchParams(window.location.search);
    const page=objURLParams.get('page') || 1
    const token=localStorage.getItem('token')
    const row=localStorage.getItem('no_rows')
    document.getElementById('no_of_expenses').value=row
    
    await axios.get(`http://localhost:9000/expense?page=${page}&&rows=${row}`,{headers:{'Authorization':token}})
    .then(({data:{products,user, ...pageData}})=>{
        
        showExpeneseOnScreen(products);
        showPagination(pageData);
        document.getElementById('amount').innerHTML=`Total Amount : ${user.totalExpense}`
        document.getElementById('name').innerHTML=`Hello, ${user.name}`
        const premiumUser=user.isPrimeUser;
        if(premiumUser){
                    upd_msg=document.getElementById('message')
                    upd_msg.innerHTML=upd_msg.innerHTML+'You are a Premium user    ';
                    upd_msg.style.color='Blue'
                    const button=document.createElement('button');
                    button.id='leaderboard';
                    button.setAttribute('class',"btn btn-info");
                    button.textContent=' Leader board '
                    upd_msg.appendChild(button)
                    const secBut=document.createElement('button')
                    secBut.setAttribute('class',"btn btn-info")
                    secBut.id='top-five'
                    secBut.textContent='Five highest cost expenses'
                    upd_msg.appendChild(secBut)
        document.getElementById('leaderboard').addEventListener('click',async()=>{
        try{
            const token=localStorage.getItem('token')
            await axios.get('http://localhost:9000/leaderboard',{headers:{'Authorization':token}})
            .then((res)=>{
                const h4=document.getElementById('h4');
                document.getElementById('lead').innerHTML=''
                h4.innerHTML='Leader board:';
                for(let i=0;i<res.data.user.length;i++){
                
                    showLeaderBoard(res.data.user[i]);
                }
            })
            .catch((err)=>{
                document.getElementById('add-err-info').innerHTML=err.response.data.message
            })
             
        }catch(err){
            console.log(err)
            }                 
        })
        document.getElementById('top-five').addEventListener('click',async()=>{
            try{
                const token=localStorage.getItem('token')
                await axios.get('http://localhost:9000/top-five',{headers:{'Authorization':token}})
                .then((resp)=>{
                    document.getElementById('h4').innerHTML='5 highest expenses:';
                    document.getElementById('lead').innerHTML=''
                    resp.data.records.forEach(element => {
                        showTopFive(element)
                    })
                })
                .catch((err)=>{
                    document.getElementById('add-err-info').innerHTML=err.response.data.message
                })
                
            }catch(err){
                console.log(err)
                }
        })
            
        }
        else{
            const pre=document.getElementById('premium-button')
            const btn=document.createElement('button');
            btn.textContent='Buy Premium';
            btn.id='buy_premium';
            btn.setAttribute('class',"btn btn-info");
            pre.appendChild(btn);

            btn.onclick=async() =>{
            try{
                const token=localStorage.getItem('token');
                const res=await axios.get('http://localhost:9000/purchase-premium',{headers: {'Authorization':token}})
                    var options={
                        "key":res.data.key_id,
                        "order_id":res.data.order.id,
                        "handler":async function(res){
                        const d1= await axios.post('http://localhost:9000/purchase-premium',{
                                order_id:options.order_id,
                                payment_id:res.razorpay_payment_id,
                            },{ headers:{"Authorization":token}})
                            .then((d1)=>{
                                alert('Congrats, You are a Premium User');
                                window.location.reload()
                            })
                        }
                    }
                const rzp1=new Razorpay(options);
                rzp1.open();
                rzp1.on('payment.failed',async function(){
                    try{
                        const key=res.data.order.id;
                        await axios.post('http://localhost:9000/update-purchase',{
                            'order_id':key,
                            'payment_id': null,
                        },{ headers:{"Authorization":token}})
                        .then((resp)=>{
                            alert('Payment failed')
                        })
                        
                    }catch(err){
                        console.log(err);
                        }
                    })     
                }catch(err){
                    console.log(err)
                }
            }
        }      
    })
    .catch((err)=>{
        console.log(err)
        document.getElementById('add-err-info').innerHTML=err.response.data.message
    })

    }catch(err){
    console.log(err)
        }
})
function showExpeneseOnScreen(exp){
    try{
        const a=document.getElementById('expenses')
        const parentEle=document.getElementById('list');
        parentEle.innerHTML='';
        for(let i=0;i<exp.length;i++){
        const chiledEle=document.createElement('li');
        chiledEle.setAttribute('class','list-group-item');
        chiledEle.textContent=exp[i].cost +' -  '+ exp[i].description +' - '+ exp[i].category+'  ';
        parentEle.appendChild(chiledEle);
        const delButton=document.createElement('input');
        const editButton=document.createElement('input');
        delButton.type='button';
        editButton.type='button';
        delButton.value='Delete';
        editButton.value='Update'
        delButton.id=exp[i].id;
        editButton.id=exp[i].id;
        delButton.setAttribute('class','btn btn-danger');
        editButton.setAttribute('class','btn btn-light');
        chiledEle.appendChild(editButton);
        chiledEle.appendChild(delButton);
        editButton.onclick=async()=>{
            try{
                const token=localStorage.getItem('token');
                await axios.get(`http://localhost:9000/expense/${editButton.id}`,{headers:{'Authorization':token}})
                .then((user)=>{
                    document.getElementById('edit').innerHTML=`
                    <div class='form-inline'>
                    <lable for='cost'>Item cost</lable>
                    <input type='text' id='editCost' class='form-control'>
                    <lable for='description'>Item description</lable>
                    <input type='text' id='editDesc' class='form-control'>
                    <lable for='categeory'>Choose categeory</lable>
                    <input type='text' id='editCate' class='form-control'>
                    <button id='putBut' class="btn btn-info" value=${user.data.exp_id} onclick='editExpense()'> Update expense</button>
                    </div>
                    `
                    document.getElementById('editCost').value=user.data.data.cost;
                    document.getElementById('editDesc').value=user.data.data.description;
                    document.getElementById('editCate').value=user.data.data.category;
                })
                .catch((err)=>{
                    document.getElementById('add-err-info').innerHTML=err.response.data.message
                })
                
                
            }catch(err){
            console.log(err)
            }
        }
        delButton.onclick=async()=>{
            try{               
                const token=localStorage.getItem('token')
                await axios.delete(`http://localhost:9000/expense/${delButton.id}`,{headers:{'Authorization':token}})
                .then((resp)=>{
                    parentEle.removeChild(chiledEle)
                    window.location.reload();
                })
                .catch(err =>{
                    console.log(err)
                    document.getElementById('add-err-info').innerHTML=err.response.data.message
                })
            }catch(err){
                console.log(err)
            }
        }
        }
    }catch(err){
        console.log(err)
    }
}

function showPagination({
    currentPage,
    hasNextPage,
    nextPage,
    hasPreviousPage,
    previousPage,
    lastPage,
}){ 
    try{
        const pagination=document.getElementById('pagination');
        pagination.innerHTML=''
        if(hasPreviousPage){
            const btn2=document.createElement('button');
            btn2.innerHTML=previousPage;
            btn2.addEventListener('click',()=>getProdcuts(previousPage));
            pagination.appendChild(btn2);
        }
        const btn1=document.createElement('button');
        btn1.innerHTML=`<h3>${currentPage}</h3>`
        btn1.addEventListener('click',()=>getProdcuts(currentPage));
        pagination.appendChild(btn1);
        if(hasNextPage){
            const btn3=document.createElement('button');
            btn3.innerHTML=nextPage;
            btn3.addEventListener('click',()=>getProdcuts(nextPage));
            pagination.appendChild(btn3);
        }
    }catch(err){
        console.log(err)
    }
}

async function getProdcuts(page){
    try{
        const token=localStorage.getItem('token')
        const row=localStorage.getItem('no_rows')
        await axios.get(`http://localhost:9000/expense?page=${page}&&rows=${row}`,{headers:{Authorization:token}})
        .then(({data:{products, ...pageData}})=>{
            showExpeneseOnScreen(products);
            showPagination(pageData);
        })
        .catch((err)=>{
            document.getElementById('download-info').innerHTML=err.response.data.message
        })
    }catch(err){
        console.log(err)
    }
}

    function showLeaderBoard(a){
        try{
            const parentEle=document.getElementById('lead')
            chiledEle=document.createElement('li');
            chiledEle.setAttribute('class','list-group-item');
            if (a.total_amount===null){
                a.total_amount=0
            }
            chiledEle.textContent=` ${a.name},  Total amount:${a.totalExpense}`
            parentEle.appendChild(chiledEle) 
        }catch(err){
            console.log(err)
        }
        }

    async function saveData(event){
    try{
        event.preventDefault()
        const cost=document.getElementById('cost').value
        const desc=document.getElementById('desc').value
        const cate=document.getElementById('cate').value
        const expenseDetails={
            cost:cost,
            description:desc,
            category:cate,
                }
        const token=localStorage.getItem('token');
        await axios.post('http://localhost:9000/expense',expenseDetails,{headers: {'Authorization':token}})
        .then((resp)=>{
            window.location.reload()
            })
        .catch((err)=>{
            console.log(err)
            document.getElementById('add-err-info').innerHTML=err.response.data.message
         })        
    }catch(err){
        console.log(err);
    }
}

    async function downloadFile(){
        try{
            const token=localStorage.getItem('token')
            await axios.get('http://localhost:9000/download',{headers:{'Authorization':token}})
            .then((resp)=>{
                if (resp.status==200){
                    const saveBut=document.getElementById('saveBut')
                    saveBut.style.backgroundColor='lightgreen'
                    saveBut.textContent="Saved"
                    document.getElementById('download-info').innerHTML=`File location :  ${resp.data}`
                }
            })
            .catch((err)=>{   
                    saveBut.style.backgroundColor='red'
                    const ele=document.getElementById('download-info')
                    ele.innerHTML=err.response.data.message
                    ele.style.color='red'
                })        
        }catch(err){
            console.log(err)
        }
    }
function no_of_rows(val){
    try{
        localStorage.setItem('no_rows',val)
        getProdcuts()
    }catch(err){
        console.log(err)
    }
}

async function editExpense(){
    try{
        const cost=document.getElementById('editCost').value
        const desc=document.getElementById('editDesc').value
        const cate=document.getElementById('editCate').value
        const id=document.getElementById('putBut').value
        const deatils={
            cost:cost,
            description:desc,
            category:cate,
        }
        const token=localStorage.getItem('token')
        await axios.put(`http://localhost:9000/expense/${id}`,deatils,{headers:{'Authorization':token}})
        .then((res)=>{
            window.location.reload()
        })
        .catch((err)=>{
            console.log(err)
            document.getElementById('add-err-info').innerHTML=err.response.data.message
        })
    }catch(err){
        console.log(err)
    }
    
}

function showTopFive(ele){
    try{
        const parentEle=document.getElementById('lead')
        chiledEle=document.createElement('li');
        chiledEle.setAttribute('class','list-group-item');
        chiledEle.textContent=`Cost=${ele.cost}, Description=${ele.description}, Category=${ele.category}, Spent on=${ele.createdAtDate}`
        parentEle.appendChild(chiledEle)
    }catch(err){
        console.log(err)
    }
}
