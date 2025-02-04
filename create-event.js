(function () {
    const form = document.getElementById('event-form');
    const successPopup = document.getElementById('success-popup');

    if (!successPopup) {
        console.error('Success popup element not found!');
        return; 
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        try {
            const response = await fetch('/create-event', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                successPopup.classList.remove('hidden');
                successPopup.classList.add('show'); // Add the "show" class to display the popup
                setTimeout(() => {
                    successPopup.classList.remove('show'); 
                    successPopup.classList.add('hidden'); 
                }, 3000);
                form.reset(); 
            } else {
                console.error('Failed to create event');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    });
})();

document.getElementById('back-btn').addEventListener('click', function() {
    window.location.href = '/dashboard'; // Redirect to the /dashboard route
});

document.getElementById('update-btn').addEventListener('click', async () => {
    // Get event details from the form
    const eventId = '<%= event._id %>'; // Dynamically pass this from the backend
    const eventTitle = document.getElementById('event-title').value;
    const eventLocation = document.getElementById('event-location').value;
    const eventDate = document.getElementById('event-date').value;
    const eventType = document.getElementById('event-type').value; // Get event type value
    const eventPhoto = document.getElementById('event-photo').files[0]; // If you're using file upload

    // Create a FormData object for file upload
    const formData = new FormData();
    formData.append('eventTitle', eventTitle);
    formData.append('eventLocation', eventLocation);
    formData.append('eventDate', eventDate);
    formData.append('eventType', eventType); // Append eventType to formData
    if (eventPhoto) {
        formData.append('eventPhoto', eventPhoto);
    }

    try {
        const response = await fetch(`/update/${eventId}`, {
            method: 'PUT',
            body: formData, // Send form data
        });
    } catch (error) {
        console.error('Error updating event:', error);
        alert('An error occurred while updating the event');
    }
});
