var budgetController = (function() {
    
    var income = function(id,desc,val){
        this.id=id;
        this.desc=desc;
        this.val=val;
    };
    var expense = function(id,desc,val){
        this.id=id;
        this.desc=desc;
        this.val=val;
        this.percentage= -1;
    };

    expense.prototype.calcPercentage = function(totalIncome){
        if(data.totals.inc>0){
            this.percentage = ((this.val/totalIncome)*100).toFixed(1);
        } else {
            this.percentage = -1;
        }
    };

    expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    
    var data = {
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    }
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
           sum+=cur.val;
        });
        data.totals[type]=sum;
        // console.log()
    };
    return {
        addItem:function(type,desc,val){
            var newItem, ID;

            if(data.allItems[type].length>0){
                ID = data.allItems[type][data.allItems[type].length-1].id+1;
            }  else {
                ID = 1;
            };

            if(type==="inc"){
                newItem=new income(ID,desc,val)
            } else if (type==="exp"){
                newItem=new expense(ID,desc,val)
            };

            data.allItems[type].push(newItem);
            return newItem;

        },

        delItem:function(type,id){
          var ids = data.allItems[type].map(function(item){
              return item.id;
          });
          var index = ids.indexOf(id);

          if(index!== -1){
              data.allItems[type].splice(index,1);
          }
        },

        calculateBudget: function(){
            calculateTotal("exp");
            calculateTotal("inc");
            data.budget= data.totals.inc-data.totals.exp;
            if(data.totals.inc > 0){
                prePercentage=(data.totals.exp/data.totals.inc)*100;
                data.percentage=prePercentage.toFixed(1);
            } else {
                data.percentage=-1;
            }
        },

        getBudget:  function(){
            return{
                budget:data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage:data.percentage
            }
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(item){
                item.calcPercentage(data.totals.inc);
            })
        },

        gerPercentages: function(){
            var percentageArr = data.allItems.exp.map(function(item){
               return item.getPercentage();
            })
            // console.log(percentageArr);
            return percentageArr;
        },

        testing: function(){
            console.log(data.allItems.exp);
        }
    }

})();



