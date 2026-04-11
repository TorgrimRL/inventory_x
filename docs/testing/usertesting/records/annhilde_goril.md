# Customer Testing Record

## A. Session Information

* **Product:** InventoryX
* **Version / release:** Commit `909c135`
* **Date:** 06.04.2026
* **Test facilitator:** Ann-Hilde
* **Participant name or ID:** Gøril Albertsen
* **Participant role:** Both Owner and Employee
* **Business context:** Bookstore
* **Test environment:**
* **Device / browser / platform:** Chrome on Mac

## B. Instructions

* Use the task set that matches the participant’s role.
* If the participant is an **Owner**, complete the **Owner Tasks**.
* If the participant is an **Employee**, complete the **Employee Tasks**.
* After the task section, complete the feedback section.
* Finish with the SUS questionnaire and SUS score. The standard SUS questionnaire has 10 items with 5 response options
  and should be used unchanged from the source linked below. ([MeasuringU][1])

## C. Owner Tasks

### Task O1 — Access the correct business inventory

* **Task description:** Log in and access the correct business inventory.
* **Expected outcome:** The owner successfully accesses InventoryX and understands which business inventory is active.
* **Actual outcome:** The participant logged in as an owner and correctly identified which business inventory to access. 
* **Completed:** Yes
* **Comments:**

### Task O2 — Add, edit, and find inventory items

* **Task description:** Add a new item, edit one item, and search for an item by name.
* **Expected outcome:** The owner can add, update, and find inventory items without any confusion.
* **Actual outcome:** The participant successfully added a new item, edited the name of the item, and searched for an item without any confusion. 
* **Completed:** Yes
* **Comments:** Liked that the search worked instantly while typing and did not require pressing the search buttton.

### Task O3 — Manage stock correctly

* **Task description:** Increase stock, decrease stock, and try an invalid update that would make stock negative.
* **Expected outcome:** Valid stock changes work correctly, and negative stock is blocked.
* **Actual outcome:** The participant was able to increase and decrease stock and understood how the system handled invalid input. Negative stock updates were prevented as expected.
* **Completed:** Yes
* **Comments:**
    - Would like the option to enter stock value directly in a text field, instead of only using increase/decrease controls. 
    - Also suggesting that allowing negative stock could be useful in some cases (e.g., if mistakes happen), as long as the system provides a clear warning. 

### Task O4 — Review low-stock warnings

* **Task description:** Set a low-stock threshold for an item and check whether the item appears in the low-stock warning
  view when stock becomes low. Then adjust stock so the item is no longer at or below the threshold.
* **Expected outcome:** The owner can identify items that need action before they run out.
* **Actual outcome:** The participant was able to set a low-stock threshold and identify the item as low stock in the table. Then navigated to the dashboard, checked that item appeared in low-stock warning view, and updated the stock so it was no longer below the threshold. 
* **Completed:** Yes
* **Comments:**
    - Liked the low stock status tag in the table
    - Low-stock threshold search/filter was confusing
    - Reset value (5) was confusing

### Task O5 — Manage employees and permissions

* **Task description:** Invite an employee and verify that sensitive actions remain owner-only.
* **Expected outcome:** The owner can invite employees, and restricted actions are protected.
* **Actual outcome:** The participant was able to quickly find where to invite employees and completed the task without issues. 
* **Completed:** Yes
* **Comments:**

## D. Employee Tasks

### Task E1 — Access assigned inventory

* **Task description:** Log in and access the assigned business inventory.
* **Expected outcome:** The employee can access the correct inventory for the business.
* **Actual outcome:** The participant was able to log in as an employee and quickly access the correct business inventory.
* **Completed:** Yes
* **Comments:**

### Task E2 — Search for an item and update stock

* **Task description:** Search for an item by name and update stock after a sale or other stock change.
* **Expected outcome:** The employee can find items quickly and update stock correctly.
* **Actual outcome:** The participant was able to search for an item and update the stock without any issues.
* **Completed:** Yes
* **Comments:**

### Task E3 — Attempt restricted item actions

* **Task description:** Try to perform actions that should be restricted to the owner, such as adding an item or changing
  the price.
* **Expected outcome:** The employee is prevented from performing actions restricted to the owner role.
* **Actual outcome:** The participant was able to add a new item, even though this action should be restricted to the owner. When attempting to change the price, the participant was correctly prevented and understood the system message. 
* **Completed:** Partly
* **Comments:** The restriction on adding items did not work as expected and should be fixed.

### Task E4 — Verify restricted access to admin functions

* **Task description:** Attempt to access owner-only functions such as employee management or other sensitive settings.
* **Expected outcome:** The employee is prevented from accessing restricted areas and sensitive functions.
* **Actual outcome:** The participant was prevented from accessing owner-only functions as expected. 
* **Completed:** Yes
* **Comments:**

## E. Feedback

### Features

* **Did InventoryX provide the functions you needed to complete your tasks?**
    - Yes
