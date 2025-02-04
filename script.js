const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Valid email format
const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*]).{8,}$/; // At least 8 characters, one letter, one number, one special character
const usernameRegex = /^[a-zA-Z0-9]{6,}$/; // At least 6 alphanumeric characters
// Get modal and button elements
document.addEventListener('DOMContentLoaded', function () {
  // Get all the required elements
  var loginBtn = document.getElementById("login-btn");
  var modal = document.getElementById("loginModal");
  var closeBtn = document.getElementsByClassName("closeBtn")[0];
  var signUpLink = document.getElementById("signUpLink");
  var signInLink = document.getElementById("signInLink");
  var signUpForm = document.getElementById("signUpForm");
  var signInForm = document.getElementById("signInForm");
  var modalTitle = document.getElementById("modalTitle");

  document.querySelectorAll('.register-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      const showLogin = event.target.getAttribute('data-show-login');
      console.log('showLogin:', showLogin);  // Check if the attribute is set correctly

      // If the user is not logged in, show the login modal
      if (showLogin === 'true') {
        modal.style.display = "flex"; // Show login modal
      } else {
        const eventTitle = event.target.getAttribute('data-event');
        // Handle the registration logic (e.g., register the user for the event)
        console.log(`User is registered for ${eventTitle}`);
        // You can add an API call here to register the user if needed
      }
    });
  });
  // When the user clicks the login button, show the modal
  if (loginBtn) {
    loginBtn.onclick = function () {
      modal.style.display = "flex";
      signInForm.style.display = "block";
      signUpForm.style.display = "none";
      modalTitle.textContent = "Login";
    };
  }

  // When the user clicks the close button, close the modal
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  // Switch to the Sign Up form
  signUpLink.onclick = function () {
    signInForm.style.display = "none";
    signUpForm.style.display = "block";
    modalTitle.textContent = "Sign Up";
  };

  // Switch to the Sign In form
  signInLink.onclick = function () {
    signUpForm.style.display = "none";
    signInForm.style.display = "block";
    modalTitle.textContent = "Login";
  };

  // Handle Sign Up Form submission
  signUpForm.onsubmit = function (event) {
    event.preventDefault();

    // Get form values
    const email = signUpForm.querySelector("input[type='email']").value;
    const username = signUpForm.querySelector("input[type='text']").value;
    const password = signUpForm.querySelector("input[type='password']").value;

    // Validate email
    if (!emailRegex.test(email)) {
      alert("Enter a valid email ID.");
      return;
    }

    // Validate username
    if (!usernameRegex.test(username)) {
      alert("Username must be at least 6 characters and contain only letters and numbers.");
      return;
    }

    // Validate password
    if (!passwordRegex.test(password)) {
      alert("Password must be at least 8 characters, include a number, a letter, and a special character.");
      return;
    }

    signUpForm.submit();
  };

  // Handle Sign In Form submission
  signInForm.onsubmit = function (event) {
    event.preventDefault();

    // Get form values
    const email = signInForm.querySelector("input[type='email']").value;
    const password = signInForm.querySelector("input[type='password']").value;

    // Validate email
    if (!emailRegex.test(email)) {
      alert("Enter a valid email ID.");
      return;
    }

    // Validate password length
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    signInForm.submit();
  };

  // When the user clicks anywhere outside the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // events
  const leftArrow = document.getElementById('leftArrow');
  const rightArrow = document.getElementById('rightArrow');
  const eventCards = document.querySelector('.event-cards');
  const cardWidth = 315; // Card width + margin-right
  let currentOffset = 0;

  // Slider Controls
  leftArrow.addEventListener('click', () => {
    currentOffset = Math.min(currentOffset + cardWidth, 0); // Prevent moving past the first card
    eventCards.style.transform = `translateX(${currentOffset}px)`;
  });

  rightArrow.addEventListener('click', () => {
    const maxOffset = -(eventCards.scrollWidth - eventCards.parentElement.offsetWidth);
    currentOffset = Math.max(currentOffset - cardWidth, maxOffset); // Prevent moving past the last card
    eventCards.style.transform = `translateX(${currentOffset}px)`;
  });
});

