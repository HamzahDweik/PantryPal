var products = JSON.parse(localStorage.getItem('products')) ||  {
    'Canned Soup': { price: 2.00, quantity: 3 },
    'Canned Tuna': { price: 3.50, quantity: 3 },
    'Canned Corn': { price: 1.50, quantity: 3 },
    'Canned Beans': { price: 2.00, quantity: 3 },
    'Ketchup': { price: 3.00, quantity: 3 },
    'Mustard': { price: 2.50, quantity: 3 },
    'Peanut Butter': { price: 4.00, quantity: 3 },
    'Jam': { price: 3.50, quantity: 3 },
    'Spaghetti': { price: 2.00, quantity: 3 },
    'Pizza Sauce': { price: 3.00, quantity: 3 },
    'Potato Chips': { price: 1.75, quantity: 10 },
    'Pretzels': { price: 1.50, quantity: 10 },
    'Popcorn': { price: 1.25, quantity: 10 },
    'Trail Mix': { price: 3.00, quantity: 10 },
    'Granola Bar': { price: 2.00, quantity: 10 },
    'Apple Pie Filling': { price: 3.00, quantity: 10 },
    'Cherry Pie Filling': { price: 3.50, quantity: 10 },
    'Classic Pie Crust': { price: 2.50, quantity: 10 },
    'Graham Cracker Crust': { price: 2.75, quantity: 10 },
    'Vanilla Pudding Mix': { price: 1.50, quantity: 10 },
    'Chocolate Pudding Mix': { price: 1.50, quantity: 10 },
    'Aluminum Pie Pan': { price: 4.00, quantity: 10 },
    'Glass Pie Pan': { price: 6.00, quantity: 10 },
    'Reeces Puffs': { price: 5.00, quantity: 3 },
    'Cinnamon Toast Crunch': { price: 6.00, quantity: 3 },
    'Pancakes': { price: 4.50, quantity: 3 },
    'Waffles': { price: 5.50, quantity: 3 },
    'Toast Bread': { price: 2.50, quantity: 3 },
    'Bagels': { price: 3.50, quantity: 3 },
    'English Muffin': { price: 4.00, quantity: 3 },
    'Danish Pastry': { price: 6.00, quantity: 3 },
    'Oatmeal': { price: 2.00, quantity: 3 },
    'Grits': { price: 2.50, quantity: 3 },
    'Milk Chocolate': { price: 1.50, quantity: 10 },
    'Gummy Bears': { price: 2.00, quantity: 10 },
    'Cherry Lollipop': { price: 0.50, quantity: 10 },
    'Peppermint Candy': { price: 1.25, quantity: 10 },
    'Sour Worms': { price: 2.25, quantity: 10 },
    'Carrot': { price: 0.75, quantity: 3 },
    'Broccoli': { price: 1.25, quantity: 3 },
    'Apple': { price: 1.00, quantity: 3 },
    'Banana': { price: 0.50, quantity: 3 },
    'Cut Melon': { price: 1.50, quantity: 3 },
    'Cut Pineapple': { price: 2.00, quantity: 3 },
    'Roses': { price: 10.00, quantity: 3 },
    'Lilies': { price: 8.00, quantity: 3 },
    'Tomato Salsa': { price: 4.00, quantity: 3 },
    'Guacamole': { price: 5.00, quantity: 3 },
    'Winter Squash': { price: 1.50, quantity: 3 },
    'Spring Peas': { price: 2.50, quantity: 3 },
    'Frozen Waffle': { price: 3.00, quantity: 3 },
    'Frozen Pancake': { price: 3.50, quantity: 3 },
    'Ice Cream': { price: 6.00, quantity: 3 },
    'Frozen Yogurt': { price: 5.00, quantity: 3 },
    'Frozen Chicken Meal': { price: 7.00, quantity: 3 },
    'Frozen Vegetarian Meal': { price: 6.50, quantity: 3 },
    'Pepperoni Pizza': { price: 8.00, quantity: 3 },
    'Cheese Pizza': { price: 7.00, quantity: 3 },
    'Frozen Chicken': { price: 10.00, quantity: 3 },
    'Frozen Beef': { price: 12.00, quantity: 3 },
    'Frozen Mozzarella Sticks': { price: 5.00, quantity: 3 },
    'Frozen Onion Rings': { price: 4.50, quantity: 3 },
};

