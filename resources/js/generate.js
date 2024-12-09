import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, addDoc, collection } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";

function showForm(certificateType) {
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

    const welcomeEmail = document.getElementById('welcome-email');
    const generateBtn = document.getElementById('generate-button')
    const logoutBtn = document.getElementById('logout-btn');
    const date = new Date();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[date.getMonth()];
    const day = date.getDay();
    const year = date.getFullYear();
    let hours = date.getHours();
    let amPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes} ${amPm}`;


    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
        if (user) {
            welcomeEmail.innerText = user.email;
        } else {
            window.location.href = "index.html";  // Redirect to login page if not authenticated
        }
    });

    // Logout functionality
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            sessionStorage.removeItem("isLoggedIn");
            window.location.href = "index.html";
        } catch (error) {
            console.error("Error during sign-out:", error);
        }
    });

    function setCertificateType(type) {
        certificateType = type;  // Update the global variable
        document.getElementById('formTitle').innerText = `Generate ${type}`;
    }


    generateBtn.addEventListener('click', async function uploadCertificateDetails() {

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const docRef = await addDoc(collection(db, "Generated Certificates"), {
                        typeOfCertificate: certificateType,
                        dateGenerated: `${month} ${day}, ${year}`,
                        timeStamp: currentTime,
                        attendingOfficer: user.email,
                        nameOfClient: document.getElementById('full-name').value,
                        address: document.getElementById('address').value,
                        birthday: document.getElementById('birthdate').value,
                        granteeName: document.getElementById('name-of-grantee-field')?.value || "",
                        granteeAddress: document.getElementById('address-of-grantee-field')?.value || "",
                        householdID: document.getElementById('hhid-philhealth-field')?.value || ""
                    });
                    console.log("Document successfully added with ID: ", docRef.id);
                } catch (error) {
                    console.error("Error adding document: ", error);
                }
            } else {
                console.error("User is not authenticated.");
            }
        });
    });

    const formTitle = document.getElementById("formTitle");
    const birthdateField = document.getElementById('birthdate-field');
    const natureOfRelationShip = document.getElementById('natureOfRelationship');
    const nameOfGrantee = document.getElementById('name-of-grantee');
    const addressOfGrantee = document.getElementById('address-of-grantee');
    const hhIdPhilHealth = document.getElementById('hh-id-philhealth');
    const hhIdActiveStatus = document.getElementById('hh-id-active-status');
    const dropdownButton = document.getElementById("mainDropDown");

    birthdateField.style.display = 'block';
    natureOfRelationShip.innerHTML = '';
    nameOfGrantee.innerHTML = '';
    addressOfGrantee.innerHTML = '';
    hhIdPhilHealth.innerHTML = '';
    hhIdActiveStatus.innerHTML = '';

    if (certificateType === "non_4ps") {
        formTitle.textContent = "Generate Non 4P's Certificate";
        dropdownButton.textContent = "Non 4P's Certificate";
    } else if (certificateType === "philhealth") {
        formTitle.textContent = "Generate Philhealth Certificate";
        dropdownButton.textContent = "Philhealth Certificate";
        nameOfGrantee.innerHTML = `
            <label for="name-of-grantee-field" class="form-label">Name of Grantee:</label>
            <input type="text" class="form-control" id="name-of-grantee-field" placeholder="Enter Name of Grantee" required>
        `;
        natureOfRelationShip.innerHTML = `
            <label for="relationship-select" class="form-label">Nature of Relationship:</label>
            <select class="form-select" id="relationship-select" onchange="updateDropdownButton(this)">
                <option value="" disabled selected>Select Relationship</option>
                <option value="son-of-the-grantee">Son of the Grantee</option>
                <option value="grandson-of-the-grantee">Grandson of the Grantee</option>
                <option value="son-in-law-of-the-grantee">Son-in-law of the Grantee</option>
                <option value="daughter-of-the-grantee">Daughter of the Grantee</option>
                <option value="daughter-in-law-of-the-grantee">Daughter-in-law of the Grantee</option>
                <option value="husband-of-the-grantee">Husband of the Grantee</option>
                <option value="wife-of-the-grantee">Wife of the Grantee</option>
                <option value="grantee-himself">Grantee Himself</option>
                <option value="grantee-herself">Grantee Herself</option>
            </select>
        `;
        addressOfGrantee.innerHTML = `
            <label for="address-of-grantee-field" class="form-label">Address of Grantee:</label>
            <input type="text" class="form-control" id="address-of-grantee-field" placeholder="Enter Address of Grantee" required>
        `;
        hhIdPhilHealth.innerHTML = `
            <label for="hhid-philhealth-field" class="form-label">Household ID Number</label>
            <input type="number" class="form-control" id="hhid-philhealth-field" placeholder="Enter Household ID Number" required>
        `;
    } else if (certificateType === "active_status") {
        formTitle.textContent = "Generate Active Status Certificate";
        dropdownButton.textContent = "Active Status Certificate";
        birthdateField.style.display = 'none';
        hhIdActiveStatus.innerHTML = `
            <label for="hhid-active-status-field" class="form-label">Household ID Number</label>
            <input type="number" class="form-control" id="hhid-active-status-field" placeholder="Enter Household ID Number" required>
        `;
    } else if (certificateType === "one_same") {
        formTitle.textContent = "Generate One & Same Certificate";
        dropdownButton.textContent = "One & Same Certificate";
    }
}

function updateDropdownButton(selectElement) {
    const dropdownButton = document.getElementById("dropdownMenuButton");
    dropdownButton.textContent = selectElement.options[selectElement.selectedIndex].text;
}

function saveData() {
    const fullName = document.getElementById("full-name").value;
    const address = document.getElementById("address").value;
    const birthdate = document.getElementById("birthdate").value;
    const certificateType = document.getElementById("formTitle").textContent;


    localStorage.setItem("fullName", fullName);
    localStorage.setItem("address", address);
    localStorage.setItem("birthdate", birthdate);

    if (certificateType.includes("Philhealth")) {
        const nameOfGrantee = document.getElementById('name-of-grantee-field').value;
        const addressOfGrantee = document.getElementById("address-of-grantee-field").value;
        const hhIdPhilHealth = document.getElementById("hhid-philhealth-field").value;
        localStorage.setItem("nameOfGrantee", nameOfGrantee);
        localStorage.setItem("addressOfGrantee", addressOfGrantee);
        localStorage.setItem("hhIdPhilHealth", hhIdPhilHealth);

        window.open('philhealth.html', '_blank');
    } else if (certificateType.includes("Active Status")) {
        const hhIdActiveStatus = document.getElementById("hhid-active-status-field").value;
        localStorage.setItem("hhIdActiveStatus", hhIdActiveStatus);
        window.open('active_status.html', '_blank');
    } else{
        window.open('non_4ps.html', '_blank');
    }
}

    const isLoggedIn = sessionStorage.getItem('isLoggedIn');

    if (!isLoggedIn) {
        window.location.replace("index.html");
    }
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (event) => {
                const certType = event.currentTarget.getAttribute('data-cert');
                showForm(certType);
            });
        });
    });
    
    window.saveData = saveData;
    window.showForm = showForm;