document.addEventListener("DOMContentLoaded", () => {
    loadStudents();

    document.getElementById("deleteAll").addEventListener("click", deleteAllStudents);
    document.getElementById("exportExcel").addEventListener("click", exportToExcel);
});

// ✅ Backend API URL
const API_URL = "https://idcard-pi6x.onrender.com/api";

// Load students
async function loadStudents() {
    try {
        const response = await fetch(`${API_URL}/students`);
        const students = await response.json();
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
            const response = await fetch(`${API_URL}/students`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete student records');
            const result = await response.json();
            alert(`Success: ${result.count} student records deleted`);
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
            await fetch(`${API_URL}/students/${id}`, { method: 'DELETE' });
            loadStudents();
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    }
}

// View student details
async function viewStudent(id) {
    try {
        const listResponse = await fetch(`${API_URL}/students`);
        const studentsList = await listResponse.json();
        const student = studentsList.find(s => s.id === id);
        if (!student) throw new Error("Student not found");

        const response = await fetch(`${API_URL}/students/roll/${student.roll}`);
        const studentDetails = await response.json();

        const modal = document.createElement('div');
        modal.className = 'student-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <h2>Student Details</h2>
                <div class="student-preview">
                    <div class="preview-photo">
                        <img src="${studentDetails.photo_url}" alt="Student Photo">
                    </div>
                    <div class="preview-details">
                        <p><strong>Roll:</strong> ${studentDetails.roll}</p>
                        <p><strong>Name:</strong> ${studentDetails.name}</p>
                        <p><strong>Father's Name:</strong> ${studentDetails.fathername}</p>
                        <p><strong>Course:</strong> ${studentDetails.course}</p>
                        <p><strong>Blood Group:</strong> ${studentDetails.blood_group}</p>
                        <p><strong>Contact:</strong> ${studentDetails.contact_number}</p>
                        <p><strong>Issue Date:</strong> ${studentDetails.issue_date}</p>
                        <p><strong>Session:</strong> ${studentDetails.session}</p>
                    </div>
                </div>
                <div class="signature-preview">
                    <img src="${studentDetails.signature_url}" alt="Signature">
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
        const listResponse = await fetch(`${API_URL}/students`);
        const studentsList = await listResponse.json();
        const student = studentsList.find(s => s.id === id);
        if (!student) throw new Error("Student not found");

        const response = await fetch(`${API_URL}/students/roll/${student.roll}`);
        const studentDetails = await response.json();

        const idCard = `
            <div class="id-card-section">
                <div class="id-header">
                    <img src="../image/BClogo.png" alt="College Logo">
                    <div>
                        <h2>BAHONA COLLEGE</h2>
                        <h3>বাহনা মহাবিদ্যালয়</h3>
                        <p>Affiliated to Dibrugarh University <br> PO: Bahona, Jorhat, Assam - 785101</p>
                    </div>
                    <span>SESSION<br>${studentDetails.session}</span>
                </div>
                <div class="id-body">
                    <div class="photo-date-section">
                        <img class="id-photo" src="${studentDetails.photo_url}" alt="Photo">
                        <div class="issue-date">
                            <strong>Date of Issue:</strong> ${studentDetails.issue_date}
                        </div>
                    </div>
                    <div class="details">
                        <p><strong>Roll:</strong> ${studentDetails.roll}</p>
                        <p><strong>Name:</strong> ${studentDetails.name}</p>
                        <p><strong>Father:</strong> ${studentDetails.fathername}</p>
                        <p><strong>Course:</strong> ${studentDetails.course}</p>
                        <p><strong>Blood:</strong> ${studentDetails.blood_group}</p>
                        <p><strong>Contact:</strong> ${studentDetails.contact_number}</p>
                    </div>
                </div>
                <div class="footer-line">
                    <div class="signature-st">
                        <img src="${studentDetails.signature_url}" alt="Signature">
                        <p>Signature of Holder</p>
                    </div>
                </div>
            </div>
        `;

        const original = document.body.innerHTML;
        document.body.innerHTML = `<div style="width:86mm;height:54mm;margin:auto;">${idCard}</div>`;

        JsBarcode("#barcode", studentDetails.roll, { format: "CODE128", displayValue: false, width: 2, height: 40 });

        window.print();
        document.body.innerHTML = original;
    } catch (error) {
        console.error('Error printing student:', error);
    }
}

// Export to Excel
async function exportToExcel() {
    try {
        const response = await fetch(`${API_URL}/students`);
        const students = await response.json();
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
    