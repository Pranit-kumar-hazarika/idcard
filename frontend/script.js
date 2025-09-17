document.addEventListener("DOMContentLoaded", () => {
    const rollInput = document.getElementById("roll");
    const nameInput = document.getElementById("name");
    const fathernameInput = document.getElementById("fathername");
    const courseInput = document.getElementById("course");
    const bloodGroupInput = document.getElementById("blood-group");
    const contactNumberInput = document.getElementById("contact-number");
    const issueDateInput = document.getElementById("issue-date");
    const photoInput = document.getElementById("photo");
    const signatureInput = document.getElementById("signature");
    const sessionInput = document.getElementById("sessionInput");

    const idRoll = document.getElementById("id-roll");
    const idName = document.getElementById("id-name");
    const idFathername = document.getElementById("id-fathername");
    const idCourse = document.getElementById("id-course");
    const idBloodGroup = document.getElementById("id-blood-group");
    const idContactNumber = document.getElementById("id-contact-number");
    const idIssueDate = document.getElementById("id-issue-date");
    const idPhoto = document.getElementById("id-photo");
    const signatureHolder = document.getElementById("signature-holder");
    const barcode = document.getElementById("barcode");
    const idSession = document.getElementById("id-session");

    const generateBtn = document.getElementById("generate");
    const resetBtn = document.getElementById("reset");
    const printBtn = document.getElementById("print");

    // ✅ Supabase config (replace with your Supabase project URL and anon key)
    const SUPABASE_URL = "https://kocwiefydcexvnakstwr.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvY3dpZWZ5ZGNleHZuYWtzdHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjU5MDMsImV4cCI6MjA3MzcwMTkwM30.gfSxJivYrDQP557bnlUeaAFOGOPzbXQbTHZSuTkRmiI";
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


    // Generate ID Card
    generateBtn.addEventListener("click", () => {
        if (
            rollInput.value.trim() === "" ||
            nameInput.value.trim() === "" ||
            fathernameInput.value.trim() === "" ||
            courseInput.value.trim() === "" ||
            bloodGroupInput.value.trim() === "" ||
            contactNumberInput.value.trim() === "" ||
            issueDateInput.value.trim() === "" ||
            sessionInput.value.trim() === ""
        ) {
            alert("Please fill in all the fields!");
            return;
        }

        if (!/^\d{10}$/.test(contactNumberInput.value.trim())) {
            alert("Please enter a valid 10-digit contact number.");
            return;
        }

        // Update ID Card preview
        idRoll.textContent = rollInput.value;
        idName.textContent = nameInput.value;
        idFathername.textContent = fathernameInput.value;
        idCourse.textContent = courseInput.value;
        idBloodGroup.textContent = bloodGroupInput.value;
        idContactNumber.textContent = contactNumberInput.value;
        idIssueDate.textContent = issueDateInput.value;
        idSession.innerHTML = `SESSION<br>${sessionInput.value.trim()}`;

        // Handle Photo
        if (photoInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                idPhoto.src = e.target.result;
            };
            reader.readAsDataURL(photoInput.files[0]);
        } else {
            idPhoto.src = "image/default-photo.png";
        }

        // Handle Signature
        if (signatureInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                signatureHolder.src = e.target.result;
                generateBarcode(rollInput.value);
            };
            reader.readAsDataURL(signatureInput.files[0]);
        } else {
            signatureHolder.src = "image/default-signature.png";
            generateBarcode(rollInput.value);
        }
    });

    // Generate Barcode
    function generateBarcode(roll) {
        try {
            JsBarcode(barcode, roll, {
                format: "CODE128",
                displayValue: false,
                width: 2,
                height: 40,
            });
        } catch (error) {
            console.error("Error generating barcode:", error);
        }
    }

    // Reset Form
    resetBtn.addEventListener("click", () => {
        rollInput.value = "";
        nameInput.value = "";
        fathernameInput.value = "";
        courseInput.value = "";
        bloodGroupInput.value = "";
        contactNumberInput.value = "";
        issueDateInput.value = "";
        sessionInput.value = "";
        photoInput.value = null;
        signatureInput.value = null;

        idRoll.textContent = "XXXXX";
        idName.textContent = "XXXXX";
        idFathername.textContent = "XXXXX";
        idCourse.textContent = "XXXXX";
        idBloodGroup.textContent = "XXXXX";
        idContactNumber.textContent = "XXXXX";
        idIssueDate.textContent = "XX-XX-XXXX";
        idSession.innerHTML = "SESSION<br>YYYY-YY";
        idPhoto.src = "image/default-photo.png";
        signatureHolder.src = "image/default-signature.png";
        barcode.innerHTML = "";
    });

    // Helper: Upload file to Supabase Storage and return public URL
    async function uploadToSupabaseStorage(fileBase64, path) {
        if (!fileBase64 || !fileBase64.startsWith("data:")) return null;
        // Convert base64 to Blob
        const res = await fetch(fileBase64);
        const blob = await res.blob();
        // Remove if file already exists (optional, for overwrite)
        await supabaseClient.storage.from('students').remove([path]);
        // Upload
        const { error } = await supabaseClient.storage.from('students').upload(path, blob, {
            cacheControl: '3600',
            upsert: true,
            contentType: blob.type
        });
        if (error) throw error;
        // Get public URL
        const { publicURL } = supabaseClient.storage.from('students').getPublicUrl(path).data;
        return publicURL;
    }

    // Print and Save Data to Database
    printBtn.addEventListener("click", async () => {
        const roll = rollInput.value.trim();
        const name = nameInput.value.trim();
        const fathername = fathernameInput.value.trim();
        const course = courseInput.value.trim();
        const bloodGroup = bloodGroupInput.value.trim();
        const contactNumber = contactNumberInput.value.trim();
        const issueDate = issueDateInput.value.trim();
        const session = sessionInput.value.trim();

        if (!roll || !name || !fathername || !course ||
            !bloodGroup || !contactNumber || !issueDate || !session) {
            alert("Please fill in all fields before printing!");
            return;
        }

        // Get base64 data for photo and signature
        const photoBase64 = idPhoto.src;
        const signatureBase64 = signatureHolder.src;

        try {
            // Upload images to Supabase Storage
            let photo_url = null, signature_url = null;
            if (photoBase64 && !photoBase64.includes("default-photo.png")) {
                photo_url = await uploadToSupabaseStorage(photoBase64, `${roll}-photo.png`);
            }
            if (signatureBase64 && !signatureBase64.includes("default-signature.png")) {
                signature_url = await uploadToSupabaseStorage(signatureBase64, `${roll}-sign.png`);
            }

            // Insert student data into Supabase
            const { error } = await supabaseClient.from('students').insert([{
                roll,
                name,
                fathername,
                course,
                blood_group: bloodGroup,
                contact_number: contactNumber,
                issue_date: issueDate,
                session,
                photo_url,
                signature_url
            }]);
            if (error) throw error;

            // Print
            const printContent = document.querySelector(".id-card-section").outerHTML;
            const originalContent = document.body.innerHTML;

            document.body.innerHTML = `<div style="width: 86mm; height: 54mm; margin: auto;">${printContent}</div>`;
            window.print();
            document.body.innerHTML = originalContent;

            setTimeout(() => { window.location.reload(); }, 500);

        } catch (error) {
            alert(`Error: ${error.message}`);
            console.error('Error saving student data:', error);
        }
    });

    // Make sure to include Supabase JS client in your HTML:
    // <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
});

const navToggle = document.getElementById('nav-toggle');
const navRight = document.getElementById('nav-right');

navToggle.addEventListener('click', () => {
  navRight.classList.toggle('show');
});
