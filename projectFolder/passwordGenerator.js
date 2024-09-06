const bcrypt = require('bcrypt');

let saltRounds = 10;

async function generateHash(password) {
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(saltRounds);
    
    // Hash the password using the salt
    const hash = await bcrypt.hash(password, salt);
    
    console.log('Hash:', hash);
  } catch (err) {
    console.error('Error generating hash:', err);
  }
}

// Call the function to generate the hash for the password
generateHash('CK@123');
