const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const ejs = require('ejs');
const multer = require('multer');
const methodOverride = require('method-override');
const app = express();
const flash = require('connect-flash');

app.set('view engine', 'ejs');
app.set('views', __dirname);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(session({
    secret: 'yourSecretKey', // Secret to sign the session ID cookie
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true in production with HTTPS
}));

app.use(methodOverride('_method'));
app.use(flash());

app.use((req, res, next) => {
    res.locals.successMsg = req.flash('success');
    res.locals.errorMsg = req.flash('error');
    next();
  });
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'models/images')); // Save in models/images
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Ensure unique filenames
    },
});

const upload = multer({ storage });
app.use('/models/images', express.static('models/images'));
const { Event, insertSampleEvents } = require('./models/event');
const url = 'mongodb://127.0.0.1:27017/eventManagementSystem';

mongoose.connect(url)
    .then(() => {
        console.log('Connected to MongoDB');
        // Call the insertSampleEvents function once the connection is successful
        insertSampleEvents();
    })
    .catch((error) => console.error('Error connecting to MongoDB:', error));


const Registration = require('./models/registration');
const User = require('./models/user');
const Admin = require('./models/admin')

// Getting the home page 
app.get('/', async (req, res) => {
    const userId = req.session.userId;
    const adminId = req.session.adminId;
    let isAdmin = false;
    if(adminId){
        isAdmin = true;
    }
    const showLoginModal = false; 
    console.log('userId:', userId, 'isAdmin:', isAdmin);
    res.render('index', { 
        userId, 
        adminId,
        isAdmin,
        showLoginModal 
    });
});

// logging in the user
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // First, check if the user is an admin
        const admin = await Admin.findOne({ email });
        if (admin) {
            const isMatch = await bcrypt.compare(password, admin.password);
            if (isMatch) {
                req.session.adminId = admin._id;  // Store admin session
                req.session.isAdmin = true;
                req.flash('success', 'You have successfully logged in as an admin!');
                return res.redirect('/');  // Redirect to home page (index)
            } else {
                req.flash('error', 'Incorrect credentials.');
                return res.redirect('/');
            }
        }

        // If not an admin, check if it's a student
        const user = await User.findOne({ email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                req.session.userId = user._id;  // Store student session
                req.flash('success', 'You have successfully logged in!');
                return res.redirect('/');  // Redirect to home page (index)
            } else {
                req.flash('error', 'Incorrect credentials.');
                return res.redirect('/');
            }
        }

        // If neither admin nor student
        req.flash('error', 'User not found.');
        return res.redirect('/');
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Server error');
    }
});