var UIController = (function(){
    var DOMString= {
        inputType:".type",
        inputDesc:".desc",
        inputVal:".val",
        inputBtn:".btn",
        elementInc:".income_list",
        elementExp:".expense_list",
        totalBudget:".total_budget",
        incomeBudget:".inc_budget",
        expenseBudget:".exp_budget",
        percentage:".percentage",
        board:".board",
        expensePercentage:".exp_percentage",
        date:".date",
    }

    var formatNumber=function (val,type){
        val= Math.abs(val).toFixed(2);
        var [int, dec] = val.split(".");            
        var nextInt;
        var [times,remain] = [Math.floor(int.length/3),Math.floor(int.length%3)];
        var addComma = function(){
            for (var i = 1; i <times+1; i++){
                if( i!==times ){
                    nextInt = nextInt+int.substr(int.length-(3*times/i),3)+","; //7-(3*2/1)
                } else if(i===times) {
                    nextInt = nextInt+int.substr(int.length-(3*times/i),3); //7-(3*2/2)
                }
            }; 
        }

        if(remain && int.length>=4 ){
            nextInt= int.substr(0,int.length-(3*times))+",";
            addComma();
        } else if (!remain && int.length>=4) {
            nextInt = int.substr(0,3)+",";
            times=times-1;
            addComma();
        } else if (int.length <=3 || int.length===3 ){
            nextInt= int;
        };

        var number = nextInt +"." + dec;         
        return (type==="exp"? "- ":"+ ") + number;
    };

    return {
        getInput:function(){
            return {
                type:document.querySelector(DOMString.inputType).value,
                desc:document.querySelector(DOMString.inputDesc).value,
                val:parseFloat(document.querySelector(DOMString.inputVal).value)
            };
        },
        getString:function(){
            return DOMString;
        },

        attachItem:function(newItem,type){
            var html,elementName;

            if(type==="inc"){
                html= '<div class="list_item in text-left" id="inc-%id%"><i class="fas fa-times-circle icon"></i><div class="desc_item" >%desc%</div><div class="val_item" >%value%</div></div>';
                elementName= DOMString.elementInc;
            } else if(type==="exp"){
                html= '<div class="list_item exp text-left" id="exp-%id%"><i class="fas fa-times-circle icon"></i><div class="desc_item" >%desc%</div><div class="val_item" >%value%<div class="exp_percentage"></div></div></div>';
                elementName= DOMString.elementExp;
            };
            // console.log(newItem.val,type);
            var newHtml = html.replace(/%id%/g,newItem.id);
            newHtml = newHtml.replace("%value%",formatNumber(newItem.val,type));
            newHtml = newHtml.replace("%desc%",newItem.desc);
            document.querySelector(elementName).insertAdjacentHTML('beforeend',newHtml);
        },

        removeItem:function(item){
            var el = document.querySelector("#"+item);
            // console.log(el);
            // console.log(el.parentNode.no);
            el.parentNode.removeChild(el);

        },
        
        clearFields:function(){
            var field=document.querySelectorAll(DOMString.inputDesc +","+DOMString.inputVal);
            var fieldArray = Array.prototype.slice.call(field);
            fieldArray.forEach(element => {
                element.value="";
            });
            fieldArray[0].focus();

        },
        attachBudget:function(obj){
            var type;

            obj.budget>0? type="inc":type="exp";

            document.querySelector(DOMString.totalBudget).textContent=  formatNumber(obj.budget,type) ;
            document.querySelector(DOMString.incomeBudget).textContent= formatNumber(obj.totalInc,"inc");
            document.querySelector(DOMString.expenseBudget).textContent=formatNumber(obj.totalExp,"exp") ;

            if(obj.percentage>0){
                document.querySelector(DOMString.percentage).textContent=" -"+obj.percentage+"%";
            } else{
                document.querySelector(DOMString.percentage).textContent="－";
            }
            // console.log(obj.percentage);
        },
        
        attachPercentage:function(arr){
            var percentageList = document.querySelectorAll(DOMString.expensePercentage);
            // console.log(percentageList);

            // var nodelistForeach = function(list,callback){
            //     for (var i =0 ; i<list.length; i++){
            //         callback(list[i],i)
            //     }
            // };

            // nodelistForeach(percentageList,function(item,index){
            //     item.textContent=arr[index]+"%";
            // });

            percentageList.forEach(function(item,index){
                item.textContent=arr[index]+"%";
            })
        },

        attachDate: function(){
            var time = new Date();
            var months = ["Jul","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            var timeStr = "Avaliable @  "+time.getFullYear() +" " + months[time.getMonth()]+" "+time.getDate()+"th";
            document.querySelector(DOMString.date).textContent=timeStr;
        },

        toggleOption: function(){
            // console.log("change!");
            var input = document.querySelectorAll(DOMString.inputDesc+","+DOMString.inputVal);
            input.forEach(function(item){
                item.classList.toggle("option");
            })
            // document.querySelector(DOMString.inputVal).classList.toggle("option");

        },

    }
})();





var controller = (function(budgetCtrl,uiCtrl) {

    var setupEventListeners = function(){
        var DOMString = uiCtrl.getString();
        uiCtrl.attachDate();
        document.querySelector(DOMString.inputBtn).addEventListener("click",ctrlAddItem);

        document.addEventListener("keypress",function(e){
            if(e.keyCode===13 || e.which===13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOMString.inputType).addEventListener("change",uiCtrl.toggleOption)
        document.querySelector(DOMString.board).addEventListener("click",ctrlDelItem);

    };

    var updateBudget = function(){
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
        // console.log(budget);
        uiCtrl.attachBudget(budget);
    };

    var updatePercentages = function(){
        // 1. calculate percentages in budgetCtrl
        budgetCtrl.calculatePercentages();
        // 2. get percentages  from budgetCtrl
        var arr= budgetCtrl.gerPercentages();

        // console.log(arr);
        // 3. Update percentages in uiCtrl
        uiCtrl.attachPercentage(arr);
    };

    var ctrlAddItem=function(){
        var obj = uiCtrl.getInput();
        if(obj.desc!=="" && !isNaN(obj.val) && obj.val>0){
            var newItem = budgetCtrl.addItem(obj.type, obj.desc, obj.val);
            // var total = budgetCtrl.addTotal(obj.type, obj.val);
            // console.log(total);
            uiCtrl.attachItem(newItem,obj.type);
            uiCtrl.clearFields();
            updateBudget();
            updatePercentages();
        }else {
            alert("Please fill the form correctly!");
        };
    };

    var ctrlDelItem = function(event){
        // event.stopPropagation();
        var item = event.target.parentNode.id;
        var delIcon = event.target.tagName;
        // console.log(typeof delIcon);
        if(item && delIcon=="I") {
            var splitStr = item.split("-");
            // console.log(splitStr);
            var [type, id] = [splitStr[0],parseFloat(splitStr[1])]
            // console.log(type,id);
            budgetCtrl.delItem(type,id);
            uiCtrl.removeItem(item);
            updateBudget();
            updatePercentages();
        }
    };

    return {
        init:function(){
            console.log("Application has started!");
            uiCtrl.attachBudget(
                {
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1
                }
            );
            setupEventListeners();
        }
    }
})(budgetController,  UIController)

controller.init();


