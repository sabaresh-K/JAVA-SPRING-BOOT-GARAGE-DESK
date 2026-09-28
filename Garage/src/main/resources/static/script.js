// ==================== SETTINGS ====================

// Address of the Spring Boot backend
const BACKEND = "http://localhost:8080";

// Opened from the Spring Boot server itself (http://localhost:8080/)  ->  relative address.
// Opened from anywhere else (Live Server, IntelliJ preview, a file)   ->  full address.
const API = (location.protocol === "http:" && location.port === "8080")
    ? "/api"
    : BACKEND + "/api";

// Data loaded from the database (used by Edit and by the name lookups)
const data = { vehicles: [], mechanics: [], bays: [], jobCards: [], bills: [] };

// id of the row being edited for each form (null = the form is adding a new row)
const editing = { vehicles: null, mechanics: null, bays: null };

// Vehicles, mechanics and bays all work the same way, so they share the same
// save / edit / delete code. "fields" maps  database field -> input box id.
const ENTITIES = {
    vehicles: {
        name: "Vehicle",
        path: "/vehicles",
        fields: {
            registrationNumber: "vRegNo",
            make: "vMake",
            model: "vModel",
            ownerName: "vOwner",
            ownerPhone: "vPhone"
        },
        required: ["registrationNumber", "ownerName"],
        saveBtn: "vSaveBtn",
        cancelBtn: "vCancelBtn",
        reload: loadVehicles
    },
    mechanics: {
        name: "Mechanic",
        path: "/mechanics",
        fields: {
            name: "mName",
            phone: "mPhone",
            specialization: "mSpecialization"
        },
        required: ["name"],
        saveBtn: "mSaveBtn",
        cancelBtn: "mCancelBtn",
        reload: loadMechanics
    },
    bays: {
        name: "Bay",
        path: "/bays",
        fields: {
            bayNumber: "bBayNumber",
            description: "bDescription"
        },
        required: ["bayNumber"],
        saveBtn: "bSaveBtn",
        cancelBtn: "bCancelBtn",
        reload: loadBays
    }
};


// ==================== START ====================

document.addEventListener("DOMContentLoaded", function () {
    showTab("vehicles");
    loadAll();
});

function showTab(tabId) {
    const sections = document.querySelectorAll(".tab-section");
    for (let i = 0; i < sections.length; i++) {
        sections[i].classList.remove("active");
    }
    document.getElementById(tabId).classList.add("active");

    const buttons = document.querySelectorAll(".tabs button");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.toggle("active", buttons[i].getAttribute("data-tab") === tabId);
    }
}

// Load everything from the database. Vehicles, mechanics and bays come first because
// the job card table shows their names.
async function loadAll() {
    try {
        await Promise.all([loadVehicles(), loadMechanics(), loadBays()]);
        await Promise.all([loadJobCards(), loadBills()]);
        setStatus(true, "Connected. All changes are saved in the database (" + API + ")");
    } catch (err) {
        setStatus(false, err.message);
    }
}

function setStatus(ok, message) {
    const box = document.getElementById("status");
    box.textContent = message;
    box.className = "status " + (ok ? "ok" : "error");
}


// ==================== HELPERS ====================

function fail(err) {
    alert(err.message);
}

function esc(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function show(value) {
    if (value === null || value === undefined || value === "") {
        return "-";
    }
    return esc(value);
}

function val(id) {
    return document.getElementById(id).value.trim();
}

function setVal(id, value) {
    document.getElementById(id).value = (value === null || value === undefined) ? "" : value;
}

function fillSelect(id, optionsHtml, emptyText) {
    document.getElementById(id).innerHTML =
        optionsHtml !== "" ? optionsHtml : "<option value=''>" + emptyText + "</option>";
}

// Find the name of a vehicle / bay / mechanic from its id
function nameOf(list, id, field) {
    if (id === null || id === undefined) {
        return "-";
    }
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === id) {
            return esc(list[i][field]);
        }
    }
    return "#" + id + " (deleted)";
}

