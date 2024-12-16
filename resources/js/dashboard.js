import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDRY1huushmEJq_ubTq6BtGpEwcljiqBH4",
    authDomain: "pantawid-certificate-generator.firebaseapp.com",
    projectId: "pantawid-certificate-generator",
    storageBucket: "pantawid-certificate-generator.firebasestorage.app",
    messagingSenderId: "877266176105",
    appId: "1:877266176105:web:1d0140f22085bbdb1b3af8",
    measurementId: "G-DJ246MXQSS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Authentication state listener
onAuthStateChanged(auth, (user) => {
    const username = document.getElementById('username');
    if (user) {
        username.innerText = user.email;
    } else {
        window.location.href = "index.html"; // Redirect to login page if not authenticated
    }
});

// Count total generated certificates
async function countTotalGeneratedCertificates() {
    const generatedCertificatesCollection = collection(db, "Generated Certificates");
    onSnapshot(generatedCertificatesCollection, (snapshot) => {
        document.getElementById("certificateCount").textContent = snapshot.size;
    });
}

// Fetch and display certificates
function fetchCertificates() {
    const searchBar = document.getElementById("search-bar");
    const pageSize = 5; // Number of certificates per page
    let currentPage = 1; // Start on the first page
    let certificates = []; // Store fetched certificates

    // Function to display certificates based on the current page
    function displayCertificates(filteredCertificates) {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedCertificates = filteredCertificates.slice(startIndex, endIndex);

        const certificatesTbody = document.getElementById("certificates-tbody");
        certificatesTbody.innerHTML = "";
        paginatedCertificates.forEach((certificate, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${startIndex + index + 1}</td>
                <td>${certificate.attendingOfficer}</td>
                <td>${certificate.nameOfClient}</td>
                <td>${certificate.dateGenerated}</td>
                <td>${certificate.timeStamp}</td>
                <td>${certificate.typeOfCertificate}</td>
            `;
            row.addEventListener("click", () => showCertificateDetails(certificate));
            certificatesTbody.appendChild(row);
        });

        // Update pagination controls
        document.getElementById("pageIndicator").textContent = `Page ${currentPage}`;
        document.getElementById("prevPage").disabled = currentPage === 1;
        document.getElementById("nextPage").disabled = endIndex >= filteredCertificates.length;
    }

    onSnapshot(collection(db, "Generated Certificates"), (snapshot) => {
        certificates = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Initial display of certificates for the first page
        displayCertificates(certificates);

        // Filter certificates on search
        searchBar.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredCertificates = certificates.filter((certificate) =>
                (certificate.nameOfClient &&
                    certificate.nameOfClient.toLowerCase().includes(searchTerm)) ||
                (certificate.attendingOfficer &&
                    certificate.attendingOfficer.toLowerCase().includes(searchTerm)) ||
                (certificate.typeOfCertificate &&
                    certificate.typeOfCertificate.toLowerCase().includes(searchTerm))
            );
            currentPage = 1; // Reset to first page on new search
            displayCertificates(filteredCertificates);
        });
    });

    // Pagination control event listeners
    document.getElementById("prevPage").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            displayCertificates(certificates);
        }
    });

    document.getElementById("nextPage").addEventListener("click", () => {
        const totalPageCount = Math.ceil(certificates.length / pageSize);
        if (currentPage < totalPageCount) {
            currentPage++;
            displayCertificates(certificates);
        }
    });
}

// Show certificate details in a modal
function showCertificateDetails(certificate) {
    const detailsContainer = document.getElementById('certificate-details');
    if (certificate.typeOfCertificate === 'Philhealth') {
        detailsContainer.innerHTML = `
        <p><strong>Client Name:</strong> ${certificate.nameOfClient}</p>
        <p><strong>Attending Officer:</strong> ${certificate.attendingOfficer}</p>
        <p><strong>Date Generated:</strong> ${certificate.dateGenerated}, ${certificate.timeStamp}</p>
        <p><strong>Type of Certificate:</strong> ${certificate.typeOfCertificate}</p>
        <p><strong>Name Of Grantee:</strong> ${certificate.granteeName}</p>
        <p><strong>Address of Grantee:</strong> ${certificate.granteeAddress}</p>
        <p><strong>Household ID:</strong> ${certificate.householdID}</p>
        <p><strong>Nature of Relationship:</strong> ${certificate.natureOfRelationShip}</p>

    `;
    } else if(certificate.typeOfCertificate === 'Active Status'){
        detailsContainer.innerHTML = `
        <p><strong>Client Name:</strong> ${certificate.nameOfClient}</p>
        <p><strong>Attending Officer:</strong> ${certificate.attendingOfficer}</p>
        <p><strong>Date Generated:</strong> ${certificate.dateGenerated}, ${certificate.timeStamp}</p>
        <p><strong>Type of Certificate:</strong> ${certificate.typeOfCertificate}</p>
        <p><strong>Household ID:</strong> ${certificate.activeStatusHouseholdID}</p>
    `;
    } else if(certificate.typeOfCertificate === 'Non 4ps'){
        detailsContainer.innerHTML = `
        <p><strong>Client Name:</strong> ${certificate.nameOfClient}</p>
        <p><strong>Attending Officer:</strong> ${certificate.attendingOfficer}</p>
        <p><strong>Date Generated:</strong> ${certificate.dateGenerated}, ${certificate.timeStamp}</p>
        <p><strong>Type of Certificate:</strong> ${certificate.typeOfCertificate}</p>
        <p><strong>Household ID:</strong> ${certificate.birthday}</p>
    `;
    }
    const modal = new bootstrap.Modal(document.getElementById("Modal"), {
        keyboard: false,
    });
    modal.show();
}

// Logout functionality
const logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        sessionStorage.removeItem("isLoggedIn");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error during sign-out:", error);
    }
});

// Check if the user is logged in
const isLoggedIn = sessionStorage.getItem('isLoggedIn');
if (!isLoggedIn) {
    window.location.replace("index.html");
}

// Call the necessary functions
fetchCertificates();
countTotalGeneratedCertificates();
