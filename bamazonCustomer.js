//npm packages that are required
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");


//define the var connection so it can create a connection to the bamazon database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});

//start connection to bamazon database
connection.connect(function(err) {
  if (err) throw err;
  //initial build of the table
   buildTable();
   
});

//start of reusable functions
//==========================
function buildTable() {

	var table = new Table({ head: ["Product ID", "Product", "Department", "Price", "Quantity"] });
	
 
	var tableQuery = "SELECT * FROM products";
    
    //goes through the database to populate table
    connection.query(tableQuery, function(err, res) {
      for (var i = 0; i < res.length; i++) {
      	table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
      	
		};

		console.log(table.toString());

      
	});

	runBamazon();//once table is built ask question to user

};
	
 
//function that prompts user for what they what and how much
//also does math to recalibrate the database
function runBamazon(){


	inquirer.prompt([
		{
			message: "What is the id of product you'd like to buy?",
			name: "idChoice"
		},

		{
			message: "How many units would you like?",
			name: "quantity"
		}



	]).then(function(user){
		var query = "SELECT * FROM products WHERE ?";
		var id = parseInt(user.idChoice);
		//connect to database to so it can be updated if the quantity requested by user is available
		connection.query(query, {item_id:id}, function(err, res){
		
			if(res[0].stock_quantity > user.quantity){
				//subtracts the database quantity from what user is buying
				var newQuantity = res[0].stock_quantity - user.quantity;
				//calculates the total price
				var totalPrice = user.quantity * res[0].price;
				//updates the database to new quantity, kinda at the moment
				connection.query("UPDATE products SET ? WHERE ??", [stock_quantity: newQuantity, item_id:id], function(err, res){
					if(err) throw err;
				});
				//displays to user what and how much they bought as well as the total price
				console.log("====================================");
				console.log("You purchased " + user.quantity + " " + res[0].product_name);	
				console.log("Your total price is: " + "$" + totalPrice);
				console.log("====================================");
				continueShopping();
			}else{//if quantity is not available they are told so and asked to try again
				console.log("Insufficient quantity available. Sorry!");
				continueShopping();
			};

		});



	});


};//end runBamazon function

//function that asks the user if they would like another round of shopping
function continueShopping (){
	inquirer.prompt([
		{
			message: "Would you like to continue shopping? (y/n)",
			name: "yesOrNo"
		}



	]).then(function(user){
		if(user.yesOrNo === "y"){
			//if yes, starts all over
			buildTable();
		}else{
			//if no we push them out the door
			console.log("GET OUTTA HERE!!!");
		}

	});
}

//============
//end of reuseable functions