function actionButtons(key, id) {
    return "<td class='actions'>" +
        "<button onclick=\"editEntity('" + key + "', " + id + ")\">Edit</button>" +
        "<button class='danger' onclick=\"deleteEntity('" + key + "', " + id + ")\">Delete</button>" +
        "</td>";
}

// Every server call goes through here. A failed call (400, 500, server not reachable)
// throws an error with a readable message, so nothing fails silently.
async function request(url, options) {
    let res;
    try {
        res = await fetch(url, options);
    } catch (e) {
        throw new Error("Cannot reach the backend at " + API + ". Check that: " +
            "(1) the Spring Boot app is running, " +
            "(2) the page address starts with http:// and not https://, " +
            "(3) if this page is not opened from http://localhost:8080/ the CorsConfig class is added to the backend.");
    }

    const text = await res.text();

    if (!res.ok) {
        let message = text;
        try {
            const body = JSON.parse(text);
            message = body.message || body.error || text;
        } catch (e) { /* the reply was plain text */ }
        throw new Error(message || "Request failed (status " + res.status + ")");
    }
    return text;
}

async function getList(path) {
    const text = await request(API + path);
    return text ? JSON.parse(text) : [];
}

function sendJson(method, path, body) {
    return request(API + path, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
}


// ==================== ADD / EDIT / DELETE (vehicles, mechanics, bays) ====================

// Add a new row (POST) or, when Edit was pressed, update the existing row (PUT)
async function saveEntity(key) {
    const e = ENTITIES[key];

    const item = {};
    for (const field in e.fields) {
        item[field] = val(e.fields[field]);
    }

    for (let i = 0; i < e.required.length; i++) {
        if (item[e.required[i]] === "") {
            alert(e.name + ": please fill the fields marked with *");
            return;
        }
    }

    try {
        if (editing[key] === null) {
            await sendJson("POST", e.path, item);                        // INSERT in the database
        } else {
            await sendJson("PUT", e.path + "/" + editing[key], item);    // UPDATE in the database
        }
        resetForm(key);
        await e.reload();
        await loadJobCards();      // job cards show vehicle / bay / mechanic names
    } catch (err) {
        fail(err);
    }
}

// Put the values of a row back into the form so they can be changed
function editEntity(key, id) {
    const e = ENTITIES[key];
    const list = data[key];

    let item = null;
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === id) {
            item = list[i];
        }
    }
    if (item === null) {
        return;
    }

    let firstInput = null;
    for (const field in e.fields) {
        setVal(e.fields[field], item[field]);
        if (firstInput === null) {
            firstInput = e.fields[field];
        }
    }

    editing[key] = id;
    document.getElementById(e.saveBtn).textContent = "Update " + e.name;
    document.getElementById(e.cancelBtn).classList.remove("hidden");
    document.getElementById(firstInput).focus();
}

function cancelEdit(key) {
    resetForm(key);
}

function resetForm(key) {
    const e = ENTITIES[key];
    for (const field in e.fields) {
        setVal(e.fields[field], "");
    }
    editing[key] = null;
    document.getElementById(e.saveBtn).textContent = "Add " + e.name;
    document.getElementById(e.cancelBtn).classList.add("hidden");
}

async function deleteEntity(key, id) {
    const e = ENTITIES[key];
    if (!confirm("Delete this " + e.name.toLowerCase() + "?")) {
        return;
    }

    try {
        await request(API + e.path + "/" + id, { method: "DELETE" });   // DELETE in the database
        if (editing[key] === id) {
            resetForm(key);
        }
        await e.reload();
        await loadJobCards();
    } catch (err) {
        fail(err);
    }
}


// ==================== LOAD: VEHICLES / MECHANICS / BAYS ====================

