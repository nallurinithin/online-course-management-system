"""
Shared pytest configuration for the test suite.
Each test module uses its own isolated SQLite DB file that is created
before the test and torn down after — so tests in different modules
never interfere with each other.
"""
