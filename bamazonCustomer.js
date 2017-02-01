var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");



var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;

   buildTable();
   
});

function buildTable() {

	var table = new Table({ head: ["Product ID", "Product", "Department", "Price", "Quantity"] });
	
 
	var tableQuery = "SELECT * FROM products";
    
    connection.query(tableQuery, function(err, res) {
      for (var i = 0; i < res.length; i++) {
      	table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
      	
		};

		console.log(table.toString());

      
	});

	runBamazon();

};
	
 

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
		connection.query(query, {item_id:id}, function(err, res){
		
			if(res[0].stock_quantity > user.quantity){
				var newQuantity = res[0].stock_quantity - user.quantity;
				var totalPrice = user.quantity * res[0].price;

				connection.query("UPDATE products SET ? WHERE ??", [stock_quantity: newQuantity, item_id:id], function(err, res){
					if(err) throw err;
				});

				console.log("====================================");
				console.log("You purchased " + user.quantity + " " + res[0].product_name);	
				console.log("Your total price is: " + "$" + totalPrice);
				console.log("====================================");
				continueShopping();
			}else{
				console.log("Insufficient quantity available. Sorry!");
				continueShopping();
			};

		});



	});


};//end runBamazon function

function continueShopping (){
	inquirer.prompt([
		{
			message: "Would you like to continue shopping? (y/n)",
			name: "yesOrNo"
		}



	]).then(function(user){
		if(user.yesOrNo === "y"){
			buildTable();
		}else{
			console.log("GET OUTTA HERE!!!");
		}

	});
}