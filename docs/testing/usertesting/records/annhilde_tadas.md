# Customer Testing Record

## A. Session Information

* **Product:** InventoryX
* **Version / release:** Commit `909c135`
* **Date:** 06.04.2026
* **Test facilitator:** Ann-Hilde
* **Participant name or ID:** Tadas Babrauskas
* **Participant role:** Both Owner and Employee
* **Business context:** Cookie shop
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
* **Actual outcome:** The participant logged in as an owner and understood which business inventory to select. 
* **Completed:** Yes 
* **Comments:** 

### Task O2 — Add, edit, and find inventory items

* **Task description:** Add a new item, edit one item, and search for an item by name.
* **Expected outcome:** The owner can add, update, and find inventory items without confusion.
* **Actual outcome:** Added new item and updated its name and price without any problems. 
Found the search field quickly and understood how to use it
* **Completed:** Yes
* **Comments:**

### Task O3 — Manage stock correctly

* **Task description:** Increase stock, decrease stock, and try an invalid update that would make stock negative.
* **Expected outcome:** Valid stock changes work correctly, and negative stock is blocked.
* **Actual outcome:** 
    - Participant tried to increase/decrease stock by only clicking the "increase" and "decrease" buttons, then understood that the "save" button also had to be clicked. 

    - When updating stock to a negative value, the participant noticed an issue when the field turned red, but did not see the error message immediately since it was placed further down in the modal and required scrolling. 
* **Completed:** Yes
* **Comments:**

### Task O4 — Review low-stock warnings

* **Task description:** Set a low-stock threshold for an item and check whether the item appears in the low-stock warning
  view when stock becomes low. Then adjust stock so the item is no longer at or below the threshold.
* **Expected outcome:** The owner can identify items that need action before they run out.
* **Actual outcome:** The participant quickly understood how to set the low-stock threshold via "Edit" modal and saw the status change to "low stock" in the table. The participant was able to adjust the stock so it was no longer below the threshold. 
* **Completed:** Yes
* **Comments:** The participant did not use the low-stock warning view on dashboard, but instead relied on the table to identify low-stock items. 

### Task O5 — Manage employees and permissions

* **Task description:** Invite an employee and verify that sensitive actions remain owner-only.
* **Expected outcome:** The owner can invite employees, and restricted actions are protected.
* **Actual outcome:** The participant quickly found how to invite an employee and completed the task without issues.
* **Completed:** Yes
* **Comments:**

## D. Employee Tasks

### Task E1 — Access assigned inventory

* **Task description:** Log in and access the assigned business inventory.
* **Expected outcome:** The employee can access the correct inventory for the business.
* **Actual outcome:** Logged in as an employee and accessed the correct inventory. 
* **Completed:** Yes
* **Comments:**

### Task E2 — Search for an item and update stock

* **Task description:** Search for an item by name and update stock after a sale or other stock change.
* **Expected outcome:** The employee can find items quickly and update stock correctly.
* **Actual outcome:** 
The participant was able to search for an item without any problems. 
When updating stock, the participant first clicked on the item name in the table, expecting to edit it from there. After a short time, the participant found the correct place to update stock. 
* **Completed:** Yes
* **Comments:** Minor confusion about where to update stock. 

### Task E3 — Attempt restricted item actions

* **Task description:** Try to perform actions that should be restricted to the owner, such as adding an item or changing the price.
* **Expected outcome:** The employee is prevented from performing actions restricted to the owner role.
* **Actual outcome:** The participant was able to add a new item, even though this action should be restricted to the owner. 
When trying to change the price, the participant clicked on the price field even though it was greyed out, but noticed the message and understood that this action was not allowed. 
* **Completed:** Partly
* **Comments:** Adding items was not correctly restricted for employees. 

### Task E4 — Verify restricted access to admin functions

* **Task description:** Attempt to access owner-only functions such as employee management or other sensitive settings.
* **Expected outcome:** The employee is prevented from accessing restricted areas and sensitive functions.
* **Actual outcome:** The participant tried to change the name and price of an item, but was not allowed to do so. The participant also confirmed that options "Manage members" and "Invite employee" were not visible on the dashboard.
* **Completed:** Yes
* **Comments:**