* **Which feature was most useful?**
    - Sorting options in the table, searching for items and the live search while typing
* **Which feature was missing or unclear?**
    - The low-stock threshold search/filter and reset value (5) was unclear
    - Missed a status tag "out of stock" and a way to filter by it. This was especially noticeable since "out of stock" is shown in the KPI summary
    - Also missed an overview with out of stock items on Dashboard
* **Comments:**

### Usability

* **Was the system easy to understand and use?**
    - Overall yes
* **Was it easy to find items and update stock?**
    - Yes 
* **Were warnings and messages clear?**
    - Yes, the info and error messages were clear
* **Comments:**
    - The ordering of the KPI summary felt confusing. A suggested order: total units in stock, item count, low stock, out of stock, and total inventory value 
    - The average price metric was not considered very useful, especially when item prices can vary widely
    - However, the participant liked the key metrics overview and the information based on filter
    - A suggested order of the columns in the table was: Stock, low stock threshold, status, price, action. Maybe have the option to customize the order

### Business Fit

* **Would InventoryX be useful in your business or daily work?**
    - Yes 
* **Would it reduce manual work such as stock counting or spreadsheet tracking?**
    - In the systems current state, you would have to register everything manually, so the answer is no
* **Would you trust the system in real operation?**
    - Yes 
* **Comments:**

## F. Main Issues Found

### Issue 1

* **Description:** Employees are able to add new items, even though this action should be restricted to the owner. 
* **Severity:** High
* **Related task:** Task E3
* **Suggested improvement:** Restrict this action so that only the owner can add new items.

### Issue 2

* **Description:** Low stock threshold search and filter functionality was unclear
* **Severity:** High
* **Related task:** Task O4
* **Suggested improvement:**
    - Did not make sense to search by threshold values, and a search field for stock amount may be more useful. The toggle could instead be used to filter items with the "low stock" status. Reset should be set to 0, "-" or nothing. 

### Issue 3

* **Description:** "Out of stock" status tag and out of stock overview on Dashboard is missing
* **Severity:** High
* **Related task:** Task O4 
* **Suggested improvement:**
    - Add "out of stock" status tag in the table and a way to filter/sort by it
    - Add a clear overview of out of stock items on Dashboard

### Issue 4

* **Description:** Order of columns in the table 
* **Severity:** Medium
* **Related task:** Task O2 
* **Suggested improvement:** Customized order or change the order. Suggested ordering: Stock, low stock threshold, status, price, action.

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

* **Q1:** 4
* **Q2:** 4
* **Q3:** 4
* **Q4:** 1
* **Q5:** 3
* **Q6:** 4
* **Q7:** 5
* **Q8:** 3
* **Q9:** 4
* **Q10:** 1

### SUS score calculation

#### Step 1: Adjust the scores

Odd-numbered items:

* Q1: 4 - 1 = 3
* Q3: 4 - 1 = 3
* Q5: 3 - 1 = 2
* Q7: 5 - 1 = 4
* Q9: 4 - 1 = 3

Even-numbered items:

* Q2: 5 - 4 = 1
* Q4: 5 - 1 = 4
* Q6: 5 - 4 = 1
* Q8: 5 - 3 = 2
* Q10: 5 - 1 = 4

#### Step 2: Add the adjusted values

3 + 3 + 2 + 4 + 3 + 1 + 4 + 1 + 2 + 4 = **27**

#### Step 3: Multiply by 2.5

27 × 2.5 = **67.5**

### SUS score

* **Participant SUS score:** 67.5
* **Notes:** A SUS score of 67.5 indicates acceptable usability, but with clear room for improvement. The system is generally usable, but some inconsistencies and unclear features reduce the overall user experience.

## H. Final Summary

* **Overall result:** The participant completed all tasks. Most tasks worked well, but some usability issues and one critical permission error were found.

* **Main strengths:**
    - The system is easy to learn and use, with clear navigation
    - Core functionality such as adding items, updating stock, and searching works well
    - Live search and table sorting were particularly appreciated
    - Feedback messages and warnings were clear and understandable

* **Main weaknesses:**
    - A critical issue was found where employees were able to add items, which should be restricted to owners
    - The low-stock threshold filter and related functionality were unclear and confusing
    - Missing “out of stock” status and overview reduced visibility of important inventory states
    - KPI order were not intuitive and average price were not seen as useful
    - The system currently requires all inventory data to be entered manually, which reduces its advantages compared to spreadsheet tools like Excel

* **Recommended improvements before next release:**
    - Fix permission handling to ensure employees cannot perform restricted actions such as adding items
    - Improve the low-stock filtering logic and make it more intuitive for users
    - Add “out of stock” status, filtering options, and a clear dashboard overview
    - Improve the structure and relevance of KPI elements on the dashboard
    - Consider adding a direct input field for stock values to improve efficiency
    - Consider adding features that reduce manual work, such as import functionality or integrations

* **Would the participant use InventoryX in practice?**
    - Yes
