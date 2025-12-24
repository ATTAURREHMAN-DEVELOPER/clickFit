-- 1. Create Users Table
-- Stores user account information with email as unique identifier
CREATE TABLE IF NOT EXISTS users (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Stored Procedure: addUser
-- Adds a new user to the database with error handling
-- Returns success/error messages via the OUT parameter
DELIMITER //

CREATE PROCEDURE addUser(
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_type VARCHAR(50),
    IN p_active BOOLEAN,
    OUT p_result VARCHAR(255)
)
BEGIN
    DECLARE duplicate_entry CONDITION FOR SQLSTATE '23000';
    DECLARE EXIT HANDLER FOR duplicate_entry
    BEGIN
        SET p_result = 'ERROR: Email already exists';
    END;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            @sqlstate = RETURNED_SQLSTATE, 
            @errno = MYSQL_ERRNO, 
            @text = MESSAGE_TEXT;
        SET p_result = CONCAT('ERROR: ', @text);
    END;
    
    INSERT INTO users (email, password, type, active)
    VALUES (p_email, p_password, p_type, p_active);
    
    SET p_result = 'SUCCESS: User added successfully';
END //

DELIMITER ;

-- 3. Example Calls
-- Add a test user
CALL addUser('user@example.com', 'password123!', 'admin', TRUE, @result);
SELECT @result AS result_message;

-- Verify the insertion
SELECT * FROM users;