## E. Feedback

### Features

* **Did InventoryX provide the functions you needed to complete your tasks?**
    - Yes 
* **Which feature was most useful?**
    - Sorting items and searching for items by name. Liked that elements are highlighted when hovering over them, as it made the interface feel more interactive and easier to use.
* **Which feature was missing or unclear?**
    - Low stock threshold filter was unclear. 
    - The dashboard was missing more useful features. 
* **Comments:** It would be helpful if the selected sorting option was saved, so the user does not have to set it again when returning to the items page. 

### Usability

* **Was the system easy to understand and use?**
    - Yes, it was clear and easy to understand. 
* **Was it easy to find items and update stock?**
    - Yes
* **Were warnings and messages clear?**
    - Yes, but the warning about negative stock was not noticed immediately. 
* **Comments:**

### Business Fit

* **Would InventoryX be useful in your business or daily work?**
    - Yes, especially if you are a business owner with employees who need to manage and track inventory.
* **Would it reduce manual work such as stock counting or spreadsheet tracking?**
    - Yes, absolutely. 
* **Would you trust the system in real operation?**
    - Yes.
* **Comments:**

## F. Main Issues Found

### Issue 1

* **Description:** Employees are able to add new items, even though this action should be restricted to the owner. 
* **Severity:** High
* **Related task:** Task E3
* **Suggested improvement:** Restrict this action so that only the owner can add new items.

### Issue 2

* **Description:** Error message were not immediately visible in the edit modal and required scrolling to be noticed.
* **Severity:** Medium
* **Related task:** Task O3
* **Suggested improvement:** Display error messages closer to the input field so they are immediately visible. 

### Issue 3

* **Description:** The participant first clicked on the item name when trying to update stock, but then found the correct place. 
* **Severity:** Low 
* **Related task:** Task E2 
* **Suggested improvement:** No major improvements needed, maybe consider adding a shortcut/button in the modal that opens when clicking on an item, leading directly to the edit view. 

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
* **Q2:** 1
* **Q3:** 4
* **Q4:** 1
* **Q5:** 4
* **Q6:** 1
* **Q7:** 3
* **Q8:** 1
* **Q9:** 4
* **Q10:** 2

### SUS score calculation

#### Step 1: Adjust the scores

Odd-numbered items:

* Q1: 4 - 1 = 3
* Q3: 4 - 1 = 3
* Q5: 4 - 1 = 3
* Q7: 3 - 1 = 2
* Q9: 4 - 1 = 3

Even-numbered items:

* Q2: 5 - 1 = 4
* Q4: 5 - 1 = 4
* Q6: 5 - 1 = 4
* Q8: 5 - 1 = 4
* Q10: 5 - 2 = 3

#### Step 2: Add the adjusted values

3 + 3 + 3 + 2 + 3 + 4 + 4 + 4 + 4 + 3 = **33**

#### Step 3: Multiply by 2.5

33 × 2.5 = **82.5**

### SUS score

* **Participant SUS score:** 82.5
* **Notes:** This indicates high usability. The system is above average and falls within the top range of SUS. 

## H. Final Summary

* **Overall result:**

    The participant was able to complete almost all tasks successfully as both Owner and Employee. The system was easy to understand and use, with only minor usability issues observed. 

* **Main strengths:**
    - Easy to search for and manage items
    - Clear and intuitive interface with good visual feedback
    - Simple workflows for adding items, editing and updating stock
    - High usability score (SUS: 82.5)

* **Main weaknesses:**
    - Access control issue where employees can add items
    - Error messages were not immediately visible and required scrolling
    - Low-stock warning view were not clearly used or discovered
    - Low stock threshold filter was unclear. 
    - Minor confusion when updating stock location

* **Recommended improvements before next release:**
    - Fix permission issues so only owners can add new items
    - Make error messages more visible without requiring scrolling
    - Consider small usability improvements such as shortcuts or clearer action placement
    - Improve the low-stock filtering logic
    - Save user preferences (e.g., sorting) between sessions

* **Would the participant use InventoryX in practice?**
    - Yes