async function loadVehicles() {
    data.vehicles = await getList("/vehicles");
    let rows = "";
    let options = "";

    for (let i = 0; i < data.vehicles.length; i++) {
        const v = data.vehicles[i];
        rows +=
            "<tr>" +
            "<td>" + v.id + "</td>" +
            "<td>" + show(v.registrationNumber) + "</td>" +
            "<td>" + show(v.make) + "</td>" +
            "<td>" + show(v.model) + "</td>" +
            "<td>" + show(v.ownerName) + "</td>" +
            "<td>" + show(v.ownerPhone) + "</td>" +
            actionButtons("vehicles", v.id) +
            "</tr>";

        options += "<option value='" + v.id + "'>" + esc(v.registrationNumber) +
            " (" + esc(v.make) + " " + esc(v.model) + ")</option>";
    }

    document.getElementById("vehicleTable").innerHTML = rows;
    fillSelect("jcVehicle", options, "No vehicles yet");
}

async function loadMechanics() {
    data.mechanics = await getList("/mechanics");
    let rows = "";
    let options = "";

    for (let i = 0; i < data.mechanics.length; i++) {
        const m = data.mechanics[i];
        rows +=
            "<tr>" +
            "<td>" + m.id + "</td>" +
            "<td>" + show(m.name) + "</td>" +
            "<td>" + show(m.phone) + "</td>" +
            "<td>" + show(m.specialization) + "</td>" +
            actionButtons("mechanics", m.id) +
            "</tr>";

        options += "<option value='" + m.id + "'>" + esc(m.name) + "</option>";
    }

    document.getElementById("mechanicTable").innerHTML = rows;
    fillSelect("assignMechanic", options, "No mechanics yet");
}

async function loadBays() {
    data.bays = await getList("/bays");
    let rows = "";
    let options = "";

    for (let i = 0; i < data.bays.length; i++) {
        const b = data.bays[i];
        rows +=
            "<tr>" +
            "<td>" + b.id + "</td>" +
            "<td>" + show(b.bayNumber) + "</td>" +
            "<td>" + show(b.description) + "</td>" +
            actionButtons("bays", b.id) +
            "</tr>";

        options += "<option value='" + b.id + "'>" + esc(b.bayNumber) + "</option>";
    }

    document.getElementById("bayTable").innerHTML = rows;
    fillSelect("assignBay", options, "No bays yet");
}


// ==================== JOB CARDS ====================

function jobCardOption(j) {
    return "<option value='" + j.id + "'>Job Card " + j.id + " - " +
        esc(j.requestedServices) + " (" + esc(j.status) + ")</option>";
}

async function loadJobCards() {
    data.jobCards = await getList("/jobcards");
    let rows = "";
    let openOptions = "";     // job cards that are not completed yet

    for (let i = 0; i < data.jobCards.length; i++) {
        const j = data.jobCards[i];
        const created = String(j.createdAt).replace("T", " ").substring(0, 16);

        rows +=
            "<tr>" +
            "<td>" + j.id + "</td>" +
            "<td>" + nameOf(data.vehicles, j.vehicleId, "registrationNumber") + "</td>" +
            "<td>" + nameOf(data.bays, j.bayId, "bayNumber") + "</td>" +
            "<td>" + nameOf(data.mechanics, j.mechanicId, "name") + "</td>" +
            "<td>" + show(j.requestedServices) + "</td>" +
            "<td><span class='badge " + esc(j.status) + "'>" + esc(j.status) + "</span></td>" +
            "<td>" + created + "</td>" +
            "</tr>";

        if (j.status !== "COMPLETED") {
            openOptions += jobCardOption(j);
        }
    }

    document.getElementById("jobCardTable").innerHTML = rows;
    fillSelect("assignJobCard", openOptions, "No open job cards");
    fillSelect("statusJobCard", openOptions, "No open job cards");
    refreshBillDropdown();
}

