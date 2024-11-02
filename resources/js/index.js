function generatePDF() {
    // Get user input values
    const name = document.getElementById("name").value;
    const message = document.getElementById("message").value;
  
    // Create an instance of jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
  
    // Add text to PDF based on user input
    doc.text("User Input PDF", 10, 10); // Title
    doc.text(`Name: ${name}`, 10, 20);  // Name input
    doc.text(`Message: ${message}`, 10, 30);  // Message input
  
    // Save the PDF with a custom name
    doc.save("UserInput.pdf");
}
  