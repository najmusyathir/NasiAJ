// Importing productsData from external data source
import { productsData } from "../data/products.js";

// Retrieving stored order details from localStorage
const storedOrderDetailsJson = localStorage.getItem("orderDetails");
let storedOrderDetails;
let deliveryType;

// Parsing stored order details if available
if (storedOrderDetailsJson) {
    storedOrderDetails = JSON.parse(storedOrderDetailsJson);
}

// Initializing cartItems array with stored order details or an empty array
let cartItems = storedOrderDetails ? storedOrderDetails.cartItems : [];

// Initializing orderDetails variable
let orderDetails;

// Function to add items to the shopping cart
function addToCart(itemId, itemName, price, quantity) {
  const existingItem = cartItems.find((item) => item.itemId === itemId);

  if (existingItem) {
    // If item already exists in the cart, update quantity and total
    existingItem.quantity += quantity;
    existingItem.total = parseFloat(existingItem.price) * existingItem.quantity;
  } else {
    // If item is not in the cart, add a new entry
    const total = parseFloat(price) * parseInt(quantity);
    cartItems.push({
      itemId: itemId,
      itemName: itemName,
      price: price,
      quantity: quantity,
      total: total,
    });
  }
  // Update the cart display
  updateCart();
}

// Retrieving delivery type dropdown element
const deliveryTypeDropdown = document.getElementById("delivery-type");

// Load the saved deliveryType from localStorage
let savedDeliveryType = localStorage.getItem("deliveryType");
deliveryType = savedDeliveryType || "DineIn"; // Default to "dine" if not set

// Set the initial value of the dropdown
deliveryTypeDropdown.value = deliveryType;

// Event listener for delivery type dropdown change
deliveryTypeDropdown.addEventListener("change", function () {
  // Update the deliveryType variable
  deliveryType = this.value;
  
  // Save the updated deliveryType to localStorage
  localStorage.setItem("deliveryType", deliveryType);

  // Call updateCart to reflect the change immediately
  updateCart();
});