localStorage.setItem('products', JSON.stringify(products));

var categories = {
    "Carrot": "product all vegetables",
    "Broccoli": "product all vegetables",
    "Apple": "product all fruits",
    "Banana": "product all fruits",
    "Cut Melon": "product all fruits preCutFruits newItems",
    "Cut Pineapple": "product all fruits preCutFruits rollbacks",
    "Roses": "product all flowers",
    "Lilies": "product all flowers",
    "Tomato Salsa": "product all salsaDips newItems",
    "Guacamole": "product all salsaDips rollbacks",
    "Winter Squash": "product all seasonProduce vegetables",
    "Spring Peas": "product all seasonProduce vegetables newItems",
    "Frozen Waffle": "product all frozenBreakfast",
    "Frozen Pancake": "product all frozenBreakfast",
    "Ice Cream": "product all frozenDessert",
    "Frozen Yogurt": "product all frozenDessert",
    "Frozen Chicken Meal": "product all frozenMeals",
    "Frozen Vegetarian Meal": "product all frozenMeals",
    "Pepperoni Pizza": "product all frozenPizza rollbacks",
    "Cheese Pizza": "product all frozenPizza",
    "Frozen Chicken": "product all frozenMeat rollbacks",
    "Frozen Beef": "product all frozenMeat",
    "Frozen Mozzarella Sticks": "product all frozenSnacks",
    "Frozen Onion Rings": "product all frozenSnacks",
    "Canned Soup": "product all cannedGoods",
    "Canned Tuna": "product all cannedGoods",
    "Canned Corn": "product all cannedVegetable cannedGoods",
    "Canned Beans": "product all cannedVegetable cannedGoods",
    "Ketchup": "product all condiments rollbacks",
    "Mustard": "product all condiments",
    "Peanut Butter": "product all peanutButterSpread rollbacks",
    "Jam": "product all peanutButterSpread",
    "Spaghetti": "product all pastaPizza",
    "Pizza Sauce": "product all pastaPizza",
    "Reeces Puffs": "product all cerealShop",
    "Cinnamon Toast Crunch": "product all cerealShop",
    "Pancakes": "product all pancakesWaffles rollbacks",
    "Waffles": "product all pancakesWaffles",
    "Toast Bread": "product all breakfastBreads",
    "Bagels": "product all breakfastBreads rollbacks",
    "Oatmeal": "product all oatmealGrits",
    "Grits": "product all oatmealGrits rollbacks",
    "Apple Pie Filling": "product all pieFilling",
    "Cherry Pie Filling": "product all pieFilling",
    "Classic Pie Crust": "product all pieCrust",
    "Graham Cracker Crust": "product all pieCrust",
    "Vanilla Pudding Mix": "product all puddingMix",
    "Chocolate Pudding Mix": "product all puddingMix",
    "Aluminum Pie Pan": "product all piePans",
    "Glass Pie Pan": "product all piePans"
};

function createSearchableProductStanza(productName, productPrice, productQuantity) {

    var productElement = document.createElement('div');
    productElement.className = 'product';
    var nameWithoutSpaces = productName.replace(/ /g, '');
    
    productElement.innerHTML = `
        <img src="../images/${nameWithoutSpaces}.jpg" alt="${productName}" width="150">
        <h4>${productName}</h4>
        <p>Price: $${productPrice.toFixed(2)}  Quantity: <span id="quant${nameWithoutSpaces}">${productQuantity}</span></p>
        <input type="number" id="amount-${nameWithoutSpaces}">
        <button class="addToCartBtn" onclick="addXToCart('${productName}', document.getElementById('amount-${nameWithoutSpaces}').value, ${productPrice})">Add to Cart</button>
    `;

    return productElement;
}

