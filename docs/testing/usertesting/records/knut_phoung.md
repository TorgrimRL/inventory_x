# Customer Testing Record

## A. Session Information

* **Product:** InventoryX
* **Version / release:** Commit `d436a92bbd2938a67e529b033a25f9b5520771ee`
* **Date:** 14.04.2026
* **Test facilitator:** Torgrim
* **Participant name or ID:** Knut Phoung
* **Participant role:** Owner and Employee
* **Business context:** Small retail business
* **Test environment:** Guided user test
* **Device / browser / platform:** Laptop, Chrome

## B. Instructions

* Use the task set that matches the participant’s role.
* If the participant is an **Owner**, complete the **Owner Tasks**.
* If the participant is an **Employee**, complete the **Employee Tasks**.
* After the task section, complete the feedback section.
* Finish with the SUS questionnaire and SUS score. The standard SUS questionnaire has 10 items with 5 response options
  and should be used unchanged from the source linked below.

## C. Owner Tasks

### Task O1 — Access the correct business inventory

* **Task description:** Log in and access the correct business inventory.
* **Expected outcome:** The owner successfully accesses InventoryX and understands which business inventory is active.
* **Actual outcome:** The participant logged in and found the correct inventory without much trouble.
* **Completed:** Yes
* **Comments:** The forgot password placement felt a bit strange in the navigation.

### Task O2 — Add, edit, and find inventory items

* **Task description:** Add a new item, edit one item, and search for an item by name.
* **Expected outcome:** The owner can add, update, and find inventory items without confusion.
* **Actual outcome:** The participant added and edited an item, and search worked well.
* **Completed:** Yes
* **Comments:** Search was easy to understand. Edit worked fine once the participant was in the right place.

### Task O3 — Manage stock correctly

* **Task description:** Increase stock, decrease stock, and try an invalid update that would make stock negative.
* **Expected outcome:** Valid stock changes work correctly, and negative stock is blocked.
* **Actual outcome:** The participant managed valid stock changes and understood that negative stock was blocked.
* **Completed:** Yes
* **Comments:** It was not obvious at first where to find stock log.

### Task O4 — Review low-stock warnings

* **Task description:** Set a low-stock threshold for an item and check whether the item appears in the low-stock warning
  view when stock becomes low. Then adjust stock so the item is no longer at or below the threshold.
* **Expected outcome:** The owner can identify items that need action before they run out.
* **Actual outcome:** The participant set a threshold and saw the low-stock status. Dashboard was useful for this.
* **Completed:** Yes
* **Comments:** The dashboard felt useful and gave a quick overview.

### Task O5 — Manage item categories

* **Task description:** Try creating a new category, adding that to some item.
* **Expected outcome:** The owner can manage categories and categorise items.
* **Actual outcome:** The participant created a category and assigned it to items after a little exploration.
* **Completed:** Yes
* **Comments:** Categories were useful, but it would feel more natural to manage them closer to the item flow.

### Task O6 — Use dashboard overview

* **Task description:** Review the dashboard and use it to understand stock status and inventory overview.
* **Expected outcome:** The owner can use dashboard information to get a quick overview of the business inventory.
* **Actual outcome:** The participant found the dashboard useful and easy to read.
* **Completed:** Yes
* **Comments:** Useful overview, especially for low stock and key numbers.

### Task O7 — Manage employees and permissions

* **Task description:** Invite an employee and verify that sensitive actions remain owner-only.
* **Expected outcome:** The owner can invite employees, and restricted actions are protected.
* **Actual outcome:** The participant found employee management and understood the permission idea.
* **Completed:** Yes
* **Comments:** This part seemed straightforward.

## D. Employee Tasks

### Task E1 — Access assigned inventory

* **Task description:** Log in and access the assigned business inventory.
* **Expected outcome:** The employee can access the correct inventory for the business.
* **Actual outcome:** The participant accessed the assigned inventory without help.
* **Completed:** Yes
* **Comments:** Clear enough.

### Task E2 — Search for an item and update stock

* **Task description:** Search for an item by name and update stock after a sale or other stock change.
* **Expected outcome:** The employee can find items quickly and update stock correctly.
* **Actual outcome:** The participant found an item and updated stock without much trouble.
* **Completed:** Yes
* **Comments:** Search works well.