// Function to update the shopping cart display
function updateCart() {
  const cartList = document.getElementById("cart-items");
  const totalElement = document.getElementById("total");

  let totalPrice = 0;

  // Clear existing cart display
  cartList.innerHTML = "";

  // Iterate through cartItems and update the display
  cartItems.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
        <div class="cart_item_details">
        <br><strong>${item.itemName}</strong><br>RM${item.price.toFixed(2)}
        <br>Quantity: ${item.quantity} 
        <br><strong>Total: RM${item.total.toFixed(2)}</strong></div>
        <br>
        <div class="item_btn">
          <button class="quantity-btn" data-id="${
            item.itemId
          }" data-action="decrease">-</button>
          <button class="quantity-btn" data-id="${
            item.itemId
          }" data-action="increase">+</button>
          <button class="delete-btn" data-id="${item.itemId}">×</button>
        </div>
      `;
    cartList.appendChild(listItem);

    totalPrice += item.total;
  });

   // Add additional cost for COD
   if (deliveryType === "Cod(RM5)") {
    totalPrice += 5;
  }
  
  // Update the total price display
  totalElement.textContent = totalPrice.toFixed(2);

  // Add event listeners for quantity and delete buttons
  const quantityButtons = document.querySelectorAll(".quantity-btn");
  quantityButtons.forEach((button) => {
    button.addEventListener("click", handleQuantityButtonClick);
  });

  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", handleDeleteButtonClick);
  });

  // Update the total quantity display
  updateTotalQuantity();
}

// Function to update the total quantity display
function updateTotalQuantity() {
  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const cartQuantityElement = document.getElementById("cart-quantity");
  cartQuantityElement.textContent = totalQuantity;
}

// Function to update total quantity on cart change
function updateQuantityOnCartChange() {
  updateTotalQuantity();
}

// Event handler for quantity button click
function handleQuantityButtonClick(event) {
  const itemId = event.target.getAttribute("data-id");
  const action = event.target.getAttribute("data-action");

  const currentItem = cartItems.find((item) => item.itemId === itemId);

  if (currentItem) {
    if (action === "increase") {
      currentItem.quantity += 1;
    } else if (action === "decrease" && currentItem.quantity > 1) {
      currentItem.quantity -= 1;
    }

    currentItem.total = parseFloat(currentItem.price) * currentItem.quantity;
  }

  // Update the cart display and total quantity
  updateCart();
  updateQuantityOnCartChange();
}

// Event handler for delete button click
function handleDeleteButtonClick(event) {
  const itemId = event.target.getAttribute("data-id");
  cartItems = cartItems.filter((item) => item.itemId !== itemId);
  // Update the cart display and total quantity
  updateCart();
  updateQuantityOnCartChange();
}

// Function to clear the shopping cart
function clearCart() {
  const checkoutContainer = document.getElementById("cart");

  const checkoutItem = document.createElement("div");
  checkoutItem.className = "checkout";

  checkoutContainer.appendChild(checkoutItem);

  const ckoutbtn = document.getElementById("checkout");
  ckoutbtn.addEventListener("click", function () {
    // Get the selected delivery type
    const deliveryType = document.getElementById("delivery-type").value;
    const cartList = document.getElementById("cart-items");
    const totalElement = document.getElementById("total");

    // Clear the cart display
    cartList.innerHTML = "";

    // Prepare orderDetails for the receipt
    orderDetails = {
      cartItems: [...cartItems],
      totalPrice: totalElement.textContent,
      deliveryType: deliveryType,
    };

    // Reset the total price display and cartItems array
    totalElement.textContent = 0;
    cartItems = [];

    // Update the cart display
    updateCart();

    // Redirect to the receipt page with orderDetails as a query parameter
    window.location.href = "../html/receipt.html?orderDetails=" + JSON.stringify(orderDetails);

     // Update localStorage with the latest order details
     const orderDetailsJson = JSON.stringify(orderDetails);
     localStorage.setItem("orderDetails", orderDetailsJson);
  });
}

// Function to generate the menu on the web page
function generateMenu() {
  const menuContainer = document.getElementById("menu-content");

  for (const category in productsData) {
    if (productsData.hasOwnProperty(category)) {
      const categoryItems = productsData[category];

      const categoryHeading = document.createElement("h2");
      categoryHeading.textContent =
        category.charAt(0).toUpperCase() + category.slice(1);
      menuContainer.appendChild(categoryHeading);

      const categoryContainer = document.createElement("div");
      categoryContainer.className = "grid_3xn";
      menuContainer.appendChild(categoryContainer);

      // Iterate through products in the category and create menu items
      categoryItems.forEach((product) => {
        const menuItem = document.createElement("div");
        menuItem.className = "grid_item";
        menuItem.innerHTML = `
        <div>
          <img src="${product.image}" />
          <p id="menu_title">${product.itemName}</p>
        </div>

        <div>
          <p id="menu_price">RM${product.price.toFixed(2)}</p>
          <label class="hidden_class" for="quantity-${
            product.itemId
          }">Quantity:</label>
          <input class="hidden_class" type="number" id="quantity-${
            product.itemId
          }" name="quantity-${product.itemId}" min="1" value="1">
          <button class="add-to-cart-btn" data-id="${
            product.itemId
          }" data-name="${product.itemName}" data-price="${
          product.price
        }" id="add_btn">Add to Cart</button>
        </div>`;

        categoryContainer.appendChild(menuItem);

        // Add event listener for "Add to Cart" button
        const addToCartBtn = menuItem.querySelector(".add-to-cart-btn");
        addToCartBtn.addEventListener("click", function () {
          const itemId = this.getAttribute("data-id");
          const itemName = this.getAttribute("data-name");
          const price = parseFloat(this.getAttribute("data-price"));
          const quantity = parseInt(
            document.getElementById(`quantity-${itemId}`).value
          );

          // Call addToCart function to add the selected item to the cart
          addToCart(itemId, itemName, price, quantity);
        });
      });
    }
  }
  // Call clearCart function to set up event listeners and update cart display
  clearCart();
  // Call updateCart function to initially update the cart display
  updateCart();
}

// Update the total quantity display
updateTotalQuantity();
// Generate the menu on page load
generateMenu();
