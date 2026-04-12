# Customer Testing Record

## A. Session Information

* **Product:** InventoryX
* **Version / release:** Commit `d205536edac3bc85f3bb12bcf58e9e48562350b4`
* **Date:** 9.04.2026
* **Test facilitator:** Torgrim
* **Participant name or ID:** Eskil
* **Participant role:** Owner and Employee
* **Business context:** Bookstore
* **Test environment:** Isolated at work
* **Device / browser / platform:** mac OS, firefox,

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
* **Actual outcome:** The participant was able to access the inventory and continue to the relevant pages.
* **Completed:** Yes
* **Comments:** None.

### Task O2 — Add, edit, and find inventory items

* **Task description:** Add a new item, edit one item, and search for an item by name.
* **Expected outcome:** The owner can add, update, and find inventory items without confusion.
* **Actual outcome:** The participant found item editing and stock control easy, but reaching the items page was not
  intuitive at first.
* **Completed:** Yes
* **Comments:**

    * The participant wanted the ability to go directly to items from the dashboard.
    * At first, it was not intuitive that items were only available from the navbar.
    * The participant suggested that some actions could be placed behind menus or grouped more clearly.

### Task O3 — Manage stock correctly

* **Task description:** Increase stock, decrease stock, and try an invalid update that would make stock negative.
* **Expected outcome:** Valid stock changes work correctly, and negative stock is blocked.
* **Actual outcome:** The participant was able to update stock and found the stock controls helpful.
* **Completed:** Yes
* **Comments:**

    * The participant especially liked the dedicated increase/decrease stock buttons.

### Task O4 — Review low-stock warnings

* **Task description:** Set a low-stock threshold for an item and check whether the item appears in the low-stock
  warning view when stock becomes low. Adjust stock so it is no longer at or below the threshold.
* **Expected outcome:** The owner can identify items that need action before they run out.
* **Actual outcome:** The participant found the low-stock threshold feature useful, but threshold placement and
  discoverability could still be improved.
* **Completed:** Yes
* **Comments:**

    * The low-stock threshold was seen as one of the most useful features.
    * During testing, the participant initially looked toward filters rather than item properties when working with
      threshold-related behavior.

### Task O5 — Manage employees and permissions

* **Task description:** Invite an employee and verify that sensitive actions remain owner-only.
* **Expected outcome:** The owner can manage employee access, and restricted actions are protected.
* **Actual outcome:** Not tested in this session.
* **Completed:** No
* **Comments:** Not tested.

## D. Employee Tasks

Employee tasks were not part of this participant’s session.

## E. Feedback

### Features

* **Did InventoryX provide the functions you needed to complete your tasks?**

    * Yes

* **Which feature was most useful?**

    * The low-stock threshold

* **Which feature was missing or unclear?**

    * The ability to go straight to items from the dashboard

* **Comments:**

    * The inventory was easy to edit and control.
    * It was a nice touch with specific buttons for increasing and decreasing stock.

### Usability

* **Was the system easy to understand and use?**

    * Yes

* **Was it easy to find items and update stock?**

    * Yes, once the items page was found

* **Were warnings and messages clear?**

    * Yes

* **Comments:**

    * The system was quite intuitive to use.
    * Some shortcuts would improve it.
    * Items were only available in the navbar, which was not intuitive at first.
    * Once the participant found the items page, stock updates were easy to understand.

### Business Fit

* **Would InventoryX be useful in your business or daily work?**

    * Yes, in a store or similar business

* **Would it reduce manual work such as stock counting or spreadsheet tracking?**

    * Yes

* **Would you trust the system in real operation?**

    * Yes

* **Comments:**

    * It would be especially useful if it scaled well to scanners or phones.

## F. Main Issues Found

### Issue 1

* **Description:** Navigation from the dashboard to the items page was not direct enough.
* **Severity:** Medium
* **Related task:** O2
* **Suggested improvement:** Add a clearer button or shortcut from the dashboard to the item overview.

### Issue 2

* **Description:** The items page was initially hard to discover because it was only accessible through the navbar.
* **Severity:** Medium
* **Related task:** O2
* **Suggested improvement:** Improve information architecture or add more obvious entry points to item management.

### Issue 3

* **Description:** Low-stock threshold behavior was useful but not perfectly discoverable.
* **Severity:** Low
* **Related task:** O4
* **Suggested improvement:** Make it clearer that low-stock threshold settings belong to item configuration rather than
  filtering.

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
* **Q4:** 1
* **Q5:** 4
* **Q6:** 1
* **Q7:** 5
* **Q8:** 1
* **Q9:** 4
* **Q10:** 1

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
* Q4: 5 - 1 = 4
* Q6: 5 - 1 = 4
* Q8: 5 - 1 = 4
* Q10: 5 - 1 = 4

#### Step 2: Add the adjusted values

3 + 3 + 4 + 4 + 3 + 4 + 4 + 4 + 3 + 4 = **36**

#### Step 3: Multiply by 2.5

36 × 2.5 = **90.0**

### SUS score

* **Participant SUS score:** 90.0
* **Notes:** This indicates excellent perceived usability. The participant found the system intuitive overall, with the
  main improvement area being discoverability of core navigation.

## H. Final Summary

* **Overall result:** The participant completed the tested owner tasks successfully and viewed the system as intuitive
  and useful.

* **Main strengths:**

    * Easy stock editing and control
    * Helpful increase/decrease stock buttons
    * Useful low-stock threshold feature
    * Strong learnability and high SUS score

* **Main weaknesses:**

    * Dashboard did not provide a direct enough path to items
    * Items page was not immediately discoverable
    * Some threshold-related behavior could be clearer

* **Recommended improvements before next release:**

    * Add a direct dashboard shortcut to items
    * Improve discoverability of item management
    * Clarify low-stock threshold setup and behavior

* **Would the participant use InventoryX in practice?** Yes