function createCategoricalProductStanza(productName, productPrice, productQuantity) {
    
    var productElement = document.createElement('div');
    productElement.className = categories[productName];
    var nameWithoutSpaces = productName.replace(/\s+/g, '');
    
    productElement.innerHTML = `
        <img src="../images/${nameWithoutSpaces}.jpg" alt="${productName}" width="150">
        <h4>${productName}</h4>
        <p>Price: $${productPrice.toFixed(2)}  Quantity: <span id="quant${nameWithoutSpaces}">${productQuantity}</span></p>
        <button class="addToCartBtn" onclick="addXToCart('${productName}', 1, ${productPrice})">Add to Cart</button>
    `;

    return productElement;
}

function populateProducts(){
    var categoricalDiv = document.querySelector('.categorical');
    var searchableDiv = document.querySelector('.searchable');

    if (categoricalDiv) {

        var innerHTML = categoricalDiv.innerHTML;
        categoricalDiv.innerHTML = '';
        var currentProducts = innerHTML.split(',');
        console.log(currentProducts);

        for (var productName of currentProducts) {
            var product = products[productName];
            if(!product){
                console.log("Product not found: " + productName);
                continue;
            }
            var productStanza = createCategoricalProductStanza(productName, product.price, product.quantity);
            categoricalDiv.appendChild(productStanza);
        }

    } else if (searchableDiv) {

        var innerHTML = searchableDiv.innerHTML;
        searchableDiv.innerHTML = '';
        var currentProducts = innerHTML.split(',');
        console.log(currentProducts);

        for (var productName of currentProducts) {
            var product = products[productName];
            if(!product){
                console.log("Product not found: " + productName);
                continue;
            }
            var productStanza = createSearchableProductStanza(productName, product.price, product.quantity);
            searchableDiv.appendChild(productStanza);
        }
    }
}

populateProducts();

function addXToCart(productName, quantity, price) {
    var quantityElement = document.getElementById("quant" + productName.replace(/\s+/g, ''));
    var availableQuantity = products[productName].quantity;

    if (availableQuantity >= quantity) {
        products[productName].quantity -= quantity;
        quantityElement.innerText = products[productName].quantity;
        
        if (cart[productName]) {
            cart[productName].quantity += Number(quantity);
            cart[productName].totalPrice += quantity * price;
        } else {
            cart[productName] = {
                quantity: Number(quantity),
                totalPrice: quantity * price
            };
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('products', JSON.stringify(products));

    } else if(availableQuantity == 0) {
        alert("Sorry, " + productName + " is out of stock!");
    } else {
        alert("Sorry, your request of " + quantity + " " + productName + " exceeds the current inventory!");
    }
}

function calculateTotal(){
    var total = 0;
    for (var itemName in cart) {
        if (cart.hasOwnProperty(itemName)) {
            var item = cart[itemName];
            total += item.totalPrice;
        }
    }
    return total.toFixed(2);
}

var cart = JSON.parse(localStorage.getItem('cart')) || {};

function displayCart() {
    var tableBody = document.querySelector("#cartTable tbody");

    for (var itemName in cart) {
        if (cart.hasOwnProperty(itemName)) {
            var item = cart[itemName];
            var row = document.createElement("tr");
            var itemNameCell = document.createElement("td");
            itemNameCell.textContent = itemName;
            var quantityCell = document.createElement("td");
            quantityCell.textContent = item.quantity;
            var priceCell = document.createElement("td");
            var price = item.totalPrice / item.quantity;
            priceCell.textContent = `$${price.toFixed(2)}`;
            var totalPriceCell = document.createElement("td");
            totalPriceCell.textContent = `$${item.totalPrice.toFixed(2)}`;
            row.appendChild(itemNameCell);
            row.appendChild(quantityCell);
            row.appendChild(priceCell);
            row.appendChild(totalPriceCell);
            tableBody.appendChild(row);
        }
    }

    var finalRow = document.createElement("tr");
    finalRow.appendChild(document.createElement("td"));
    finalRow.appendChild(document.createElement("td"));
    finalRow.appendChild(document.createElement("td"));
    var totalCell = document.createElement("td");
    totalCell.textContent = `$${calculateTotal()}`;
    finalRow.appendChild(totalCell);
    tableBody.appendChild(finalRow);
}

if(document.getElementById("cartTable")) {
    displayCart();
    console.log("displayCart() called");
} else {
    console.log("displayCart() not called");
}
