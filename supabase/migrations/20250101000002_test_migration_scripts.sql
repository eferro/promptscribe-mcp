-- Test script for username migration
-- This script tests the migration functions without affecting production data
-- Run this in a test environment first

-- Test 1: Test username generation function
DO $$
DECLARE
    test_username TEXT;
    test_username2 TEXT;
    test_username3 TEXT;
BEGIN
    -- Test basic username generation
    SELECT generate_unique_username_for_existing_user('test@example.com') INTO test_username;
    RAISE NOTICE 'Generated username for test@example.com: %', test_username;
    
    -- Test username with special characters
    SELECT generate_unique_username_for_existing_user('user.name-123@example.com') INTO test_username2;
    RAISE NOTICE 'Generated username for user.name-123@example.com: %', test_username2;
    
    -- Test short email
    SELECT generate_unique_username_for_existing_user('ab@example.com') INTO test_username3;
    RAISE NOTICE 'Generated username for ab@example.com: %', test_username3;
    
    -- Verify usernames meet requirements
    IF LENGTH(test_username) >= 3 AND LENGTH(test_username) <= 20 AND test_username ~ '^[a-zA-Z0-9_-]+$' THEN
        RAISE NOTICE '✅ Username validation passed for test_username';
    ELSE
        RAISE NOTICE '❌ Username validation failed for test_username';
    END IF;
    
    IF LENGTH(test_username2) >= 3 AND LENGTH(test_username2) <= 20 AND test_username2 ~ '^[a-zA-Z0-9_-]+$' THEN
        RAISE NOTICE '✅ Username validation passed for test_username2';
    ELSE
        RAISE NOTICE '❌ Username validation failed for test_username2';
    END IF;
    
    IF LENGTH(test_username3) >= 3 AND LENGTH(test_username3) <= 20 AND test_username3 ~ '^[a-zA-Z0-9_-]+$' THEN
        RAISE NOTICE '✅ Username validation passed for test_username3';
    ELSE
        RAISE NOTICE '❌ Username validation failed for test_username3';
    END IF;
END $$;

-- Test 2: Test configuration functions
DO $$
DECLARE
    config_value TEXT;
    validation_result RECORD;
BEGIN
    -- Test getting configuration
    SELECT get_username_config('min_length') INTO config_value;
    RAISE NOTICE 'Min length config: %', config_value;
    
    -- Test username validation
    SELECT * FROM validate_username_against_config('validuser') INTO validation_result;
    RAISE NOTICE 'Validation for "validuser": valid=%, message=%', validation_result.is_valid, validation_result.error_message;
    
    SELECT * FROM validate_username_against_config('ab') INTO validation_result;
    RAISE NOTICE 'Validation for "ab": valid=%, message=%', validation_result.is_valid, validation_result.error_message;
    
    SELECT * FROM validate_username_against_config('user@name') INTO validation_result;
    RAISE NOTICE 'Validation for "user@name": valid=%, message=%', validation_result.is_valid, validation_result.error_message;
    
    SELECT * FROM validate_username_against_config('admin') INTO validation_result;
    RAISE NOTICE 'Validation for "admin": valid=%, message=%', validation_result.is_valid, validation_result.error_message;
END $$;

-- Test 3: Test username change permission function
DO $$
DECLARE
    change_result RECORD;
    test_user_id UUID := '00000000-0000-0000-0000-000000000000'; -- Dummy UUID for testing
BEGIN
    -- Test username change permission (should work with no cooldown)
    SELECT * FROM can_change_username(test_user_id, 'newusername') INTO change_result;
    RAISE NOTICE 'Username change permission for "newusername": allowed=%, message=%', change_result.can_change, change_result.error_message;
    
    -- Test with invalid username
    SELECT * FROM can_change_username(test_user_id, 'ab') INTO change_result;
    RAISE NOTICE 'Username change permission for "ab": allowed=%, message=%', change_result.can_change, change_result.error_message;
END $$;

-- Test 4: Verify configuration table structure
SELECT 
    'Configuration table check' as test_name,
    COUNT(*) as config_count,
    CASE 
        WHEN COUNT(*) >= 8 THEN '✅ PASS - Configuration table has expected entries'
        ELSE '❌ FAIL - Configuration table missing entries'
    END as status
FROM username_config;

-- Test 5: Verify function permissions
SELECT 
    'Function permissions check' as test_name,
    COUNT(*) as function_count,
    CASE 
        WHEN COUNT(*) >= 3 THEN '✅ PASS - Functions have proper permissions'
        ELSE '❌ FAIL - Functions missing permissions'
    END as status
FROM information_schema.routine_privileges 
WHERE routine_name IN ('get_username_config', 'validate_username_against_config', 'can_change_username')
  AND grantee = 'authenticated';

-- Summary of all tests
SELECT 'Migration test script completed successfully' as status;