// Getting the events page where all events are present
app.get('/dashboard', async (req, res) => {
    // Ensure either a user or admin is logged in
    if (!req.session.userId && !req.session.adminId) {
        return res.redirect('/login'); // Redirect to login page
    }

    try {
        const userId = req.session.userId; // Logged-in user's ID
        const adminId = req.session.adminId; // Logged-in admin's ID
        const isAdmin = !!req.session.adminId; // Determine if the current session is for an admin

        const events = await Event.find(); // Fetch all events

        let registeredEventIds = [];
        // Only fetch registrations for regular users (not admins)
        if (userId) {
            const registrations = await Registration.find({ userId }).select('eventId');
            registeredEventIds = registrations.map(reg => reg.eventId.toString());
        }

        // Add 'isRegistered' flag to each event
        const eventsWithRegistrationStatus = events.map(event => ({
            ...event.toObject(),
            isRegistered: registeredEventIds.includes(event._id.toString()),
        }));

        // Group events by 'type'
        const groupedEvents = eventsWithRegistrationStatus.reduce((groups, event) => {
            const type = event.type || 'Others'; // Default to 'Others' if type is missing
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(event);
            return groups;
        }, {});

        // Render the dashboard with all necessary data
        res.render('dashboard', {
            userId, 
            adminId,
            groupedEvents,
            isAdmin, // Pass the isAdmin flag to the template
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Server error');
    }
});

app.get('/create-event', (req, res) => {
    if (!req.session.adminId) {
        return res.redirect('/login'); // Redirect to login if not logged in as admin
    }
    const adminId = req.session.adminId;
    res.render('create-event', {adminId}); // Render the Create Event page
});

// To create a new event
app.post('/create-event', upload.single('eventPhoto'), async (req, res) => {
    if (!req.session.adminId) {
        return res.status(403).send('Unauthorized access');
    }

    try {
        // Get form data
        const { eventType, eventTitle, eventLocation, eventDate } = req.body;

        // Create a new event with the data
        const newEvent = new Event({
            type: eventType,
            title: eventTitle,
            venue: eventLocation,
            date: new Date(eventDate),
            image: req.file ? `/models/images/${req.file.filename}` : null, // Save image path
        });

        await newEvent.save(); // Save to database

        res.status(201).send('Event created successfully');
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/profile', async (req, res) => {
    if (!req.session.userId && !req.session.adminId) {
        return res.redirect('/login'); // Redirect if not logged in
    }

    try {
        const userId = req.session.userId; // Get the logged-in user's ID
        const adminId = req.session.adminId; // Get the logged-in admin's ID (if any)
        const isAdmin = req.session.isAdmin || false; // Check if the logged-in user is an admin

        let user = null;
        if (isAdmin) {
            user = await Admin.findById(adminId); // Fetch admin data
        } else {
            user = await User.findById(userId); // Fetch regular user data
        }

        if (!user) {
            return res.status(404).send('Profile not found'); // Handle invalid IDs
        }

        res.render('profile', {
            isAdmin,
            userId,
            adminId,
            user, // Pass user data for profile page
        });
    } catch (error) {
        console.error('Error fetching profile data:', error);
        res.status(500).send('Server error');
    }
});


// Showing the login form if the user is not logged in
app.get('/login', (req, res) => {
    const showLoginModal = true; // Show the login modal
    console.log("showLoginModal value:", showLoginModal);
    res.render('index', { 
        userId: req.session.userId, 
        showLoginModal 
    });
});

// Route to fetch upcoming events
app.get('/upcoming-events', async (req, res) => {
    try {
        const userId = req.session.userId; // Check if user is logged in
        const adminId = req.session.adminId; // Check if admin is logged in
        const events = await Event.find().sort({ date: 1 }).limit(7); // Get upcoming events 

        // Check registration status for logged-in user
        let registrations = [];
        if (userId) {
            registrations = await Registration.find({ userId }).select('eventId');
        }

        const registeredEventIds = registrations.map(reg => reg.eventId.toString());

        // Mark events as registered or not for the logged-in user
        const eventsWithRegistrationStatus = events.map(event => ({
            ...event.toObject(),
            isRegistered: registeredEventIds.includes(event._id.toString()),
        }));

        // Send response with both login status and admin status
        res.json({
            upcomingEvents: eventsWithRegistrationStatus,
            userLoggedIn: !!userId,  // Indicates if a regular user is logged in
            isAdmin: !!adminId       // Indicates if an admin is logged in
        });

    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        res.status(500).send('Error fetching upcoming events');
    }
});

// For admins to view registered students
app.get('/view-registrations/:eventId', async (req, res) => {
    console.log('Admin session ID:', req.session.adminId); // Check session value
    if (!req.session.adminId) {
        return res.redirect('/login'); // Only allow admins
    }

    try {
        const { eventId } = req.params;
        const registrations = await Registration.find({ eventId })
            .populate('userId', 'name email');

        if (!registrations || registrations.length === 0) {
            return res.status(404).json({ error: 'No registrations found for this event' });
        }

        res.json({ success: true, data: registrations });
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/edit/:id', async (req, res) => {
    const adminId = req.session.adminId;
    try {
        const event = await Event.findById(req.params.id); 
        res.render('edit', { adminId, event }); 
    } catch (err) {
        console.error('Error fetching event:', err);
        res.status(500).send('Error fetching event');
    }
});


// route for updating the event
app.put('/update/:id', upload.single('eventPhoto'), async (req, res) => {
    try {
        // Fetch the existing event to retain the previous image if no new image is uploaded
        const existingEvent = await Event.findById(req.params.id);
        if (!existingEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const updatedEvent = {
            title: req.body.eventTitle,
            venue: req.body.eventLocation,
            date: req.body.eventDate,
            type: req.body.eventType,
            image: req.file ? req.file.path : existingEvent.image // Retain old photo if no new one is uploaded
        };

        const event = await Event.findByIdAndUpdate(req.params.id, updatedEvent, { new: true });

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});


// Adding a new user
app.post('/register', async (req, res) => {
    const { email, name, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user
        const user = new User({
            email,
            name,
            password: hashedPassword,
        });

        // Save the user to the database
        await user.save();

        // Set session to log the user in automatically
        req.session.userId = user._id;

        // Redirect the user to the dashboard or wherever you want
        res.redirect('/');

    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).send('Error registering user');
    }
});

// showing the user they have registered for
app.get('/registered-events', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');  // Redirect to login if not logged in
    }

    try {
        const userId = req.session.userId;  // Get the logged-in user's ID from session

        // Find all registrations for the user
        const registrations = await Registration.find({ userId });

        // Get event details for the registered events
        const eventIds = registrations.map(reg => reg.eventId);
        const events = await Event.find({ '_id': { $in: eventIds } });

        // Group events by type
        const groupedEvents = events.reduce((acc, event) => {
            const type = event.type || 'Others'; // Default to 'Others' if type is missing
            if (!acc[type]) acc[type] = [];
            acc[type].push(event);
            return acc;
        }, {});

        res.render('registered', { 
            userId: req.session.userId,  // Pass userId here
            groupedEvents 
        });
    } catch (error) {
        console.error('Error fetching registered events:', error);
        res.status(500).send('Error fetching registered events');
    }
});

// registering a user for an event
app.post('/register-event', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'User not logged in' });
    }
  
    const { eventId } = req.body;
  
    try {
      // Check if the event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      // Check if the user is already registered for the event
      const existingRegistration = await Registration.findOne({
        userId: req.session.userId,
        eventId,
      });
      if (existingRegistration) {
        return res.status(400).json({ error: 'Already registered for this event' });
      }
  
      // Create a new registration
      const registration = new Registration({
        userId: req.session.userId,
        eventId,
      });
  
      await registration.save();
  
      res.json({ message: 'Successfully registered for the event!' });
    } catch (error) {
      console.error('Error registering for the event:', error);
      res.status(500).json({ error: 'An error occurred while registering' });
    }
  });

// terminating the session, logging the user out 

app.get('/logout', (req, res) => {
    // Set flash message before clearing session data
    req.flash('success', 'Logged out successfully');

    // Clear the user/admin session info without destroying the entire session
    req.session.userId = null;
    req.session.adminId = null;

    // Redirect to the homepage where your flash message will be shown
    res.redirect('/');
    console.log("Logged out successfully");
});


// Deleting an event 
app.delete('/delete/:id', async (req, res) => {
    try {
        console.log("Deleting event with ID:", req.params.id);
        
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.redirect('/dashboard'); // Redirect after deletion
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

const port = 1080;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});