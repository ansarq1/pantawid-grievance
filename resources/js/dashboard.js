import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
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

function fetchCertificates() {
    const loadingOverlay = document.getElementById("loading-overlay");
    const searchBar = document.getElementById("search-bar");
    const pageSize = 5; // Number of certificates per page
    let currentPage = 1; // Start on the first page
    let certificates = []; // Store fetched certificates

    // Show the loading overlay
    loadingOverlay.style.display = "flex";

    // Function to display certificates based on the current page
    function displayCertificates(filteredCertificates) {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedCertificates = filteredCertificates.slice(startIndex, endIndex);

        const certificatesTbody = document.getElementById("certificates-tbody");
        certificatesTbody.innerHTML = ""; // Clear existing rows

        if (paginatedCertificates.length === 0) {
            certificatesTbody.innerHTML = `<tr><td colspan="6">No Certificates Generated</td></tr>`;
        } else {
            try {
                paginatedCertificates.forEach((certificate, index) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${startIndex + index + 1}</td>
                        <td>${certificate.attendingOfficer || "N/A"}</td>
                        <td>${certificate.nameOfClient || "N/A"}</td>
                        <td>${certificate.dateGenerated || "N/A"}</td>
                        <td>${certificate.timeStamp || "N/A"}</td>
                        <td>${certificate.typeOfCertificate || "N/A"}</td>
                    `;
                    row.addEventListener("click", () => showCertificateDetails(certificate));
                    certificatesTbody.appendChild(row);
                });

                // Update pagination controls
                document.getElementById("pageIndicator").textContent = `Page ${currentPage}`;
                document.getElementById("prevPage").disabled = currentPage === 1;
                document.getElementById("nextPage").disabled = endIndex >= filteredCertificates.length;
            } catch (error) {
                console.error("Error displaying certificates:", error);
                alert("Error displaying certificates. Please try again.");
            }
        }
    }

    // Fetch certificates from Firestore
    try {
        onSnapshot(collection(db, "Generated Certificates"), (snapshot) => {
            certificates = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Sort certificates by dateGenerated in descending order
            certificates.sort((a, b) => new Date(b.dateGenerated) - new Date(a.dateGenerated));

            // Initial display of certificates
            displayCertificates(certificates);

            // Hide the loading overlay after rendering
            loadingOverlay.style.display = "none";

            // Add search functionality
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
                currentPage = 1; // Reset to the first page on new search
                displayCertificates(filteredCertificates);
            });
        });
    } catch (error) {
        console.error("Error fetching certificates:", error);
        alert("Failed to fetch certificates. Please try again.");
        loadingOverlay.style.display = "none"; // Ensure it's hidden on error
    }

    // Pagination controls
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
        <p><strong>Address:</strong> ${certificate.address}</p>
        <p><strong>Attending Officer:</strong> ${certificate.attendingOfficer}</p>
        <p><strong>Date Generated:</strong> ${certificate.dateGenerated}, ${certificate.timeStamp}</p>
        <p><strong>Type of Certificate:</strong> ${certificate.typeOfCertificate}</p>
        <p><strong>Name Of Grantee:</strong> ${certificate.granteeName}</p>
        <p><strong>Address of Grantee:</strong> ${certificate.granteeAddress}</p>
        <p><strong>Household ID:</strong> ${certificate.philhealthHouseholdID}</p>
        <p><strong>Nature of Relationship:</strong> ${certificate.natureOfRelationShip}</p>

    `;
    } else if (certificate.typeOfCertificate === 'Active Status'){
        detailsContainer.innerHTML = `
        <p><strong>Client Name:</strong> ${certificate.nameOfClient}</p>
        <p><strong>Attending Officer:</strong> ${certificate.attendingOfficer}</p>
        <p><strong>Date Generated:</strong> ${certificate.dateGenerated}, ${certificate.timeStamp}</p>
        <p><strong>Type of Certificate:</strong> ${certificate.typeOfCertificate}</p>
        <p><strong>Household ID:</strong> ${certificate.activeStatusHouseholdID}</p>
    `;
    } else if (certificate.typeOfCertificate === 'Non 4ps'){
        detailsContainer.innerHTML = `
        <p><strong>Client Name:</strong> ${certificate.nameOfClient}</p>
        <p><strong>Attending Officer:</strong> ${certificate.attendingOfficer}</p>
        <p><strong>Date Generated:</strong> ${certificate.dateGenerated}, ${certificate.timeStamp}</p>
        <p><strong>Type of Certificate:</strong> ${certificate.typeOfCertificate}</p>
        <p><strong>Birthday:</strong> ${certificate.birthday}</p>
    `;
    }
    const modal = new bootstrap.Modal(document.getElementById("Modal"), {
        keyboard: false,
    });
    modal.show();
}

document.getElementById("generateReportBtn").addEventListener("click", generateEnhancedReport);

async function generateEnhancedReport() {
    const certificatesSnapshot = await getDocs(collection(db, "Generated Certificates"));
    const allCertificates = certificatesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));

    const reportData = allCertificates.map((certificate, index) => [
        index + 1,
        certificate.attendingOfficer || "N/A",
        certificate.nameOfClient || "N/A",
        certificate.birthday || "N/A",
        certificate.dateGenerated || "N/A",
        certificate.timeStamp || "N/A",
        certificate.typeOfCertificate || "N/A",
        certificate.address || "N/A",
        certificate.granteeName || "N/A",
        certificate.granteeAddress || "N/A",
        certificate.natureOfRelationShip || "N/A",
        certificate.philhealthHouseholdID || "N/A",
        certificate.activeStatusHouseholdID || "N/A",
    ]);

    const headers = [
        ["Generated Certificates Report"],
        ["Generated on: " + new Date().toLocaleString()],
        [],
        ["#", "Attending Officer", "Client Name", "Birthday", "Date Generated", "Time Stamp", "Type of Certificate", "Address", "Grantee Name", "Grantee Address", "Nature of Relationship", "Philhealth Household ID", "Active Status Household ID"],
    ];

    const combinedData = [...headers, ...reportData];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(combinedData);

    // Auto-adjust column widths
    const maxLengths = combinedData.reduce((acc, row) => {
        row.forEach((cell, colIdx) => {
            acc[colIdx] = Math.max(acc[colIdx] || 0, (cell ? cell.toString().length : 0));
        });
        return acc;
    }, []);
    worksheet["!cols"] = maxLengths.map((len) => ({ wch: Math.min(30, len + 5) }));

    // Merge and style the title
    worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }];
    if (!worksheet["A1"]) worksheet["A1"] = {}; // Initialize cell if undefined
    worksheet["A1"].s = {
        font: { bold: true, sz: 24, color: { rgb: "333333" } },
        alignment: { horizontal: "center", vertical: "center" },
    };

    // Style the headers
    const headerRowIndex = 3;
    for (let col = 0; col <= 11; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
        if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
        worksheet[cellAddress].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4F81BD" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } },
            },
        };
    }

    // Add zebra striping for rows
    for (let row = 4; row < combinedData.length; row++) {
        const isEvenRow = row % 2 === 0;
        for (let col = 0; col <= 11; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
            worksheet[cellAddress].s = {
                font: { name: "Calibri", sz: 11 },
                alignment: { horizontal: col === 0 ? "right" : "left" },
                fill: isEvenRow ? { fgColor: { rgb: "F9F9F9" } } : undefined,
                border: {
                    top: { style: "thin", color: { rgb: "CCCCCC" } },
                    bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                    left: { style: "thin", color: { rgb: "CCCCCC" } },
                    right: { style: "thin", color: { rgb: "CCCCCC" } },
                },
            };
        }
    }

    // Format date columns
    const dateColumns = [3, 4, 5]; // Adjust indexes for date columns
    for (let row = 4; row < combinedData.length; row++) {
        dateColumns.forEach((col) => {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            if (worksheet[cellAddress] && worksheet[cellAddress].v !== "N/A") {
                worksheet[cellAddress].z = "mm/dd/yyyy"; // Date format
            }
        });
    }

    // Freeze the header row
    worksheet["!freeze"] = { xSplit: 0, ySplit: 4 };

    // Enable filters on headers
    worksheet["!autofilter"] = { ref: "A4:M4" };

    // Add the sheet and save the file
    XLSX.utils.book_append_sheet(workbook, worksheet, "Generated Certificates");
    XLSX.writeFile(workbook, `GeneratedCertificatesReport_${Date.now()}.xlsx`);
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