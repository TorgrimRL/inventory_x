# Customer Testing Record

## A. Session Information

* **Product:** InventoryX
* **Version / release:** Commit `635c71c`
* **Date:** 25.03.2026
* **Test facilitator:** Torgrim
* **Participant name or ID:** Keyvan
* **Participant role:** Both Owner and Employee
* **Business context:** Bookstore / Cookie shop
* **Test environment:** In front of the team on big screen
* **Device / browser / platform:** Firefox on Mac

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
* **Actual outcome:** The participant was able to access the correct inventory.
* **Completed:** Partly
* **Comments:**

    * “Create new” should be used instead of “Register new.”
    * The user expected to be redirected immediately after creating an inventory.
    * A loading screen or clearer feedback would help during waiting time.

### Task O2 — Add, edit, and find inventory items

* **Task description:** Add a new item, edit one item, and search for an item by name.
* **Expected outcome:** The owner can add, update, and find inventory items without confusion.
* **Actual outcome:** The participant was able to complete the task.
* **Completed:** Yes
* **Comments:**

    * There could be more visible “Add item” entry points on the dashboard, especially since users are redirected there.
    * KPI elements could be made bolder or more visually prominent.

### Task O3 — Manage stock correctly

* **Task description:** Increase stock, decrease stock, and try an invalid update that would make stock negative.
* **Expected outcome:** Valid stock changes work correctly, and negative stock is blocked.
* **Actual outcome:** The participant was able to perform valid stock changes, and invalid negative updates were
  blocked.
* **Completed:** Yes
* **Comments:**

    * The price description/input loses layout or falls out of place when the field is empty and out of focus.
    * This issue appeared in Firefox.

### Task O4 — Review low-stock warnings

* **Task description:** Set a low-stock threshold for an item and check whether the item appears in the low-stock
  warning view when stock becomes low. Adjust stock so it is no longer at or below the threshold.
* **Expected outcome:** The owner can identify items that need action before they run out.
* **Actual outcome:** The participant was able to identify low-stock items, but the threshold/filter behavior was
  somewhat unclear.
* **Completed:** Yes
* **Comments:**

    * The filter button was confusing in relation to what counts as the low-stock threshold.

### Task O5 — Manage employees and permissions

* **Task description:** Invite an employee and verify that sensitive actions remain owner-only.
* **Expected outcome:** The owner can manage employee access, and restricted actions are protected.
* **Actual outcome:** The participant was able to invite an employee and confirm that sensitive actions were restricted.
* **Completed:** Yes
* **Comments:** None.

## D. Employee Tasks

### Task E1 — Access assigned inventory

* **Task description:** Log in.
* **Expected outcome:** The employee can access the correct inventory for the business.
* **Actual outcome:** The participant successfully logged in and accessed the assigned inventory.
* **Completed:** Yes
* **Comments:**

    * The participant wanted to press **Enter** after typing the password.
    * The request appears to be sent, but there is no clear feedback between pressing Enter and the redirect after the
      backend responds.

### Task E2 — Search for an item and update stock

* **Task description:** Search for an item by name and update stock after a sale or other stock change.
* **Expected outcome:** The employee can find items quickly and update stock correctly.
* **Actual outcome:** The participant was able to search for items and update stock.
* **Completed:** Yes
* **Comments:** None.

### Task E3 — Attempt modifying items

* **Task description:** Try to perform actions that should be restricted, such as adding an item or changing the price.
* **Expected outcome:** The employee is prevented from performing actions restricted to the owner role.
* **Actual outcome:** The participant was not allowed to perform restricted actions.
* **Completed:** Yes
* **Comments:**

    * The interface should show more clearly which user is currently logged in.

### Task E4 — Verify restricted access

* **Task description:** Attempt to access actions that should be restricted to the owner, such as employee management or
  other sensitive settings.
