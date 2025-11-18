const expressasyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");




 const register = expressasyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const user = await User.create({ name, email, password: hashedPassword, role });
    res.status(201).json(user);
});


 const login = expressasyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
    }
    
    const token = jwt.sign({ id: user._id, role: user.role , email: user.email }, process.env.JWT_SECRET, { expiresIn: '10h' });
    res.status(200).json(
        {
            status: 200,
            success: true,
            message: "Login successful",
            userData: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token: token
        }
        
    );
});


module.exports = { register, login };
