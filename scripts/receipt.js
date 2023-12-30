// Function to generate a unique order ID
function generateOrderId() {
  return "ORD" + Date.now().toString(36).toUpperCase();
}

// Function to get the current date and time
function getCurrentDateTime() {
  const now = new Date();
  return now.toISOString();
}

function handleFormSubmission() {
    const customerName = document.getElementById("customer-name").value;
    const phoneNumber = document.getElementById("cust-phone").value;
    const address = document.getElementById("cust-address").value;
  
    // Generate unique order ID and get current date and time
    const orderId = generateOrderId();
    const orderDate = getCurrentDateTime();
  
    // Combine customer information with order details
    const newOrder = {
      orderId,
      orderDate,
      customer: {
        customerName,
        phoneNumber,
        address,
      },
      items: orderDetails.cartItems,
      totalPrice: orderDetails.totalPrice,
    };
  
    // Convert the JavaScript object to JSON
    const jsonContent = JSON.stringify(newOrder, null, 2);
  
    // Create a Blob with the JSON content
    const blob = new Blob([jsonContent], { type: "application/json" });
  
    // Create a link element
    const link = document.createElement("a");
  
    // Set the href attribute to a data URL representing the Blob
    link.href = URL.createObjectURL(blob);
  
    // Set the download attribute to specify the filename
    link.download = "order.json";
  
    // Append the link to the document
    document.body.appendChild(link);
  
    // Trigger a click event on the link to start the download
    link.click();
  
    // Remove the link from the document
    document.body.removeChild(link);
  
    // Optionally, you can redirect the user to a thank you page or do other actions
    alert("Order completed. Thank you!");
  }
  
  

// Call the handleFormSubmission function when the "Finish" button is clicked
const finishBtn = document.getElementById("finish-btn");
finishBtn.addEventListener("click", handleFormSubmission);

// Function to display the order details on the receipt page
function displayOrderDetails(orderDetails) {
  const receiptContainer = document.getElementById("receipt-container");
  receiptContainer.innerHTML = "<h2>Your Order Details:</h2>";

  if (orderDetails && orderDetails.cartItems.length > 0) {
    const ul = document.createElement("ul");

    orderDetails.cartItems.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.itemName} - RM${item.price.toFixed(2)} x ${
        item.quantity
      } = RM${item.total.toFixed(2)}`;
      ul.appendChild(li);
    });

    receiptContainer.appendChild(ul);

    // Display total price
    receiptContainer.innerHTML += `<p>Total Price: RM${orderDetails.totalPrice}</p>`;
  } else {
    receiptContainer.innerHTML += "<p>No items in the order.</p>";
  }
}

// Retrieve orderDetails from the query parameter in the URL
const searchParams = new URLSearchParams(window.location.search);
const orderDetailsParam = searchParams.get("orderDetails");
const orderDetails = JSON.parse(orderDetailsParam);

// Call the displayOrderDetails function
displayOrderDetails(orderDetails);
console.log(orderDetails);