* **Expected outcome:** The employee is prevented from performing restricted actions.
* **Actual outcome:** The participant was prevented from accessing restricted areas.
* **Completed:** Yes
* **Comments:** None.

## E. Feedback

### Features

* **Did InventoryX provide the functions you needed to complete your tasks?**

    * Yes

* **Which feature was most useful?**

    * Overview of all items with the useful functions

* **Which feature was missing or unclear?**

    * Date of change
    * Logs of changes that happen
    * Useful graphs / analytics

* **Comments:**

    * Very nice

### Usability

* **Was the system easy to understand and use?**

    * Some wordings were weird

* **Was it easy to find items and update stock?**

    * Yes

* **Were warnings and messages clear?**

    * Yes, very

* **Comments:**

    * Very nice

### Business Fit

* **Would InventoryX be useful in your business or daily work?**

    * Yes

* **Would it reduce manual work such as stock counting or spreadsheet tracking?**

    * Yes, it would provide peace of mind by enabling a more structured way of working

* **Would you trust the system in real operation?**

    * In its current state, no. It still looks bare-bones and somewhat amateurish.

* **Comments:**

    * Integration with an accounting system would be a game changer

## F. Main Issues Found

### Issue 1

* **Description:** Lack of clear feedback during login and redirect actions
* **Severity:** Low
* **Related task:** O1, E1
* **Suggested improvement:** Add a loading indicator or progress feedback during login and inventory creation/redirect
  flows.

### Issue 2

* **Description:** Some wording and labels are unclear or unnatural
* **Severity:** Medium
* **Related task:** O1, General usability feedback
* **Suggested improvement:** Replace unclear wording such as “Register new” with clearer alternatives like “Create new,”
  and review text labels throughout the interface.

### Issue 3

* **Description:** Low-stock filtering and threshold behavior are not fully intuitive
* **Severity:** Medium
* **Related task:** O4
* **Suggested improvement:** Clarify the relationship between threshold values and low-stock filters, and improve the UI
  text or visual explanation.

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
* **Q4:** 2
* **Q5:** 4
* **Q6:** 1
* **Q7:** 5
* **Q8:** 1
* **Q9:** 4
* **Q10:** 2

### SUS score calculation

#### Step 1: Adjust the scores

**Odd-numbered items:**

* Q1: 4 - 1 = 3
* Q3: 4 - 1 = 3
* Q5: 4 - 1 = 3
* Q7: 5 - 1 = 4
* Q9: 4 - 1 = 3

**Even-numbered items:**

* Q2: 5 - 1 = 4
* Q4: 5 - 2 = 3
* Q6: 5 - 1 = 4
* Q8: 5 - 1 = 4
* Q10: 5 - 2 = 3

#### Step 2: Add the adjusted values

3 + 4 + 3 + 3 + 3 + 4 + 4 + 4 + 3 + 3 = **34**

#### Step 3: Multiply by 2.5

34 × 2.5 = **85.0**

### SUS score

* **Participant SUS score:** 85.0
* **Notes:** This indicates very good perceived usability, although the participant still expressed concerns about
  visual polish, trust, and production readiness.

## H. Final Summary

* **Overall result:** The participant completed nearly all tasks successfully as both Owner and Employee. The system
  appears usable and understandable overall, with strong potential for practical use.

* **Main strengths:**

    * Easy item overview
    * Straightforward stock updates
    * Clear warnings and messages
    * Good learnability and high SUS score

* **Main weaknesses:**

    * Some unclear wording in the interface
    * Lack of feedback during login/redirect/loading states
    * Limited trust in the current visual and functional maturity of the system
    * Missing features such as change logs, timestamps, and integrations

* **Recommended improvements before next release:**

    * Improve wording and consistency in labels and actions
    * Add loading indicators and clearer system feedback
    * Clarify low-stock filter/threshold behavior
    * Improve overall visual polish and professionalism
    * Consider adding change history, timestamps, graphs, and accounting-system integration

* **Would the participant use InventoryX in practice?** Maybe

