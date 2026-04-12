# Customer Testing Record

## A. Session Information

- Product: InventoryX
- Version / release: commit 42aad2345babe7ea0c5f51a36e7f33c8658e3116
- Date: 08/06/2024
- Test facilitator: Chai
- Participant name or ID: Kibrom
- Participant role: Both
- Business context: Cookie shop
- Test environment: MacOS
- Device / browser / platform: MacBook Pro, Chrome, InventoryX web app

## B. Instructions

- Use the task set that matches the participant’s role.
- If the participant is an **Owner**, complete the **Owner Tasks**.
- If the participant is an **Employee**, complete the **Employee Tasks**.
- After the task section, complete the feedback section.
- Finish with the SUS questionnaire and SUS score. The standard SUS questionnaire has 10 items with 5 response options
  and should be used unchanged from the source linked below. ([MeasuringU][1])

## C. Owner Tasks

### Task O1 — Access the correct business inventory

- Task description: Log in and access the correct business inventory.
- Expected outcome: The owner successfully accesses InventoryX and understands which business inventory is active.
- Actual outcome: Smooth login and clear inventory access.
- Completed: Yes
- Comments: Fast and efficient login and straightforward inventory access. No confusion about which business is active.

### Task O2 — Add, edit, and find inventory items

- Task description: Add a new item, edit one item, and search for an item by name.
- Expected outcome: The owner can add, update, and find inventory items without confusion.
- Actual outcome: confusion where to find the edit button and how to edit an item. Search works well and category filter is useful.
- Completed: Partly
- Comments: Edit hard to find and use.

### Task O3 — Manage stock correctly

- Task description: Increase stock, decrease stock, and try an invalid update that would make stock negative.
- Expected outcome: Valid stock changes work correctly, and negative stock is blocked.
- Actual outcome:
- Completed: Yes
- Comments: Nice!

### Task O4 — Review low-stock warnings

- Task description: Set a low-stock threshold for an item and check whether the item appears in the low-stock warning
  view when stock becomes low. Then adjust stock so the item is no longer at or below the threshold.
- Expected outcome: The owner can identify items that need action before they run out.
- Actual outcome: Low-stock warning works well and is easy to understand.
- Completed: Yes.
- Comments: usseful for keeping track of inventory and preventing stockouts.

### Task O5 — Manage employees and permissions

- Task description: Invite an employee and verify that sensitive actions remain owner-only.
- Expected outcome: The owner can invite employees, and restricted actions are protected.
- Actual outcome: Employee invitation works well, and permissions are correctly enforced.
- Completed: Yes
- Comments: Smooth

## D. Employee Tasks

### Task E1 — Access assigned inventory

- Task description: Log in and access the assigned business inventory.
- Expected outcome: The employee can access the correct inventory for the business.
- Actual outcome:
- Completed: No
- Comments:

### Task E2 — Search for an item and update stock

- Task description: Search for an item by name and update stock after a sale or other stock change.
- Expected outcome: The employee can find items quickly and update stock correctly.
- Actual outcome:
- Completed: No
- Comments:

### Task E3 — Attempt restricted item actions

- Task description: Try to perform actions that should be restricted to the owner, such as adding an item or changing
  the price.
- Expected outcome: The employee is prevented from performing actions restricted to the owner role.
- Actual outcome:
- Completed: Yes
- Comments: Warings should be more clear and seperates from other messages as bullet points.

### Task E4 — Verify restricted access to admin functions

- Task description: Attempt to access owner-only functions such as employee management or other sensitive settings.
- Expected outcome: The employee is prevented from accessing restricted areas and sensitive functions.
- Actual outcome:
- Completed: No
- Comments:

## E. Feedback

### Features

- Did InventoryX provide the functions you needed to complete your tasks?
- Which feature was most useful?
- Which feature was missing or unclear?
- Comments:

### Usability

- Was the system easy to understand and use?
- Was it easy to find items and update stock?
- Were warnings and messages clear?
- Comments:

### Business Fit

- Would InventoryX be useful in your business or daily work?
- Would it reduce manual work such as stock counting or spreadsheet tracking?
- Would you trust the system in real operation?
- Comments: Only if i own an alike jessica cookie shop, where i have status on inventory on screen instead of doing it manually. I would like to have a more clear edit item function, but otherwise it is very useful and easy to use.

## F. Main Issues Found

### Issue 1

- Description: UI confusion when modifying stock. It enclear and difficult to see.
- Severity: High
- Related task: InventoryItem Related Tasks.
- Suggested improvement: Make it clearer and easier to find buttons.

## G. SUS Questionnaire

### Response options

- 1 = Strongly disagree
- 2 = Disagree
- 3 = Neutral
- 4 = Agree
- 5 = Strongly agree

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

- Q1:5
- Q2:3
- Q3:5 Better than SAP
- Q4:1
- Q5:5
- Q6:2
- Q7:4 Very easy to learn and use.
- Q8:2
- Q9:5 evrything is clear.
- Q10:1

### SUS score

- Participant SUS score: 87.5
- Notes: The participant foud the system is very useful to use in managing inventory.

## H. Final Summary

- Overall result: Good!
- Main strengths: Easy to use and learn, clear inventory access, useful low-stock warnings, smooth employee management.
- Main weaknesses: Edit item function is hard to find and use.
- Recommended improvements before next release: Make the edit item function more visible and easier to use.
- Would the participant use InventoryX in practice?
