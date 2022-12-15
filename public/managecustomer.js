// Function to display results
const displayResults = (result) => {
  const divElement = document.getElementById("output");

  divElement.innerHTML = "";

  if (result.trans === "Error") {
    const h2Elem = document.createElement("h2");
    h2Elem.innerText = "Application Error";
    const paraElement = document.createElement("p");
    paraElement.innerText = result.result;
    // Add elements
    divElement.appendChild(h2Elem);
    divElement.appendChild(paraElement);
  } else {
    if (result.result.length === 0) {
     
      const h3Elem = document.createElement("h3");
      h3Elem.innerText = "No Records found!";
      divElement.appendChild(h3Elem);
    } else {
      // Create a table element and table header row
      const tblElement = document.createElement("table");
      const theadElement = document.createElement("thead");
      const thRowElement = document.createElement("tr");
      const thIdElement = document.createElement("td");
      thIdElement.innerText = "ID";
      const thFirstNameElement = document.createElement("td");
      thFirstNameElement.innerText = "First Name";
      const thLastNameElement = document.createElement("td");
      thLastNameElement.innerText = "Last Name";
      const thStateElement = document.createElement("td");
      thStateElement.innerText = "State";
      const thSalesYTDElement = document.createElement("td");
      thSalesYTDElement.innerText = "Sales YTD";
      const thprev_yr_sales = document.createElement("td");
      thprev_yr_sales.innerText = "Prev Years Sales";
      const thCreateButton = document.createElement("button");
      thCreateButton.colSpan = 2;
      thCreateButton.innerText = "Create Customer";

     
      const redirect_to_create_customer = () => {
        location.href = '/createcustomer';
      };
      thCreateButton.addEventListener("click", redirect_to_create_customer);

      // Add elements
      thRowElement.appendChild(thIdElement);
      thRowElement.appendChild(thFirstNameElement);
      thRowElement.appendChild(thLastNameElement);
      thRowElement.appendChild(thStateElement);
      thRowElement.appendChild(thSalesYTDElement);
      thRowElement.appendChild(thprev_yr_sales);
      thRowElement.appendChild(thCreateButton);
      theadElement.appendChild(thRowElement);
      tblElement.appendChild(theadElement);

     result.result.forEach(customer => {
        // Create table rows
        const trElement = document.createElement("tr");
        const tdIdElement = document.createElement("td");
        tdIdElement.innerText = customer.cusid;
        const tdFirstNameElement = document.createElement("td");
        tdFirstNameElement.innerText = customer.cusfname;
        const tdLastNameElement = document.createElement("td");
        tdLastNameElement.innerText = customer.cuslname;
        const tdStateElement = document.createElement("td");
        tdStateElement.innerText = customer.cusstate;
        const tdSalesYTDElement = document.createElement("td");
        tdSalesYTDElement.innerText = `${customer.cussalesytd}`;
        const tdprev_yr_sales = document.createElement("td");
        tdprev_yr_sales.innerText = `${customer.cussalesprev}`;
        const tdDeleteButton = document.createElement("button");
        tdDeleteButton.innerText = `Delete`;
        const tdEditButton = document.createElement("button");
        tdEditButton.innerText = `Edit`;

        // When delete is clicked
        const redirect_to_delete = () => {

          window.location.href = '/delete/' + customer.cusid;
        };
        tdDeleteButton.addEventListener("click", redirect_to_delete);

        // When edit is clicked
        const redirect_to_edit = () => {

          window.location.href = '/edit/' + customer.cusid;
        };
        tdEditButton.addEventListener("click", redirect_to_edit);

        // Add elements
        trElement.appendChild(tdIdElement);
        trElement.appendChild(tdFirstNameElement);
        trElement.appendChild(tdLastNameElement);
        trElement.appendChild(tdStateElement);
        trElement.appendChild(tdSalesYTDElement);
        trElement.appendChild(tdprev_yr_sales);
        trElement.appendChild(tdEditButton);
        trElement.appendChild(tdDeleteButton);
        //
        tblElement.appendChild(trElement);
      });
      
      divElement.appendChild(tblElement);
    };
  };
};

// Handle form submission
document.querySelector("form").addEventListener("submit", e => {
 
  e.preventDefault();

  const formData = new FormData(e.target);
  fetch("/managecustomer", {
    method: "POST",
    body: formData
  })
    .then(response => response.json())
    .then(result => {
      displayResults(result);
    })
    .catch(err => {
      console.error(err.message);
    });
});