
// Function to confirm new customer created

const ConfirmCreated = (result) => {


  if (result.trans == "fail") {
   
    const divElement = document.getElementById("output");
    divElement.innerHTML = "";

    const h2ConfirmElement = document.createElement("h2");
    h2ConfirmElement.textContent = "Error creating new customer";

    const pErrorElement = document.createElement("p");
    pErrorElement.textContent = result.msg;

    divElement.appendChild(h2ConfirmElement);
    divElement.appendChild(pErrorElement);
  }
  else {
    const divElement = document.getElementById("output");
    divElement.innerHTML = "";

    const h2ConfirmElement = document.createElement("h2");
    h2ConfirmElement.textContent = "New Customer Created!";

    divElement.appendChild(h2ConfirmElement);
  };


}

// Handle form submission
document.querySelector("form").addEventListener("submit", e => {

  e.preventDefault();
 
  const formData = new FormData(e.target);
  fetch("/createcustomer", {
    method: "POST",
    body: formData
  })
    .then(response => response.json())
    .then(result => {
      ConfirmCreated(result);
    })
    .catch(err => {
      console.error(err.message);
    });
});