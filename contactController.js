const Contact = require('../models/contactModel');

exports.submitContactForm = async (req, res) => {
    const { name, email, phone, message } = req.body;
    try {
        const newContact = new Contact({ name, email, phone, message });
        await newContact.save();
        res.status(201).json({ message: 'Message sent successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
};