### Task E3 — Attempt restricted item actions

* **Task description:** Try to perform actions that should be restricted to the owner, such as adding an item or changing the price.
* **Expected outcome:** The employee is prevented from performing actions restricted to the owner role.
* **Actual outcome:** The participant understood that some actions were restricted.
* **Completed:** Yes
* **Comments:** Restrictions were mostly understandable.

### Task E4 — Verify restricted access to admin functions

* **Task description:** Attempt to access owner-only functions such as employee management or other sensitive settings.
* **Expected outcome:** The employee is prevented from accessing restricted areas and sensitive functions.
* **Actual outcome:** The participant did not get access to owner-only functions.
* **Completed:** Yes
* **Comments:** Worked as expected.

## E. Feedback

### Features

* **Did InventoryX provide the functions you needed to complete your tasks?**
    - Yes, mostly
* **Which feature was most useful?**
    - Dashboard and item search
* **Which feature was missing or unclear?**
    - Stock log was hard to find
* **Comments:** Categories are useful, but some things could be grouped more clearly.

### Usability

* **Was the system easy to understand and use?**
    - Yes, mostly
* **Was it easy to find items and update stock?**
    - Yes
* **Were warnings and messages clear?**
    - Mostly yes
* **Comments:** Forgot password felt oddly placed. Some navigation took a little getting used to.

### Business Fit

* **Would InventoryX be useful in your business or daily work?**
    - Yes
* **Would it reduce manual work such as stock counting or spreadsheet tracking?**
    - Yes, to a degree
* **Would you trust the system in real operation?**
    - Mostly yes
* **Comments:** For a small business this looks useful, especially for getting an overview.

## F. Main Issues Found

### Issue 1

* **Description:** Forgot password appears in a strange place in the interface.
* **Severity:** Medium
* **Related task:** O1
* **Suggested improvement:** Move forgot password closer to the login flow instead of having it feel like regular navigation.

### Issue 2

* **Description:** Stock log was difficult to find.
* **Severity:** Medium
* **Related task:** O3
* **Suggested improvement:** Make stock log easier to discover from the item list or edit flow.

### Issue 3

* **Description:** Categories and some actions feel a little separated from where the participant expected them.
* **Severity:** Low
* **Related task:** O5
* **Suggested improvement:** Bring category actions closer to add/edit item flows.

### Issue 4

* **Description:** Some navigation and action placement takes time to learn for users with limited inventory-system experience.
* **Severity:** Low
* **Related task:** O2, O6
* **Suggested improvement:** Make the main actions more grouped and obvious.

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
* **Q2:** 2
* **Q3:** 5
* **Q4:** 2
* **Q5:** 4
* **Q6:** 2
* **Q7:** 5
* **Q8:** 1
* **Q9:** 4
* **Q10:** 2

### SUS score calculation

#### Step 1: Adjust the scores

**Odd-numbered items:**

* Q1: 4 - 1 = 3
* Q3: 5 - 1 = 4
* Q5: 4 - 1 = 3
* Q7: 5 - 1 = 4
* Q9: 4 - 1 = 3

**Even-numbered items:**

* Q2: 5 - 2 = 3
* Q4: 5 - 2 = 3
* Q6: 5 - 2 = 3
* Q8: 5 - 1 = 4
* Q10: 5 - 2 = 3

#### Step 2: Add the adjusted values

3 + 4 + 3 + 4 + 3 + 3 + 3 + 4 + 3 + 3 = 33

#### Step 3: Multiply by 2.5

33 × 2.5 = 82.5

### SUS score

* **Participant SUS score:** 82.5
* **Notes:** A good result. The participant generally found the system useful and understandable, with a few small points of friction.

## H. Final Summary

* **Overall result:** Good
* **Main strengths:** Search, dashboard overview, low-stock visibility, categories
* **Main weaknesses:** Stock log discoverability, forgot password placement, some navigation choices
* **Recommended improvements before next release:** Improve discoverability of stock log, move forgot password to a more expected place, and group related actions more clearly
* **Would the participant use InventoryX in practice?** Yes
