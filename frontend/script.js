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


    // Helper: Upload file to Supabase Storage
    async function uploadFile(file, path) {
        if (!file) return null;

        const { data, error } = await supabaseClient.storage
            .from("students")
            .upload(path, file, { upsert: true });

        if (error) throw error;

        const { publicURL } = supabaseClient.storage.from("students").getPublicUrl(path).data;
        return publicURL;
    }

    // Generate button
    generateBtn.addEventListener("click", () => {
        if (
            !rollInput.value || !nameInput.value || !fathernameInput.value ||
            !courseInput.value || !bloodGroupInput.value || !contactNumberInput.value ||
            !issueDateInput.value || !sessionInput.value
        ) {
            alert("Please fill in all the fields!");
            return;
        }

        if (!/^\d{10}$/.test(contactNumberInput.value)) {
            alert("Please enter a valid 10-digit contact number.");
            return;
        }

        idRoll.textContent = rollInput.value;
        idName.textContent = nameInput.value;
        idFathername.textContent = fathernameInput.value;
        idCourse.textContent = courseInput.value;
        idBloodGroup.textContent = bloodGroupInput.value;
        idContactNumber.textContent = contactNumberInput.value;
        idIssueDate.textContent = issueDateInput.value;
        idSession.innerHTML = `SESSION<br>${sessionInput.value}`;

        if (photoInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = e => idPhoto.src = e.target.result;
            reader.readAsDataURL(photoInput.files[0]);
        } else idPhoto.src = "image/default-photo.png";

        if (signatureInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = e => {
                signatureHolder.src = e.target.result;
                generateBarcode(rollInput.value);
            };
            reader.readAsDataURL(signatureInput.files[0]);
        } else {
            signatureHolder.src = "image/default-signature.png";
            generateBarcode(rollInput.value);
        }
    });

    // Reset button
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

    // Barcode
    function generateBarcode(roll) {
        JsBarcode(barcode, roll, { format: "CODE128", displayValue: false, width: 2, height: 40 });
    }

    // Print and save
    printBtn.addEventListener("click", async () => {
        try {
            if (!rollInput.value || !nameInput.value) {
                alert("Please fill all fields before printing!");
                return;
            }

            const photoFile = photoInput.files[0] || null;
            const signFile = signatureInput.files[0] || null;

            const photo_url = photoFile ? await uploadFile(photoFile, `${rollInput.value}-photo.png`) : null;
            const signature_url = signFile ? await uploadFile(signFile, `${rollInput.value}-sign.png`) : null;

            const { error } = await supabaseClient.from("students").insert([{
                roll: rollInput.value,
                name: nameInput.value,
                fathername: fathernameInput.value,
                course: courseInput.value,
                blood_group: bloodGroupInput.value,
                contact_number: contactNumberInput.value,
                issue_date: issueDateInput.value,
                session: sessionInput.value,
                photo_url,
                signature_url
            }]);
            if (error) throw error;

            // Print ID card
            const printContent = document.querySelector(".id-card-section").outerHTML;
            const originalContent = document.body.innerHTML;
            document.body.innerHTML = `<div style="width: 86mm; height: 54mm; margin: auto;">${printContent}</div>`;
            window.print();
            document.body.innerHTML = originalContent;
            setTimeout(() => window.location.reload(), 500);

        } catch (err) {
            console.error(err);
            alert("Error saving student: " + err.message);
        }
    });
});