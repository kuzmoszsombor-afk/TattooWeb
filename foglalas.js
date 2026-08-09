const form = document.getElementById("bookingForm");
const statusDiv = document.getElementById("formStatus");
const dateInput = document.getElementById("date");
const timeSlotsContainer = document.getElementById("timeSlotsContainer");
const timeSlots = document.getElementById("timeSlots");
const selectedTimeInput = document.getElementById("selectedTimeInput");
const submitBtn = document.getElementById("submitBtn");

const firebaseUrl = "https://tattoo-f3865-default-rtdb.europe-west1.firebasedatabase.app";
const formSubmitEmail = "kuzmoszsombor@gmail.com";

const currentDate = new Date();
const today = currentDate.toISOString().split('T')[0];
dateInput.setAttribute('min', today);

const maxYear = currentDate.getFullYear() + 2;
dateInput.setAttribute('max', `${maxYear}-12-31`);

const workingHours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

dateInput.addEventListener("change", async function(e) {
    const selectedDate = e.target.value;
    const day = new Date(selectedDate).getDay();
    
    if (day === 0 || day === 6) {
        alert("Hétvégére nem lehet időpontot foglalni. Kérlek válassz hétköznapot!");
        e.target.value = "";
        timeSlotsContainer.style.display = "none";
        selectedTimeInput.value = "";
        return;
    }

    timeSlotsContainer.style.display = "block";
    await renderTimeSlots(selectedDate);
});

async function fetchBookedSlots(date) {
    try {
        const response = await fetch(`${firebaseUrl}/bookings/${date}.json`);
        const data = await response.json();
        return data ? Object.keys(data) : [];
    } catch (error) {
        return [];
    }
}

async function renderTimeSlots(date) {
    timeSlots.innerHTML = "";
    selectedTimeInput.value = "";
    
    const bookedSlots = await fetchBookedSlots(date);

    workingHours.forEach(time => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = time;
        btn.className = "time-slot-btn";

        if (bookedSlots.includes(time)) {
            btn.classList.add("booked");
            btn.disabled = true;
        } else {
            btn.addEventListener("click", () => selectTimeSlot(btn, time));
        }

        timeSlots.appendChild(btn);
    });
}

function selectTimeSlot(clickedBtn, time) {
    document.querySelectorAll(".time-slot-btn").forEach(btn => {
        btn.classList.remove("selected");
    });
    clickedBtn.classList.add("selected");
    selectedTimeInput.value = time;
}

form.addEventListener("submit", async function(event) {
    event.preventDefault();
    
    if (!selectedTimeInput.value) {
        alert("Kérlek válassz egy időpontot!");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Küldés...";
    
    const date = dateInput.value;
    const time = selectedTimeInput.value;
    
    const bookingData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        details: document.getElementById("details").value,
        timestamp: new Date().toISOString()
    };

    try {
        const checkResponse = await fetch(`${firebaseUrl}/bookings/${date}/${time}.json`);
        const existingData = await checkResponse.json();
        
        if (existingData) {
            statusDiv.innerHTML = "Hiba: Az időpont időközben lefoglalásra került.";
            statusDiv.className = "status-error";
            await renderTimeSlots(date);
            submitBtn.disabled = false;
            submitBtn.textContent = "Foglalás elküldése";
            return;
        }

        await fetch(`${firebaseUrl}/bookings/${date}/${time}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        const formData = new FormData(form);
        await fetch(`https://formsubmit.co/ajax/${formSubmitEmail}`, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        statusDiv.innerHTML = "Sikeresen elküldve!";
        statusDiv.className = "status-success";
        form.reset();
        timeSlotsContainer.style.display = "none";
    } catch (error) {
        statusDiv.innerHTML = "Hiba történt a hálózati kapcsolatban.";
        statusDiv.className = "status-error";
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Foglalás elküldése";
    }
});