async function loadEvents() {
  /*
  try {
    // Fetch upcoming events from the backend
    const response = await fetch("http://localhost:1080/upcoming-events");
    const data = await response.json();

    const events = data.upcomingEvents;
    const userLoggedIn = data.userLoggedIn;
    const isAdmin = data.isAdmin;

    const eventCardsContainer = document.getElementById("eventCardsContainer");
    eventCardsContainer.innerHTML = ""; // Clear previous events

    events.forEach((event) => {
      const eventCard = document.createElement("div");
      eventCard.classList.add("event-card");

      eventCard.innerHTML = `
        <img src="http://localhost:1080${event.image}" alt="${event.title}">
        <h3>${event.title}</h3>
        <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
        <p>Location: ${event.venue}</p>
        <p>Type: ${event.type}</p>
        <button class="register-btn" data-event-id="${event._id}" ${userLoggedIn ? "" : 'data-show-login="true"'}> 
            ${isAdmin ? "View Registered" : event.isRegistered ? "Registered" : "Register"}
        </button>
      `;

      eventCardsContainer.appendChild(eventCard);
    });*/
    try {
      // Fetch upcoming events from the backend
      const response = await fetch("http://localhost:1080/upcoming-events");
      const data = await response.json();
    
      const events = data.upcomingEvents;
      const userLoggedIn = data.userLoggedIn;
      const isAdmin = data.isAdmin;
    
      const eventCardsContainer = document.getElementById("eventCardsContainer");
      eventCardsContainer.innerHTML = ""; // Clear previous events
    
      events.forEach((event) => {
        // Determine background color for the button:
        // For non-admins: if registered, use #ff9800; otherwise, use #007bff.
        // For admins, you might choose to keep the default color (#007bff).
        const bgColor = (!isAdmin && event.isRegistered) ? '#0056b3' : '#007bff';
    
        const eventCard = document.createElement("div");
        eventCard.classList.add("event-card");
    
        eventCard.innerHTML = `
          <img src="http://localhost:1080${event.image}" alt="${event.title}">
          <h3>${event.title}</h3>
          <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
          <p>Location: ${event.venue}</p>
          <p>Type: ${event.type}</p>
          <button 
              class="${isAdmin ? 'view-registrations-btn' : 'register-btn'}" 
              data-event-id="${event._id}" 
              ${userLoggedIn ? "" : 'data-show-login="true"'} 
              style="background-color: ${bgColor};">
              ${isAdmin ? "View Registered" : (event.isRegistered ? "Registered" : "Register")}
          </button>
        `;
    
        eventCardsContainer.appendChild(eventCard);
      });
    const exploreMoreCard = document.createElement("div");
    exploreMoreCard.classList.add("event-card", "explore-more");
    exploreMoreCard.innerHTML = `<h3>Explore More Events</h3>`;

    // Check if the user is logged in
    if (userLoggedIn) {
      exploreMoreCard.addEventListener("click", () => {
        window.location.href = "/dashboard";
      });
    } else {
      exploreMoreCard.addEventListener("click", () => {
        showLoginModal(); // Show login modal if the user is not logged in
      });
    }

    eventCardsContainer.appendChild(exploreMoreCard);

    // Add event listeners to the "Register" buttons
    document.querySelectorAll(".register-btn").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const eventId = button.getAttribute("data-event-id");

        if (isAdmin) {
          // Fetch registered users and display in the popup
          try {
            const registrationsResponse = await fetch(`/view-registrations/${eventId}`);
            const registrationsData = await registrationsResponse.json();

            if (registrationsData.success) {
              const registrations = registrationsData.data;

              // Populate the popup modal with a table of registrations
              const popupTableBody = document.getElementById("popup-table-body");
              popupTableBody.innerHTML = registrations
                .map(
                  (reg) => `
                  <tr>
                    <td>${reg.userId.name}</td>
                    <td>${reg.userId.email}</td>
                  </tr>
                `
                )
                .join("");

              // Show the popup modal
              const popupContainer = document.getElementById("popup-container");
              popupContainer.classList.remove("hidden");
            } else {
              alert("No registrations found for this event.");
            }
          } catch (error) {
            console.error("Error fetching registrations:", error);
            alert("An error occurred while fetching registrations.");
          }
        } else {
          if (button.getAttribute("data-show-login") === "true") {
            showLoginModal();
          } else {
            try {
              const registerResponse = await fetch("/register-event", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ eventId }),
              });

              if (registerResponse.ok) {
                button.innerText = "Registered";
                button.disabled = true;
              } else {
                const errorData = await registerResponse.json();
                alert(errorData.error || "Registration failed");
              }
            } catch (error) {
              console.error("Error registering for the event:", error);
              alert("An error occurred while registering. Please try again.");
            }
          }
        }
      });
    });

    // Close the popup modal
    const closePopupBtn = document.getElementById("close-popup");
    closePopupBtn.addEventListener("click", () => {
      const popupContainer = document.getElementById("popup-container");
      popupContainer.classList.add("hidden");
    });
  } catch (error) {
    console.error("Error loading events:", error);
  }
}


