-- Configuration script for username validation and settings
-- This script sets up configuration tables and functions for username management

-- Create a configuration table for username settings
CREATE TABLE IF NOT EXISTS public.username_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default configuration values
INSERT INTO username_config (key, value, description) VALUES
    ('min_length', '3', 'Minimum username length'),
    ('max_length', '20', 'Maximum username length'),
    ('allowed_pattern', '^[a-zA-Z0-9_-]+$', 'Regex pattern for allowed characters'),
    ('reserved_names', 'admin,root,system,support,help,info,test,demo', 'Comma-separated list of reserved usernames'),
    ('max_attempts', '100', 'Maximum attempts to generate unique username'),
    ('change_cooldown_hours', '0', 'Hours required between username changes (0 = no cooldown)'),
    ('enable_history', 'false', 'Whether to track username change history')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = now();

-- Create a function to get username configuration
CREATE OR REPLACE FUNCTION get_username_config(config_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN value FROM username_config WHERE key = config_key;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to validate username against configuration
CREATE OR REPLACE FUNCTION validate_username_against_config(username_to_check TEXT)
RETURNS TABLE(is_valid BOOLEAN, error_message TEXT) AS $$
DECLARE
    min_len INTEGER;
    max_len INTEGER;
    pattern TEXT;
    reserved_list TEXT;
BEGIN
    -- Get configuration values
    min_len := (get_username_config('min_length'))::INTEGER;
    max_len := (get_username_config('max_length'))::INTEGER;
    pattern := get_username_config('allowed_pattern');
    reserved_list := get_username_config('reserved_names');
    
    -- Check length
    IF LENGTH(username_to_check) < min_len THEN
        RETURN QUERY SELECT FALSE, format('Username must be at least %s characters long', min_len);
        RETURN;
    END IF;
    
    IF LENGTH(username_to_check) > max_len THEN
        RETURN QUERY SELECT FALSE, format('Username cannot exceed %s characters', max_len);
        RETURN;
    END IF;
    
    -- Check pattern
    IF username_to_check !~ pattern THEN
        RETURN QUERY SELECT FALSE, 'Username can only contain letters, numbers, underscores, and hyphens';
        RETURN;
    END IF;
    
    -- Check reserved names
    IF username_to_check = ANY(string_to_array(LOWER(reserved_list), ',')) THEN
        RETURN QUERY SELECT FALSE, 'Username is reserved and cannot be used';
        RETURN;
    END IF;
    
    -- All validations passed
    RETURN QUERY SELECT TRUE, 'Username is valid';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if username change is allowed (for future use)
CREATE OR REPLACE FUNCTION can_change_username(user_id_to_check UUID, new_username TEXT)
RETURNS TABLE(can_change BOOLEAN, error_message TEXT) AS $$
DECLARE
    cooldown_hours INTEGER;
    last_change TIMESTAMP WITH TIME ZONE;
    validation_result RECORD;
BEGIN
    -- Check if username change history is enabled
    IF get_username_config('enable_history') = 'false' THEN
        -- If history is disabled, just validate the new username
        SELECT * INTO validation_result FROM validate_username_against_config(new_username);
        IF NOT validation_result.is_valid THEN
            RETURN QUERY SELECT FALSE, validation_result.error_message;
            RETURN;
        END IF;
        
        RETURN QUERY SELECT TRUE, 'Username change allowed';
        RETURN;
    END IF;
    
    -- Get cooldown setting
    cooldown_hours := (get_username_config('change_cooldown_hours'))::INTEGER;
    
    -- If no cooldown, just validate
    IF cooldown_hours = 0 THEN
        SELECT * INTO validation_result FROM validate_username_against_config(new_username);
        IF NOT validation_result.is_valid THEN
            RETURN QUERY SELECT FALSE, validation_result.error_message;
            RETURN;
        END IF;
        
        RETURN QUERY SELECT TRUE, 'Username change allowed';
        RETURN;
    END IF;
    
    -- Check cooldown period
    SELECT MAX(changed_at) INTO last_change
    FROM username_history
    WHERE user_id = user_id_to_check;
    
    IF last_change IS NOT NULL AND 
       last_change > (NOW() - INTERVAL '1 hour' * cooldown_hours) THEN
        RETURN QUERY SELECT FALSE, format('Username can only be changed every %s hours', cooldown_hours);
        RETURN;
    END IF;
    
    -- Validate new username
    SELECT * INTO validation_result FROM validate_username_against_config(new_username);
    IF NOT validation_result.is_valid THEN
        RETURN QUERY SELECT FALSE, validation_result.error_message;
        RETURN;
    END IF;
    
    RETURN QUERY SELECT TRUE, 'Username change allowed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to these functions
GRANT EXECUTE ON FUNCTION get_username_config(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_username_against_config(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION can_change_username(UUID, TEXT) TO authenticated;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_username_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_username_config_updated_at
    BEFORE UPDATE ON username_config
    FOR EACH ROW
    EXECUTE FUNCTION update_username_config_updated_at();

-- Insert some sample configuration updates
INSERT INTO username_config (key, value, description) VALUES
    ('enable_username_suggestions', 'true', 'Whether to provide username suggestions when requested name is taken'),
    ('suggestion_algorithm', 'suffix', 'Algorithm for generating username suggestions: suffix, prefix, or random'),
    ('max_suggestions', '5', 'Maximum number of username suggestions to provide')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = now();
