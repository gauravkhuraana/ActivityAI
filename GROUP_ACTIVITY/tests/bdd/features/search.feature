@search
Feature: Employee Search and Filter
  As an authenticated user
  I want to search and filter employees
  So that I can quickly find specific employees

  Background:
    Given the application is running
    And I am logged in as "admin" with password "password"
    And the following employees exist:
      | name              | email              | position   |
      | Alice Wonderland  | alice@test.com     | PM         |
      | Bob Builder       | bob@test.com       | Engineer   |
      | Charlie Chaplin   | charlie@test.com   | Designer   |

  Scenario: Search by employee name
    When I type "Alice" in the search field
    Then I should see "Alice Wonderland" in the employee table
    And I should not see "Bob Builder" in the employee table
    And I should not see "Charlie Chaplin" in the employee table

  Scenario: Search by email
    When I type "bob@test.com" in the search field
    Then I should see "Bob Builder" in the employee table
    And I should not see "Alice Wonderland" in the employee table

  Scenario: Search by position
    When I type "Designer" in the search field
    Then I should see "Charlie Chaplin" in the employee table
    And I should not see "Alice Wonderland" in the employee table

  Scenario: Search with no matching results shows empty state
    When I type "NonExistentPerson" in the search field
    Then I should see "No employees found."

  Scenario: Clear search shows all employees
    When I type "Alice" in the search field
    And I clear the search field
    Then I should see "Alice Wonderland" in the employee table
    And I should see "Bob Builder" in the employee table
    And I should see "Charlie Chaplin" in the employee table