async function createJobCard() {
    const vehicleId = val("jcVehicle");
    const services = val("jcServices");

    if (vehicleId === "") {
        alert("Add a vehicle first");
        return;
    }
    if (services === "") {
        alert("Enter the requested services");
        return;
    }

    try {
        const reply = await request(API + "/jobcards?vehicleId=" + encodeURIComponent(vehicleId) +
            "&requestedServices=" + encodeURIComponent(services), { method: "POST" });

        if (reply === "") {
            alert("Vehicle not found. Add a vehicle first.");
            return;
        }
        setVal("jcServices", "");
        await loadJobCards();
    } catch (err) {
        fail(err);
    }
}

async function assignJobCard() {
    const jobCardId = val("assignJobCard");
    const bayId = val("assignBay");
    const mechanicId = val("assignMechanic");

    if (jobCardId === "" || bayId === "" || mechanicId === "") {
        alert("Select a job card, a bay and a mechanic");
        return;
    }

    try {
        const message = await request(API + "/jobcards/" + jobCardId +
            "/assign?bayId=" + bayId + "&mechanicId=" + mechanicId, { method: "PUT" });
        alert(message);
        await loadJobCards();
    } catch (err) {
        fail(err);
    }
}

async function changeStatus() {
    const jobCardId = val("statusJobCard");
    const newStatus = val("newStatus");

    if (jobCardId === "") {
        alert("Select a job card");
        return;
    }

    try {
        const message = await request(API + "/jobcards/" + jobCardId +
            "/status?newStatus=" + encodeURIComponent(newStatus), { method: "PUT" });
        alert(message);
        await loadJobCards();
    } catch (err) {
        fail(err);
    }
}


// ==================== BILLS ====================

// Only completed job cards that do not have a bill yet
function refreshBillDropdown() {
    let options = "";

    for (let i = 0; i < data.jobCards.length; i++) {
        const j = data.jobCards[i];
        if (j.status !== "COMPLETED") {
            continue;
        }

        let alreadyBilled = false;
        for (let k = 0; k < data.bills.length; k++) {
            if (data.bills[k].jobCardId === j.id) {
                alreadyBilled = true;
            }
        }

        if (!alreadyBilled) {
            options += jobCardOption(j);
        }
    }

    fillSelect("billJobCard", options, "No completed job cards waiting for a bill");
}

async function loadBills() {
    data.bills = await getList("/bills");
    let rows = "";

    for (let i = 0; i < data.bills.length; i++) {
        const b = data.bills[i];
        const billDate = String(b.billDate).replace("T", " ").substring(0, 16);

        rows +=
            "<tr>" +
            "<td>" + b.id + "</td>" +
            "<td>" + b.jobCardId + "</td>" +
            "<td>" + Number(b.partsCost).toFixed(2) + "</td>" +
            "<td>" + Number(b.labourCharges).toFixed(2) + "</td>" +
            "<td>" + Number(b.totalAmount).toFixed(2) + "</td>" +
            "<td>" + billDate + "</td>" +
            "</tr>";
    }

    document.getElementById("billTable").innerHTML = rows;
    refreshBillDropdown();
}

async function generateBill() {
    const jobCardId = val("billJobCard");
    const partsCost = val("billParts");
    const labourCharges = val("billLabour");

    if (jobCardId === "") {
        alert("No completed job card selected");
        return;
    }
    if (partsCost === "" || labourCharges === "" || Number(partsCost) < 0 || Number(labourCharges) < 0) {
        alert("Enter parts cost and labour charges (0 or more)");
        return;
    }

    try {
        const message = await request(API + "/jobcards/" + jobCardId +
            "/bill?partsCost=" + partsCost + "&labourCharges=" + labourCharges, { method: "POST" });
        alert(message);
        setVal("billParts", "");
        setVal("billLabour", "");
        await loadBills();
    } catch (err) {
        fail(err);
    }
}