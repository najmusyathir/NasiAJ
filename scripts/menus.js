import { productsData } from "../data/products.js";

const storedOrderDetailsJson = localStorage.getItem("orderDetails");
let storedOrderDetails;
let deliveryType;

if (storedOrderDetailsJson) {
    storedOrderDetails = JSON.parse(storedOrderDetailsJson);
}

let cartItems = storedOrderDetails ? storedOrderDetails.cartItems : [];

let orderDetails;

function addToCart(itemId, itemName, price, quantity) {
  const existingItem = cartItems.find((item) => item.itemId === itemId);

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.total = parseFloat(existingItem.price) * existingItem.quantity;
  } else {
    const total = parseFloat(price) * parseInt(quantity);
    cartItems.push({
      itemId: itemId,
      itemName: itemName,
      price: price,
      quantity: quantity,
      total: total,
    });
  }
  updateCart();
}

const deliveryTypeDropdown = document.getElementById("delivery-type");

// Load the saved deliveryType from localStorage
let savedDeliveryType = localStorage.getItem("deliveryType");
deliveryType = savedDeliveryType || "DineIn"; // Default to "dine" if not set

// Set the initial value of the dropdown
deliveryTypeDropdown.value = deliveryType;

deliveryTypeDropdown.addEventListener("change", function () {
  // Update the deliveryType variable
  deliveryType = this.value;
  
  localStorage.setItem("deliveryType", deliveryType);

  // Call updateCart to reflect the change immediately
  updateCart();
});
  
function updateCart() {
  const cartList = document.getElementById("cart-items");
  const totalElement = document.getElementById("total");

  let totalPrice = 0;

  cartList.innerHTML = "";

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
  
  totalElement.textContent = totalPrice.toFixed(2);

  const quantityButtons = document.querySelectorAll(".quantity-btn");
  quantityButtons.forEach((button) => {
    button.addEventListener("click", handleQuantityButtonClick);
  });

  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", handleDeleteButtonClick);
  });

  updateTotalQuantity();
}

function updateTotalQuantity() {
  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const cartQuantityElement = document.getElementById("cart-quantity");
  cartQuantityElement.textContent = totalQuantity;
}

function updateQuantityOnCartChange() {
  updateTotalQuantity();
}

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

  updateCart();
  updateQuantityOnCartChange();
}

function handleDeleteButtonClick(event) {
  const itemId = event.target.getAttribute("data-id");
  cartItems = cartItems.filter((item) => item.itemId !== itemId);
  updateCart();
  updateQuantityOnCartChange();
}

function clearCart() {
  const checkoutContainer = document.getElementById("cart");

  const checkoutItem = document.createElement("div");
  checkoutItem.className = "checkout";

  checkoutContainer.appendChild(checkoutItem);

  const ckoutbtn = document.getElementById("checkout");
  ckoutbtn.addEventListener("click", function () {
    const deliveryType = document.getElementById("delivery-type").value;
    const cartList = document.getElementById("cart-items");
    const totalElement = document.getElementById("total");

    cartList.innerHTML = "";
    orderDetails = {
      cartItems: [...cartItems],
      totalPrice: totalElement.textContent,
      deliveryType: deliveryType,
    };

    totalElement.textContent = 0;

    cartItems = [];
    updateCart();

    window.location.href = "../html/receipt.html?orderDetails=" + JSON.stringify(orderDetails);
     // Add the following code to update localStorage
     const orderDetailsJson = JSON.stringify(orderDetails);
     localStorage.setItem("orderDetails", orderDetailsJson);
  });
}

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

        const addToCartBtn = menuItem.querySelector(".add-to-cart-btn");
        addToCartBtn.addEventListener("click", function () {
          const itemId = this.getAttribute("data-id");
          const itemName = this.getAttribute("data-name");
          const price = parseFloat(this.getAttribute("data-price"));
          const quantity = parseInt(
            document.getElementById(`quantity-${itemId}`).value
          );

          addToCart(itemId, itemName, price, quantity);
        });
      });
    }
  }
  clearCart();
  updateCart();
}
updateTotalQuantity();
generateMenu();
