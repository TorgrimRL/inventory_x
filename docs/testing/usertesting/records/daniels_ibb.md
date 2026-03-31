# Customer Testing Record

## A. Session Information

* Product: InventoryX
* Version / release: Commit 6414565
* Date: 30.03.2026
* Test facilitator: Daniels
* Participant name or ID: Ibragim akhmed bekovich chamidov - Executive Inspector
* Participant role: Both
* Business context: Bookstore
* Test environment:
* Device / browser / platform: Windows 11, Google Chrome

## B. Instructions

* Use the task set that matches the participant’s role.
* If the participant is an **Owner**, complete the **Owner Tasks**.
* If the participant is an **Employee**, complete the **Employee Tasks**.
* After the task section, complete the feedback section.
* Finish with the SUS questionnaire and SUS score. The standard SUS questionnaire has 10 items with 5 response options
  and should be used unchanged from the source linked below. ([MeasuringU][1])

## C. Owner Tasks

### Task O1 — Access the correct business inventory

* Task description: Log in and access the correct business inventory.
* Expected outcome: The owner successfully accesses InventoryX and understands which business inventory is active.
* Actual outcome: Logged in with new account and was added to inventory as Owner
* Completed: Yes
* Comments: Logged in and found the correct inventory

### Task O2 — Add, edit, and find inventory items

* Task description: Add a new item, edit one item, and search for an item by name.
* Expected outcome: The owner can add, update, and find inventory items without confusion.
* Actual outcome: Updated Items with a little nagiavtion hurdle
* Completed: Yes
* Comments: 
    - Stuggled to find "items" page
    - Understood the search really quickly
    - Managed to easly delete item
    - Struggled to find logs for items
    - **Reset button didint work**


### Task O3 — Manage stock correctly

* Task description: Increase stock, decrease stock, and try an invalid update that would make stock negative.
* Expected outcome: Valid stock changes work correctly, and negative stock is blocked.
* Actual outcome: Worked
* Completed: Yes
* Comments: Didnt understand the "decrease/increase" interface

### Task O4 — Review low-stock warnings

* Task description: Set a low-stock threshold for an item and check whether the item appears in the low-stock warning
  view when stock becomes low. Then adjust stock so the item is no longer at or below the threshold.
* Expected outcome: The owner can identify items that need action before they run out.
* Actual outcome: Worked
* Completed: Yes
* Comments:
    - Filter for low stock was coutner intuativt
    - Tried navigation to dashboard using the logo but got taken to home page

### Task O5 — Manage employees and permissions

* Task description: Invite an employee and verify that sensitive actions remain owner-only.
* Expected outcome: The owner can invite employees, and restricted actions are protected.
* Actual outcome: Worked
* Completed: Yes
* Comments: 
    - Struggled to find the back to dash board

## D. Employee Tasks

### Task E1 — Access assigned inventory

* Task description: Log in and access the assigned business inventory.
* Expected outcome: The employee can access the correct inventory for the business.
* Actual outcome: Worked
* Completed: Yes
* Comments:

### Task E2 — Search for an item and update stock

* Task description: Search for an item by name and update stock after a sale or other stock change.
* Expected outcome: The employee can find items quickly and update stock correctly.
* Actual outcome: Worked
* Completed: Yes
* Comments:

### Task E3 — Attempt restricted item actions

* Task description: Try to perform actions that should be restricted to the owner, such as adding an item or changing
  the price.
* Expected outcome: The employee is prevented from performing actions restricted to the owner role.
* Actual outcome: Worked
* Completed: Yes
* Comments:

### Task E4 — Verify restricted access to admin functions

* Task description: Attempt to access owner-only functions such as employee management or other sensitive settings.
* Expected outcome: The employee is prevented from accessing restricted areas and sensitive functions.
* Actual outcome: Worked
* Completed: Yes
* Comments:

## E. Feedback

### Features

* Did InventoryX provide the functions you needed to complete your tasks?
    - yeah, i guess
* Which feature was most useful?
    - Add/Remove Stock
* Which feature was missing or unclear?
    - The filter reset button was confusing (tought the invetnroy would get wiped) and also didint work
    - Writing in the seach-by-name didnt clear search box


### Usability

* Was the system easy to understand and use?
    - Yeah, i guess. It took some tires to navigate.
    - Assumes the navigation header isint meant for inventory navigation and suggest the navigation buttons should be moved out of nav-bar to indicate a difference between site and inventory nagivation
* Was it easy to find items and update stock?
    - decrease and increase was a bit confusing, and things using posotive and negative numbers directly would be better
* Were warnings and messages clear?
    - Yeah, i guess
* Comments:

### Business Fit

* Would InventoryX be useful in your business or daily work?
    - For basic stock tracking yeah i guess
* Would it reduce manual work such as stock counting or spreadsheet tracking?
    - Oh yeah
* Would you trust the system in real operation?
    - Not really, especially since the reset button didnt work
    - Didnt appreciate night mode
* Comments:

## F. Main Issues Found

### Issue 1

* Description: Reset didint clear the search bar when clicked  "who made this?"
* Severity: High
* Related task:
* Suggested improvement: look into why the search box isint being clear

### Issue 2

* Description: Used logo to nagivate back to dashboard, but instead taken back to main page
* Severity: Medium
* Related task:
* Suggested improvement: Once logged in expected the logo to nagviage user back to dashboard

### Suggestions
* Add some kind of a public leaderboard which inventories can opt in to (maybe charitites that need do document public info ect)


## G. SUS Questionnaire

### Response options

* 1 = Strongly disagree
* 2 = Disagree
* 3 = Neutral
* 4 = Agree
* 5 = Strongly agree

### SUS items

Use the **official standard SUS items unchanged** from below. MeasuringU describes SUS as a 10-item questionnaire with 5
response options and also provides the standard scoring method.

SUS source link: [https://measuringu.com/sus/](https://measuringu.com/sus/)

1. I think that I would like to use this system frequently.
2. I found the system unnecessarily complex.
3. I thought the system was easy to use.
4. I think that I would need the support of a technical person to be able to use this system.
5. I found the various functions in this system were well integrated.
6. I thought there was too much inconsistency in this system.
7. I would imagine that most people would learn to use this system very quickly.
8. I found the system very cumbersome to use.
9. I felt very confident using the system.
10. I needed to learn a lot of things before I could get going with this system.

### SUS responses

* Q1: 3
* Q2: 2
* Q3: 3
* Q4: 3
* Q5: 4
* Q6: 4
* Q7: 4
* Q8: 2
* Q9: 4
* Q10: 4

### Example of SUS score calculation

#### Step 1: Adjust the scores

Odd-numbered items:

* Q1: 3 - 1 = 2
* Q3: 3 - 1 = 2
* Q5: 4 - 1 = 3
* Q7: 4 - 1 = 3
* Q9: 4 - 1 = 3

Even-numbered items:

* Q2: 2 - 2 = 0
* Q4: 3 - 2 = 1
* Q6: 4 - 2 = 2
* Q8: 2 - 2 = 0
* Q10: 4 - 2 = 2

#### Step 2: Add the adjusted values

2 + 2 + 3 + 3 + 3 + 0 + 1 + 2 + 0 + 2 = 18

#### Step 3: Multiply by 2.5

18 × 2.5 = 45

### SUS score

* Participant SUS score: 45
* Notes: This is a F i did things correctly

## H. Final Summary

* Overall result: Good
* Main strengths: Manages Inventory
* Main weaknesses: Featureless
* Recommended improvements before next release: More Features
* Would the participant use InventoryX in practice? Maybe
