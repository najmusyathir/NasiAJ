// Function to generate a unique order ID
function generateOrderId() {
  return "ORD" + Date.now().toString(36).toUpperCase();
}

// Function to get the current date and time in Malaysia (UTC+8)
function getCurrentDateTimeInMalaysia() {
  const now = new Date();
  const malaysiaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // UTC+8 in milliseconds
  return malaysiaTime.toISOString();
}

// Function to encode a file to base64
function encodeFileToBase64(file, callback) {
  const reader = new FileReader();

  reader.onload = function () {
    callback(reader.result.split(',')[1]); // Extract base64 part from data URL
  };

  reader.readAsDataURL(file);
}

// Event handler for form submission
function handleFormSubmission() {
  // Retrieving form input values
  const customerName = document.getElementById("customer-name").value;
  const phoneNumber = document.getElementById("cust-phone").value;
  const address = document.getElementById("cust-address").value;
  const orderReceiptInput = document.getElementById("customer-pay");
  const orderId = generateOrderId();
  const orderDate = getCurrentDateTimeInMalaysia();

  // Creating a new order object
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
    orderReceipt: '', // Initialize orderReceipt
    fileType: '', 
    orderType: orderDetails.deliveryType, // Include deliveryType
  };

  const orderReceiptFile = orderReceiptInput.files[0];

  if (orderReceiptFile) {
    // Extract file extension
    const fileName = orderReceiptFile.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();

    // Set fileType based on file extension
    newOrder.fileType = fileExtension;
  }

  // Encode the file to base64
  encodeFileToBase64(orderReceiptFile, function (base64Data) {
    // Update orderReceipt with the encoded data
    newOrder.orderReceipt = base64Data;

    // Continue with the rest of the code (inside the callback)
    const jsonContent = JSON.stringify(newOrder, null, 2);

    // Create a link to download the JSON file
    const link = document.createElement("a");
    link.download = "order.json";

    // Display the order details in the console
    console.log(jsonContent);

    // Display loading spinner during fetch
    const loadingSpinner = document.getElementById("loading-spinner");
    loadingSpinner.style.display = "block"; 

    // Send a POST request to submit the order
    fetch(
      "https://nasi-aj-backend-service.onrender.com/nasi_aj/api/v2/submitOrder",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Add this line
        },
        body: jsonContent,
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        console.log("Order submitted successfully:", data);
        // Clear orderDetails from localStorage
        localStorage.removeItem("orderDetails");
        // Show the order completion message
        const orderCompletionMessage = document.getElementById("order-completion-message");
        orderCompletionMessage.style.display = "flex";

        // Redirect to home page after a delay
        setTimeout(() => {
          window.location.href = "../index.html";
        }, 6000); // 6000 milliseconds (6 seconds)
      })
      .catch((error) => {
        console.error("Error submitting order:", error);
        alert("Error submitting order. Please try again.");
      })
      .finally(() => {
        // Hide the loading spinner after fetch completes
        loadingSpinner.style.display = "none";
      });
  });
}

// Event listener for the "Finish" button
const finishBtn = document.getElementById("finish-btn");
finishBtn.addEventListener("click", handleFormSubmission);

// Function to close the popup window
function closePopup() {
  window.close();
}

// Function to display order details on the receipt
function displayOrderDetails(orderDetails) {
  const receiptContainer = document.getElementById("receipt-container");
  
  if (orderDetails && orderDetails.cartItems.length > 0) {
    // Create a list element for each item in the order
    const ul = document.createElement("ul");
    orderDetails.cartItems.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.itemName} - RM${item.price.toFixed(2)} x ${
        item.quantity
      } = RM${item.total.toFixed(2)}`;
      ul.appendChild(li);
    });

    // Append the list to the receipt container
    receiptContainer.appendChild(ul);

    // Display total price and order type
    receiptContainer.innerHTML += `<p><strong>Order Type: ${orderDetails.deliveryType}</strong></p>`;
    receiptContainer.innerHTML += `<p><strong>Total Price: RM${orderDetails.totalPrice}</strong></p>`;
  } else {
    // Display a message if there are no items in the order
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
