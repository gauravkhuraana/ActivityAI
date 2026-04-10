@crud
Feature: Employee Management
  As an authenticated user
  I want to manage employees
  So that I can maintain the employee directory

  Background:
    Given the application is running
    And I am logged in as "admin" with password "password"
    And the employee list is empty

  @smoke
  Scenario: View empty employee list
    When I navigate to the employee list page
    Then I should see "No employees found."

  @smoke
  Scenario: Add a new employee
    When I click the "+ Add Employee" button
    And I fill in "Name" with "John Doe"
    And I fill in "Email" with "john@example.com"
    And I fill in "Position" with "Developer"
    And I submit the employee form
    Then I should see a success message "Employee added successfully!"
    And I should see "John Doe" in the employee table

  Scenario: Add employee with missing name does not submit
    When I click the "+ Add Employee" button
    And I fill in "Email" with "noname@test.com"
    And I fill in "Position" with "Dev"
    And I submit the employee form
    Then I should not see "Employee added successfully!" in the employee table

  Scenario: View employee details dialog
    Given an employee exists with name "Jane Smith", email "jane@test.com", position "Designer"
    When I click the "View" button for "Jane Smith"
    Then I should see the employee details dialog
    And the dialog should show name "Jane Smith"
    And the dialog should show email "jane@test.com"
    And the dialog should show position "Designer"

  Scenario: Edit an existing employee
    Given an employee exists with name "Edit Me", email "edit@test.com", position "Tester"
    When I click the "Edit" button for "Edit Me"
    And I change "Name" to "Updated Name"
    And I submit the update form
    Then I should see a success message "Employee updated successfully!"
    And I should see "Updated Name" in the employee table

  @smoke
  Scenario: Delete an employee
    Given an employee exists with name "Delete Me", email "delete@test.com", position "Temp"
    When I click the "Delete" button for "Delete Me"
    And I confirm the deletion
    Then I should see a success message "Employee deleted successfully!"
    And I should not see "Delete Me" in the employee table

  Scenario: Cancel deletion keeps employee in table
    Given an employee exists with name "Keep Me", email "keep@test.com", position "Perm"
    When I click the "Delete" button for "Keep Me"
    And I cancel the deletion
    Then I should see "Keep Me" in the employee table