// Utility function to show the modal
function showModal(content) {
  const modal = document.getElementById("registered-users-modal");
  const modalBody = document.getElementById("registered-users-modal-body");

  modalBody.innerHTML = content;
  modal.style.display = "block"; // Show modal
}

// Close modal functionality
function closeModal() {
  const modal = document.getElementById("registered-users-modal");
  modal.style.display = "none";
}

// Call the loadEvents function when the page loads
loadEvents();
function showLoginModal() {
  const modal = document.getElementById('loginModal');
  modal.style.display = 'flex'; // Show modal by setting display style
}

// Function to close the login modal
function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  modal.style.display = 'none'; // Hide modal by setting display style
}
// Contact form submission handler
const contactForm = document.getElementById("contact-form");
const successPopup = document.getElementById("success-popup");


document.addEventListener("DOMContentLoaded", () => {
  const contactLink = document.querySelector('a[href="#contact"]');

  if (contactLink) {
    contactLink.addEventListener('click', (event) => {
      event.preventDefault();  // Prevent default action of link

      // Small delay to ensure page is loaded
      setTimeout(() => {
        const contactSection = document.querySelector('#contact');

        // Scroll the contact section into view
        contactSection.scrollIntoView({
          behavior: 'smooth',
          block: 'end' // Align the start of the section with the top of the screen
        });

        // Adjust scroll position if the navbar is fixed (or any fixed element that may overlap)
        window.scrollBy(0, -50); // Adjust the scroll by the height of your navbar (50px here)
      }, 50); // Small delay to ensure page is loaded
    });
  }
});


if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const college = document.getElementById("college").value;
    const message = document.getElementById("message").value;

    if (firstName && lastName && email && phone && college && message) {
      // Show the success popup
      successPopup.classList.add("show");

      // Automatically hide the popup after 3 seconds
      setTimeout(() => {
        successPopup.classList.remove("show");
      }, 3000);

      // Reset the form
      contactForm.reset();
    } else {
      alert("Please fill out all fields before submitting.");
    }
  });
}
document.addEventListener("DOMContentLoaded", function () {
  const flashMessageContainer = document.getElementById("flashMessageContainer");
  const successMsg = flashMessageContainer.getAttribute("data-success");
  const errorMsg = flashMessageContainer.getAttribute("data-error");

  if (successMsg) {
      showFlashMessage(successMsg, "success");
  }

  if (errorMsg) {
      showFlashMessage(errorMsg, "error");
  }
});

function showFlashMessage(message, type) {
  // Create flash message element
  const flashMessage = document.createElement("div");
  flashMessage.classList.add("flash-message");
  flashMessage.innerText = message;

  if (type === "error") {
      flashMessage.classList.add("error");
  }

  // Append the flash message element to the body
  document.body.appendChild(flashMessage);

  // Show the message with a fade in effect
  flashMessage.style.opacity = "1";
  flashMessage.style.display = "block";

  // Hide the message after 2 seconds, fading out over 0.5 seconds
  setTimeout(() => {
      flashMessage.style.opacity = "0";
      setTimeout(() => { flashMessage.remove(); }, 500);
  }, 2000);
}

