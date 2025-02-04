document.addEventListener('DOMContentLoaded', function () {
    const profileIcon = document.querySelector('.profile-icon');
    if (profileIcon) {
        profileIcon.addEventListener('click', function () {
            console.log('Profile icon clicked!');
        });
    }

    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            console.log('Logging out...');
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Handle Event Registration
    document.querySelectorAll('.register-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const eventId = button.getAttribute('data-event-id');
            if (!eventId) return;

            try {
                const response = await fetch('/register-event', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ eventId }),
                });

                const result = await response.json();

                if (response.ok) {
                    // Update button text and disable it after registration
                    button.textContent = 'Registered';
                    button.disabled = true;
                } else {
                    console.error(result.error); // Handle error if registration fails
                }
            } catch (error) {
                console.error('Error registering for the event:', error);  // Handle fetch error
            }
        });
    });

    // Handle View Registrations (Modal functionality)
    document.querySelectorAll('.view-registrations-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const eventId = button.getAttribute('data-event-id');
            if (!eventId) return;

            try {
                const response = await fetch(`/view-registrations/${eventId}`);
                const result = await response.json();

                if (response.ok && result.success) {
                    // Populate the table with registrations
                    const registrations = result.data;
                    const popupTableBody = document.getElementById('popup-table-body');
                    popupTableBody.innerHTML = registrations.map(reg => `
                        <tr>
                            <td>${reg.userId.name}</td>
                            <td>${reg.userId.email}</td>
                        </tr>
                    `).join('');

                    // Show the modal
                    const popupContainer = document.getElementById('popup-container');
                    popupContainer.classList.remove('hidden');
                } else {
                    alert(result.error || 'Failed to fetch registrations');
                }
            } catch (error) {
                console.error('Error fetching registrations:', error);
                alert('An error occurred. Please try again.');
            }
        });
    });

    // Close the popup modal
    const closePopupBtn = document.getElementById('close-popup');
    closePopupBtn.addEventListener('click', () => {
        const popupContainer = document.getElementById('popup-container');
        popupContainer.classList.add('hidden');
    });

    document.querySelectorAll('.edit-event-btn').forEach(button => {
        button.addEventListener('click', () => {
            const eventId = button.getAttribute('data-event-id');
            window.location.href = `/edit/${eventId}`;
        })
    })
});

// Select all carousel containers
const carouselContainers = document.querySelectorAll('.carousel-container');

carouselContainers.forEach((container) => {
    const carousel = container.querySelector('.carousel');
    const leftArrow = container.querySelector('.left-arrow');
    const rightArrow = container.querySelector('.right-arrow');
    const cards = carousel.children;
    const cardWidth = cards[0].offsetWidth + 20; // Card width + margin
    let currentIndex = 0;

    // Function to update carousel position and manage arrow visibility
    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        leftArrow.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
        rightArrow.style.visibility =
            currentIndex >= cards.length - Math.floor(container.offsetWidth / cardWidth)
                ? 'hidden'
                : 'visible';
    }

    // Initialize arrow visibility
    updateCarousel();

    // Event listeners for arrows
    leftArrow.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    rightArrow.addEventListener('click', () => {
        if (
            currentIndex <
            cards.length - Math.floor(container.offsetWidth / cardWidth)
        ) {
            currentIndex++;
            updateCarousel();
        }
    });
});


