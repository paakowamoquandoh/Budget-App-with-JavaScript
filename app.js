// budget control here

var budgetController = (function(){

	var Expense = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var Income = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(cur){
			sum = sum + cur.value 
		});

		data.totals[type] = sum;

	};

	var data = {
		allItems:{
		exp: [],
		inc: []
	  },
	  totals: {
		  exp: 0,
		  inc: 0
	  },

	  budget : 0,
	  percentage: -1,

	};

	return {
		addItem: function(type, des, val) {
			var newItem, ID;
			//ID = last ID + 1
			//create new id here
			if (data.allItems[type].lenght > 0){				
				ID = data.allItems[type][data.allItems[type].lenght-1].id + 1;
			}else {
				ID = 0;  
			}
            
			//create new 'inc' or 'exp'
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			}else if (type=== 'inc') {
				newItem = new Income(ID, des, val);
			}

			//push it into my data structure
			data.allItems[type].push(newItem);

			//return the new element
			return newItem;      
		},


		deleteItem: function(type, id){
			var ids, index;

			ids = data.allItems[type].map(function(current){

				return current.id;
			});

			index = ids.indexOf(id);

			if(index !== -1){
				data.allItems[type].splice(index, 1);
			}
		},




		calculateBudget: function(){
			//calculate income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			//calculate budget ie. income - expense
			data.budget = data.totals.inc - data.totals.exp;

			//calculate % of spent income

			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
			} else {
				data.percentage = -1;
			}

			
		},

		getBudget : function(){
			return{

				budget : data.budget,
				totalInc : data.totals.inc,
				totalExp : data.totals.exp,
				percentage : data.percentage

			};
		},


		testing: function(){
			console.log(data)
		}
	};
	
})();




// user interface control

var UIController = (function(){

	var DOMstrings = {
		inputType: '.addType',
		inputDesription: '.addDescription',
		inputValue: '.addValue',
		inputBtn: '.addBtn',
		incomeContainer: '.incomeList',
		expensesContainer: '.expensesList',
		budgetLabel: '.budgetValue',
		incomeLabel: '.budgetIncome--value',
		expensesLabel: '.budgetExpenses--value',
		percentageLabel: '.budgetExpenses--percentage',
		container: '.container'
	}

    return {
		getInput: function(){
			return{
				type:document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
			    description: document.querySelector(DOMstrings.inputDesription).value,
			    value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		}, 
		
		addListItem: function(obj, type) {
			var html, newHtml, element;
			//html strings with placeholder text
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;

				html = '<div class="item clearfix" id="inc-%id%"><div class="itemDescription">%description%</div><div class="right clearfix"><div class="itemValue">%value%</div><div class="itemDelete"><button class="itemDelete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}else if (type === 'exp') {
				element = DOMstrings.expensesContainer;

				html = '<div class="item clearfix" id="exp-%id%"><div class="itemDescription">%description%</div><div class="right clearfix"><div class="itemValue">%value%</div><div class="itemPercentage">21%</div><div class="itemDelete"><button class="itemDelete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			};

			//placeholder with actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', obj.value);

			//DOM html
			 document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


		},

		deleteListItem: function(selectorID) {
			var ele = document.getElementById(selectorID);
			ele.parentNode.removeChild(ele);
			
		},

		 
        clearFields: function() {
			var fields, fieldsArr;
			
			fields = document.querySelectorAll(DOMstrings.inputDesription + ', ' + DOMstrings.inputValue);
			fieldsArr = Array.prototype.slice.call(fields);
			fieldsArr.forEach(function(current, index, array){
				current.value = "";
			});

			fieldsArr[0].focus();
		},

		displayBudget : function(obj){

			document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
			document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
			document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
			

			if (obj.percentage > 0){
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else{
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},


		getDOMstrings: function(){
			return DOMstrings;
		}
	};

})();


// Global app control

var controller =(function(budgetCtrl, UICtrl) {
	 
	var setupEventListeners = function() {
		
		var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

	    document.addEventListener('keypress', function(event) {
		
		if(event.keycode === 13 || event.which === 13) {
			ctrlAddItem();
		}
	}); 
	
	document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

	};

    var updateBudget = function() {
		 //4. calculate the budget
		 budgetCtrl.calculateBudget();

		 //4.1 Return the budget
		 var budget = budgetCtrl.getBudget();

		 //5.display the bydget on the UI	
		 UICtrl.displayBudget(budget);	

	};




    var ctrlAddItem = function() {
		var input, newItem;

		// 1.get the field input data
		input = UICtrl.getInput();	
		
		if (input.description !== "" && !isNaN(input.value) && input.value > 0){

		//2. add the item to the budget
		newItem = budgetCtrl.addItem(input.type, input.description, input.value);

		//3. add thhe item to the UI
		UICtrl.addListItem(newItem, input.type);

		//3.1 clear the fields
		UICtrl.clearFields();

		//4. calculate and update budget
		updateBudget();
 

		} 
	};


	var ctrlDeleteItem = function(event){
		var itemID, splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemID){
			//inc-1
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);
			
			//1. delete item from data structure here
			budgetCtrl.deleteItem(type, ID);

			//2.delete item from UI here
			UICtrl.deleteListItem(itemID);

			//3.update and display on UI
			updateBudget();
		}
	};			 
		
		
	return {
		init: function(){
			console.log('Budget Application is Ready');
			UICtrl.displayBudget({

				budget : 0,
				totalInc : 0,
				totalExp : 0,
				percentage : -1

			});
			setupEventListeners();

		}
	};	

})(budgetController, UIController);


controller.init();