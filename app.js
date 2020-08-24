
//BUDGET CONTROLLER
var budgetController = (function(){     //implementing module pattern   IIFE

    var Expense  = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentages = function(totalIncome){
        if(totalIncome>0){
        this.percentage = Math.round((this.value / totalIncome)*100);
        } else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentages = function(){
        return this.percentage;
    }

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(element=>{
            sum = sum + element.value;
        });
        data.totals[type]  = sum;
    };

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
    };

    return{
        addItems: function(type,des,val){
            var newItem, ID;

            //create new id
            if(data.allItems[type].length>0){
                ID= data.allItems[type][data.allItems[type].length-1].id + 1;
            }else{
                ID = 0;
            }

            //create new item based of 'inc' or 'exp' type
            if(type==='exp'){
            newItem = new Expense(ID,des,val);
            }
            else if(type==='inc'){
            newItem = new Income(ID,des,val);

            }

            //push into our data structure
            data.allItems[type].push(newItem);

            //return the element
            return newItem;

        },

        deleteItem: function(type,id){
            var ids, index;
            //suppose id = 3
            //ids = 1,2,4,6,8]  //so here id 3 5 7 are deleted and if we delete like data.allItems[type][id] for id = 3 but id=6 will get deleted
            //do seeperate index with id
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);    //if item not fine returns -1
            if(index !== -1){
                //splice to delete
                data.allItems[type].splice(index,1);  //1 is no of elements to delete
            }

        },

        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate the percentage of income that  we spent
            data.percentage = data.totals.inc>0? Math.round((data.totals.exp / data.totals.inc) * 100):data.percentage=-1;    

            //

        },

        calculatePercentages: function(){
            //calculating expeense to income ration on each expense class
            data.allItems.exp.forEach((curr)=>{
                curr.calcPercentages(data.totals.inc);
            });
        },
        getPercentages:function(){
            var allPerc = data.allItems.exp.map(function(curr){
                return curr.getPercentages();
            });
            return allPerc;
        },

        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function(){
            console.log(data);
        }
    };



})();






//!when budget controller returns, it will have publicTest attached as an object ...eg: budgetController.publicTest(7) from window scope


//UI CONTROLLER
var UIcontroller  = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn : '.add__btn',
        incomeContainer:'.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel:'.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        expensesPercentageLabel:'.item__percentage',
        dateLabel: '.budget__title--month'
        
    };

    var formatNumber = function(num,type){

        var numSplit, int, dec, type;
        /*
        + or - before number
        exactly 2 decimal points
        coma seperating the elements
        eg:2310.4567 -> 2310.46  and  2000-> 2,000.00
        */

        num = Math.abs(num);  //abs removes thee sign of the numbr
        num = num.toFixed(2);   //put exactly two dcimal nums on the number on which we call the methods

        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length>3){
            //substring allows to take part of string
            //int = int.substr(0,1) + ',' + int.substr(1,3);  //if input is 2310 result 2,310  //start at position and read n number

            int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);  //if input is 2310 result 2,310  //start at position and read n number
            
        }

        dec = numSplit[1]; 

        
        return (type === 'exp'? '-' : '+') + '' + int + '.' + dec;

    };

    //making our own foreach for nodelist
    var nodeListForEach = function(list,callback){
        for(var i=0; i<list.length; i++){
            callback(list[i],i);
        }
    };

    return {
        getInput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value,  //will be either inc (income) or exp (expense)
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
            
        },
        addListItem: function(obj,type){
            var html,newHtml,element;
            //create HTML string with placeholder text
            if(type==='inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type==='exp'){
                element = DOMstrings.expenseContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));

            //insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDescription+', '+DOMstrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);     //bcause fiels is nodelist so setting this to fields to use arr method
            fieldsArray.forEach((element,index,array) => {
                element.value  = "";
            });

            fieldsArray[0].focus();         //agian focus to input after clear
        },
        displayBudget: function(obj){   //obj with four data budget,total income/expenses and percentage
            var type;
            obj.budget>0?type='inc':type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');
            if(obj.percentage>0){
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
            }
            else{
            document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);  // return nodelist because element in dom tree each element is called a node

            nodeListForEach(fields,function(current,index){
                //do stuff
                if(percentages[index] > 0){
                current.textContent = percentages[index] + '%';
                } else{
                current.textContent = '---';
                    
                }
            });
        },

        displayMonth: function(){
            var now,year,month,months;
            now = new Date();
            months= ["January","February","March","April","May","June","July",
            "August","September","October","November","December"];
            month = now.getMonth();
            year = now.getFullYear(); //current year
            document.querySelector(DOMstrings.dateLabel).textContent = months[month]+ ' '+ year;
        },

        changedType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ','+
                DOMstrings.inputValue
            );

            nodeListForEach(fields,function(curr){
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')

        },

        getDOMstrings: function(){
            return DOMstrings;
        }
    };

})();





//GLOBAL APP CONTROLLER
var controller  = (function(budgetCtrl,UICtrl){  //app controller

    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem); //dont call like ctrlAddItem() beecaus it will call it immediately and we dont want that

        document.addEventListener('keypress',function(e){
            if(e.keyCode == 13 || event.which === 13){  //'which' is for older browsers that dont support keeycode
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)

    }
    var updateBudget = function(){
        //1 calculate the budget
        budgetCtrl.calculateBudget();

        //2 return the budget
        var budget = budgetCtrl.getBudget();

        //3 display budget in the UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function(){
        //1 calculate the percentages
        budgetCtrl.calculatePercentages();

        //2 read peercentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //3 update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    }

    var ctrlAddItem = function(){
        var input,newItem;

        //1 get the filled input data
        input = UICtrl.getInput();      //has obj
        if(input.description !== "" && !isNaN(input.value) && input.value>0){

        //2 add the item to the budget controller
        newItem = budgetCtrl.addItems(input.type,input.description,input.value);

        //3 add the item to the UI
        UICtrl.addListItem(newItem,input.type);

        //4 clear the fields
        UICtrl.clearFields();

        //5 calculate and update budget
        updateBudget();

        //6 calculate and update percentages
        updatePercentages();

        }
        
    };

    var ctrlDeleteItem = function(event){
        var itemID,splitId,type,ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            //format of id inc-1 so..
            splitId = itemID.split('-');  //inc-1 splitted to inc and 1
            type =splitId[0];
            ID = parseInt(splitId[1]);

            //1. delete the item from the data structure
            budgetCtrl.deleteItem(type,ID);

            //2. we delete the item from the UI
            UICtrl.deleteListItem(itemID);


            //3. update and show the new budget
            updateBudget();

            //4 calculate and update percentages
            updatePercentages();
        }
    }

    return {
        init: function(){
            
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget(       //setting everything to zero at first
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

    
    
})(budgetController,UIcontroller);

controller.init();

