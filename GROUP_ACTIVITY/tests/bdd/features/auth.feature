@auth
Feature: User Authentication
  As a user of the Employee Manager application
  I want to log in and log out
  So that I can securely access the employee management features

  Background:
    Given the application is running

  @smoke
  Scenario: Successful login with valid credentials (admin)
    Given I am on the login page
    When I enter username "admin" and password "password"
    And I click the Login button
    Then I should be redirected to the employee list page
    And I should see "Employee List" on the page

  Scenario: Successful login with user credentials
    Given I am on the login page
    When I enter username "user" and password "123456"
    And I click the Login button
    Then I should be redirected to the employee list page

  Scenario: Successful login with test credentials
    Given I am on the login page
    When I enter username "test" and password "test123"
    And I click the Login button
    Then I should be redirected to the employee list page

  Scenario: Failed login with entirely invalid credentials
    Given I am on the login page
    When I enter username "wronguser" and password "wrongpass"
    And I click the Login button
    Then I should see the error message "Invalid username or password"
    And I should remain on the login page

  Scenario: Failed login with correct username but wrong password
    Given I am on the login page
    When I enter username "admin" and password "notmypassword"
    And I click the Login button
    Then I should see the error message "Invalid username or password"
    And I should remain on the login page

  Scenario: Login blocked with empty fields
    Given I am on the login page
    When I click the Login button without entering credentials
    Then I should remain on the login page

  @smoke
  Scenario: Logoff clears session and redirects to login
    Given I am logged in as "admin" with password "password"
    When I click the Logoff button
    Then I should be redirected to the login page
    And my session should be cleared

  @smoke
  Scenario: Unauthenticated user is redirected from /list to login
    Given I am not logged in
    When I try to access "/list"
    Then I should be redirected to the login page

  Scenario: Unauthenticated user is redirected from /form to login
    Given I am not logged in
    When I try to access "/form"
    Then I should be redirected to the login page
