# Customer Testing Record

## A. Session Information

* Product: InventoryX
* Version / release: 1f4bb25
* Date: 09.04.2026
* Test facilitator: Daniels
* Participant name or ID: Jama
* Participant role: Both
* Business context: Cookie shop
* Test environment: 
* Device / browser / platform: Windows 11, plain google chrome

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
* Actual outcome: Registered and logged into
* Completed: Yes
* Comments: 

### Task O2 — Add, edit, and find inventory items

* Task description: Add a new item, edit one item, and search for an item by name.
* Expected outcome: The owner can add, update, and find inventory items without confusion.
* Actual outcome: completed task
* Completed: Yes
* Comments: Tried making a new buissness... Got confused with dashboard low item stock and tried adjusting it thinking it was item edit. After finding the item page, editing item went fine. Adding item also went fine.

### Task O3 — Manage stock correctly

* Task description: Increase stock, decrease stock, and try an invalid update that would make stock negative.
* Expected outcome: Valid stock changes work correctly, and negative stock is blocked.
* Actual outcome: completed task
* Completed: Yes
* Comments:

### Task O4 — Review low-stock warnings

* Task description: Set a low-stock threshold for an item and check whether the item appears in the low-stock warning
  view when stock becomes low. Then adjust stock so the item is no longer at or below the threshold.
* Expected outcome: The owner can identify items that need action before they run out.
* Actual outcome: Didint end up using dashboard and just looked trough the list of items
* Completed: Parially
* Comments: 

### Task O5 — Manage item categories

* Task description: Try creating a new category, adding that to some item
* Expected outcome: The owner can manage categories and categorise items
* Actual outcome: completed task
* Completed: Yes
* Comments: Tried filtering for categories, eventually find manage categories added the category eventually after being a little confused.

### Task O6 — Manage employees and permissions

* Task description: Invite an employee and verify that sensitive actions remain owner-only.
* Expected outcome: The owner can invite employees, and restricted actions are protected.
* Actual outcome: Managed to find the manage members page and removed employees
* Completed: Yes
* Comments: 

## D. Employee Tasks

### Task E1 — Access assigned inventory

* Task description: Log in and access the assigned business inventory.
* Expected outcome: The employee can access the correct inventory for the business.
* Actual outcome:
* Completed: Yes
* Comments: Found it easly (was owner before)

### Task E2 — Search for an item and update stock

* Task description: Search for an item by name and update stock after a sale or other stock change.
* Expected outcome: The employee can find items quickly and update stock correctly.
* Actual outcome: Completed
* Completed: Yes
* Comments:

### Task E3 — Attempt restricted item actions

* Task description: Try to perform actions that should be restricted to the owner, such as adding an item or changing
  the price.
* Expected outcome: The employee is prevented from performing actions restricted to the owner role.
* Actual outcome: Wasnt able Edit
* Completed: Yes
* Comments:

### Task E4 — Verify restricted access to admin functions

* Task description: Attempt to access owner-only functions such as employee management or other sensitive settings.
* Expected outcome: The employee is prevented from accessing restricted areas and sensitive functions.
* Actual outcome: Didint fint it
* Completed: Yes
* Comments:

## E. Feedback

### Features

* Did InventoryX provide the functions you needed to complete your tasks?
    - Yeah, i think so
* Which feature was most useful?
    - Dark mode toggle
* Which feature was missing or unclear?
    - Inventories page
* Comments: 

### Usability

* Was the system easy to understand and use?
    - Yeah, yeah it was
* Was it easy to find items and update stock?
    - Yeah
* Were warnings and messages clear?
    - Yeah, Yeah
* Comments: 

### Business Fit

* Would InventoryX be useful in your business or daily work?
    - Uuuuh yeah yeah yeah
* Would it reduce manual work such as stock counting or spreadsheet tracking?
    - Maybe
* Would you trust the system in real operation?
    - Honeslty, no
* Comments:

## F. Main Issues Found

### Issue 1

* Description: Thinking the search fields shouldve been below the metrics, in genral item page very messy.
* Severity: Medium
* Related task:
* Suggested improvement: Suggests that should be able to see much more items to begin with and not the search and metric ontop


### Issue 2

* Description: The order of navigation buttons were confusing
* Severity: High
* Related task:
* Suggested improvement: More seperation between nav bar buttons and inventory-related buttons. Confusing what is inventory realted with site navigation and inventory navigation.

### Issue 3

* Description: Logout button is easly accessible and accidentally logout
* Severity: Medium
* Related task:
* Suggested improvement: Maybe seperate them out of nav

### Issue 4

* Description: Make active inventory more clear and visable
* Severity: Medium
* Related task:
* Suggested improvement:

### Issue 5

* Description: The colors of the text in darkmode blen in too much with the background
* Severity: High
* Related task:
* Suggested improvement: Add more contrast

### Issue 6

* Description: Decrease the number items you see at once in items page
* Severity: High
* Related task:
* Suggested improvement: Maybe do it customizable for a person

### Issue 7

* Description: Why forget password is accessible by default in nav
* Severity: High
* Related task:
* Suggested improvement: Should be in login screen

### Issue 8

* Description: Login is small letters, Sign up is all caps
* Severity: High
* Related task:
* Suggested improvement:

### Issue 8

* Description: Login and signup UI is messy
* Severity: Medium
* Related task:
* Suggested improvement:


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

* Q1: 2
* Q2: 2
* Q3: 4
* Q4: 1
* Q5: 4
* Q6: 4
* Q7: 4
* Q8: 2
* Q9: 4 
* Q10: 2

### Example of SUS score calculation

Odd-numbered items (Score - 1):

* Q1: 2 - 1 = 1
* Q3: 4 - 1 = 3
* Q5: 4 - 1 = 3
* Q7: 4 - 1 = 3
* Q9: 4 - 1 = 3

Even-numbered items (5 - Score):

* Q2: 5 - 2 = 3
* Q4: 5 - 1 = 4
* Q6: 5 - 4 = 1
* Q8: 5 - 2 = 3
* Q10: 5 - 2 = 3

#### Step 2: Add the adjusted values

1 + 3 + 3 + 4 + 3 + 1 + 3 + 3 + 3 + 3 = 27

#### Step 3: Multiply by 2.5

27 × 2.5 = 67.5

### SUS score

* Participant SUS score: C
* Notes:

## H. Final Summary

* Overall result: It okay, has potetntial
* Main strengths: Color scheme
* Main weaknesses: UI
* Recommended improvements before next release: The named issues above
* Would the participant use InventoryX in practice? Maybe
