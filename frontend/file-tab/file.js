document.addEventListener("DOMContentLoaded", () => {
    loadStudents();

    document.getElementById("deleteAll").addEventListener("click", deleteAllStudents);
    document.getElementById("exportExcel").addEventListener("click", exportToExcel);
});

// ✅ Supabase config (replace with your Supabase project URL and anon key)
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Load students
async function loadStudents() {
    try {
        const { data: students, error } = await supabase
            .from('students')
            .select('*');
        if (error) throw error;
        displayStudents(students);
    } catch (error) {
        console.error('Error loading students:', error);
        alert('Failed to load student data. Please check server connection.');
    }
}

// Display students
function displayStudents(students) {
    const studentList = document.getElementById("studentList");
    studentList.innerHTML = "";

    if (students.length === 0) {
        studentList.innerHTML = "<p class='no-data'>No student records found</p>";
        return;
    }

    students.forEach(student => {
        const studentItem = document.createElement("div");
        studentItem.classList.add("student-item");
        studentItem.innerHTML = `
            <span>${student.roll} - ${student.name}</span>
            <div class="student-buttons">
                <button class="view-btn" onclick="viewStudent(${student.id})">👁 View</button>
                <button class="delete-btn" onclick="deleteStudent(${student.id})">🗑 Delete</button>
                <button class="print-btn" onclick="printStudent(${student.id})">🖨 Print</button>
            </div>
        `;
        studentList.appendChild(studentItem);
    });
}

// Delete all
async function deleteAllStudents() {
    if (confirm("Are you sure you want to delete ALL student records?")) {
        try {
            const { error } = await supabase
                .from('students')
                .delete()
                .neq('id', 0); // delete all where id != 0
            if (error) throw error;
            alert('All student records deleted');
            loadStudents();
        } catch (error) {
            console.error('Error deleting students:', error);
            alert('Failed to delete student records');
        }
    }
}

// Delete one student
async function deleteStudent(id) {
    if (confirm("Delete this student record?")) {
        try {
            const { error } = await supabase
                .from('students')
                .delete()
                .eq('id', id);
            if (error) throw error;
            loadStudents();
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    }
}

// View student details
async function viewStudent(id) {
    try {
        const { data: student, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !student) throw new Error("Student not found");

        const modal = document.createElement('div');
        modal.className = 'student-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <h2>Student Details</h2>
                <div class="student-preview">
                    <div class="preview-photo">
                        <img src="${student.photo_url}" alt="Student Photo">
                    </div>
                    <div class="preview-details">
                        <p><strong>Roll:</strong> ${student.roll}</p>
                        <p><strong>Name:</strong> ${student.name}</p>
                        <p><strong>Father's Name:</strong> ${student.fathername}</p>
                        <p><strong>Course:</strong> ${student.course}</p>
                        <p><strong>Blood Group:</strong> ${student.blood_group}</p>
                        <p><strong>Contact:</strong> ${student.contact_number}</p>
                        <p><strong>Issue Date:</strong> ${student.issue_date}</p>
                        <p><strong>Session:</strong> ${student.session}</p>
                    </div>
                </div>
                <div class="signature-preview">
                    <img src="${student.signature_url}" alt="Signature">
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close-button').onclick = () => document.body.removeChild(modal);

    } catch (error) {
        console.error('Error viewing student:', error);
        alert('Failed to load student details');
    }
}

// Print student
async function printStudent(id) {
    try {
        const { data: student, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !student) throw new Error("Student not found");

        const idCard = `
            <div class="id-card-section">
                <div class="id-header">
                    <img src="../image/BClogo.png" alt="College Logo">
                    <div>
                        <h2>BAHONA COLLEGE</h2>
                        <h3>বাহনা মহাবিদ্যালয়</h3>
                        <p>Affiliated to Dibrugarh University <br> PO: Bahona, Jorhat, Assam - 785101</p>
                    </div>
                    <span>SESSION<br>${student.session}</span>
                </div>
                <div class="id-body">
                    <div class="photo-date-section">
                        <img class="id-photo" src="${student.photo_url}" alt="Photo">
                        <div class="issue-date">
                            <strong>Date of Issue:</strong> ${student.issue_date}
                        </div>
                    </div>
                    <div class="details">
                        <p><strong>Roll:</strong> ${student.roll}</p>
                        <p><strong>Name:</strong> ${student.name}</p>
                        <p><strong>Father:</strong> ${student.fathername}</p>
                        <p><strong>Course:</strong> ${student.course}</p>
                        <p><strong>Blood:</strong> ${student.blood_group}</p>
                        <p><strong>Contact:</strong> ${student.contact_number}</p>
                    </div>
                </div>
                <div class="footer-line">
                    <div class="signature-st">
                        <img src="${student.signature_url}" alt="Signature">
                        <p>Signature of Holder</p>
                    </div>
                </div>
            </div>
        `;

        const original = document.body.innerHTML;
        document.body.innerHTML = `<div style="width:86mm;height:54mm;margin:auto;">${idCard}</div>`;

        // JsBarcode("#barcode", student.roll, { format: "CODE128", displayValue: false, width: 2, height: 40 });

        window.print();
        document.body.innerHTML = original;
    } catch (error) {
        console.error('Error printing student:', error);
    }
}

// Export to Excel
async function exportToExcel() {
    try {
        const { data: students, error } = await supabase
            .from('students')
            .select('*');
        if (error) throw error;
        if (students.length === 0) {
            alert("No student records to export");
            return;
        }

        const studentData = students.map(student => ({
            "Roll Number": student.roll,
            "Name": student.name,
            "Father": student.fathername,
            "Course": student.course,
            "Blood Group": student.blood_group,
            "Contact": student.contact_number,
            "Issue Date": student.issue_date,
            "Session": student.session
        }));

        const worksheet = XLSX.utils.json_to_sheet(studentData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
        XLSX.writeFile(workbook, "students.xlsx");

    } catch (error) {
        console.error('Error exporting:', error);
    }
}
