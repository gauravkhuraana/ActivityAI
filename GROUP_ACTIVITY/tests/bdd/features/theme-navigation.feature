@navigation
Feature: Navigation
  As a logged-in user
  I want to navigate between pages using the menu
  So that I can access all parts of the application

  Background:
    Given the application is running
    And I am logged in as "admin" with password "password"

  Scenario: Navigate to Add Employee page via menu link
    When I click "Add Employee" in the navigation bar
    Then I should be on the "/form" page

  Scenario: Navigate to Employee List page via menu link
    Given I am on the "/form" page
    When I click "Employee List" in the navigation bar
    Then I should be on the "/list" page

  Scenario: Logoff button clears session and redirects
    When I click the Logoff button
    Then I should be redirected to the login page
    And my session should be cleared

  @auth
  Scenario: Unauthenticated user is blocked from /list after logoff
    When I click the Logoff button
    And I try to access "/list"
    Then I should be redirected to the login page
