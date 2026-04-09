# Customer Testing Record

## A. Session Information

* Product: InventoryX
* Version / release: Commit `909c135`
* Date: 06.04.2026
* Test facilitator: Lotte
* Participant name or ID: Sander
* Participant role: Both
* Business context: Cookie shop
* Test environment: 
* Device / browser / platform: Google Chrome on Mac

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
* Actual outcome: Logged in with a new account as an owner and accessed the correct business inventory
* Completed: Yes 
* Comments:

### Task O2 — Add, edit, and find inventory items

* Task description: Add a new item, edit one item, and search for an item by name.
* Expected outcome: The owner can add, update, and find inventory items without confusion.
* Actual outcome: The participant added, updated and found inventory items without confusion
* Completed: Yes 
* Comments: The filter is somewhat difficult to understand as it displays a large amount of information when searching for items, including details about all items in the inventory at the same time

### Task O3 — Manage stock correctly

* Task description: Increase stock, decrease stock, and try an invalid update that would make stock negative.
* Expected outcome: Valid stock changes work correctly, and negative stock is blocked.
* Actual outcome: The participant successfully made valid stock changes, while negative stock was correctly blocked
* Completed: Yes 
* Comments: The new stock value should be visible before saving, making it easier to see the updated value

### Task O4 — Review low-stock warnings

* Task description: Set a low-stock threshold for an item and check whether the item appears in the low-stock warning
  view when stock becomes low. Then adjust stock so the item is no longer at or below the threshold.
* Expected outcome: The owner can identify items that need action before they run out.
* Actual outcome: The participant identified low-stock items and resolved them by updating stock levels after confirming them in the table and dashboard
* Completed: Yes 
* Comments: Again, the filter showing the low-stock threshhold was confusing

### Task O5 — Manage employees and permissions

* Task description: Invite an employee and verify that sensitive actions remain owner-only.
* Expected outcome: The owner can invite employees, and restricted actions are protected.
* Actual outcome: The participant successfully invited an employee without issues
* Completed: Yes 
* Comments:

## D. Employee Tasks

### Task E1 — Access assigned inventory

* Task description: Log in and access the assigned business inventory.
* Expected outcome: The employee can access the correct inventory for the business.
* Actual outcome: The participant logged in as an employee and accessed the correct inventory
* Completed: Yes 
* Comments:

### Task E2 — Search for an item and update stock

* Task description: Search for an item by name and update stock after a sale or other stock change.
* Expected outcome: The employee can find items quickly and update stock correctly.
* Actual outcome: The participant found the items quickly and was able to update the stock without issues
* Completed: Yes 
* Comments: It should be more clean and organized where items could be found on the dashboard, instead of relying only on the navigation bar

### Task E3 — Attempt restricted item actions

* Task description: Try to perform actions that should be restricted to the owner, such as adding an item or changing
  the price.
* Expected outcome: The employee is prevented from performing actions restricted to the owner role.
* Actual outcome: The participant could not perform actions restricted to the owner role, except for adding items
* Completed: Yes 
* Comments: If it is an owner-only thing, it should be fixed

### Task E4 — Verify restricted access to admin functions

* Task description: Attempt to access owner-only functions such as employee management or other sensitive settings.
* Expected outcome: The employee is prevented from accessing restricted areas and sensitive functions.
* Actual outcome: The participant was prevented from accessing owner-only functions
* Completed: Yes 
* Comments: 

## E. Feedback

### Features

* Did InventoryX provide the functions you needed to complete your tasks? Yes
* Which feature was most useful? The list of items and to be able to search for items
* Which feature was missing or unclear? The search/filter as it shows too much information at the same time
* Comments: 

### Usability

* Was the system easy to understand and use? Yes
* Was it easy to find items and update stock? Yes
* Were warnings and messages clear? Yes
* Comments: 

### Business Fit

* Would InventoryX be useful in your business or daily work? Yes
* Would it reduce manual work such as stock counting or spreadsheet tracking? Yes
* Would you trust the system in real operation? Yes
* Comments:

## F. Main Issues Found

### Issue 1

* Description: The filter section provides too much information at once 
* Severity: High
* Related task: Task O2 and O4
* Suggested improvement: There should be a button to review more details about the inventory or less information should be shown. Information about all inventory items should not be displayed when searching for specific items

### Issue 2

* Description: Employees have access to add items
* Severity: High
* Related task: Task E3
* Suggested improvement: The "add item" button should be removed or access to it should be restricted for employees


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

* Q1: 4
* Q2: 2
* Q3: 5
* Q4: 1
* Q5: 4
* Q6: 1
* Q7: 4
* Q8: 2
* Q9: 5
* Q10: 1

### Example of SUS score calculation

Example responses from one participant:

* Q1 = 4
* Q2 = 2
* Q3 = 5
* Q4 = 2
* Q5 = 4
* Q6 = 2
* Q7 = 4
* Q8 = 1
* Q9 = 5
* Q10 = 2

#### Step 1: Adjust the scores

Odd-numbered items:

* Q1: 4 - 1 = 3
* Q3: 5 - 1 = 4
* Q5: 4 - 1 = 3
* Q7: 4 - 1 = 3
* Q9: 5 - 1 = 4

Even-numbered items:

* Q2: 5 - 2 = 3
* Q4: 5 - 1 = 4
* Q6: 5 - 1 = 4
* Q8: 5 - 2 = 3
* Q10: 5 - 1 = 4

#### Step 2: Add the adjusted values

3 + 4 + 3 + 3 + 4 + 3 + 4 + 4 + 3 + 4 = 35

#### Step 3: Multiply by 2.5

35 × 2.5 = 87.5

### SUS score

* Participant SUS score: 87.5
* Notes: The system achieved a SUS score of 87.5, indicating high usability

## H. Final Summary

* Overall result: 
- The participant completed all tasks successfully
* Main strengths: 
- Easy to use and understand
- Tasks such as adding, updating and searching for items work smoothly
- Role-based access control is mostly effective
* Main weaknesses:
- The filter/search functionality is difficult to understand and presents too much information at once
- The dashboard does not clearly shows where to find items, making navigation less intuitive
- Some role restrictions are not fully enforced
- Lack of immediate feedback when updating stock (new value not visible before saving)
* Recommended improvements before next release:
- Simplify the filter or reduce the amount of information displayed
- Improve dashboard structure and visibility
- Show updated stock before saving
- Fix role-based permission issues
* Would the participant use InventoryX in practice? Yes 
