const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    image: { type: String, required: true }, // Field to store image URL or file path
    type: { type: String },
});

const Event = mongoose.model('Event', eventSchema);

// Function to insert sample events with images
async function insertSampleEvents() {
    const sampleEvents = [
        {
            title: 'CODE-A-THON',
            date: new Date('2025-02-10'),
            venue: 'Auditorium',
            image: '/models/images/coding.jpg', // Path to the event's image
            type: 'Tech',
        },
        {
            title: 'HACKATHON',
            date: new Date('2025-02-25'),
            venue: 'Auditorium-2',
            image: '/models/images/coding2.png',
            type: 'Tech',
        },
        {
            title: 'Design in Tech',
            date: new Date('2025-03-12'),
            venue: 'Room 315, CS Department',
            image: '/models/images/coding3.jpg',
            type: 'Tech',
        },
        {
            title: 'Literature event',
            date: new Date('2025-03-12'),
            venue: 'Room 315, CS Department',
            image: '/models/images/literature.JPG',
            type: 'Literature',
        },
        {
            title: 'Sports Meet',
            date: new Date('2025-03-12'),
            venue: 'Room 315, CS Department',
            image: '/models/images/sports.jpg',
            type: 'Sports',
        },
        {
            title: 'Code-O-Mania',
            date: new Date('2025-03-12'),
            venue: 'Room 315, CS Department',
            image: '/models/images/coding4.png',
            type: 'Tech',
        },
        {
            title: 'Code Jam',
            date: new Date('2025-03-12'),
            venue: 'Room 315, CS Department',
            image: '/models/images/coding4.jpeg',
            type: 'Tech',
        },
    ];

    try {
        for (const event of sampleEvents) {
            const existingEvent = await Event.findOne({ title: event.title });
            if (!existingEvent) {
                await Event.create(event);
                console.log(`Inserted: ${event.title}`);
            } else {
                console.log(`Event "${event.title}" already exists.`);
            }
        }
    } catch (err) {
        console.error('Error inserting sample events:', err);
    }
}

module.exports = { Event, insertSampleEvents };
