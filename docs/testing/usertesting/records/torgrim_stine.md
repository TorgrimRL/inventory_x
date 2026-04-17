# Customer Testing Record

## A. Session Information

* **Product:** InventoryX
* **Version / release:** Commit `d205536edac3bc85f3bb12bcf58e9e48562350b4`
* **Date:** 9.04..2026
* **Test facilitator:** Torgrim
* **Participant name or ID:** Stine Kristoffersen
* **Participant role:** Owner and employee
* **Business context:** Cookie
* **Test environment:** isolated at work
* **Device / browser / platform:** MAC OS, firefox,

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
* **Actual outcome:** The participant was able to access the inventory and continue using the system.
* **Completed:** Yes
* **Comments:** None.

### Task O2 — Add, edit, and find inventory items

* **Task description:** Add a new item, edit one item, and search for an item by name.
* **Expected outcome:** The owner can add, update, and find inventory items without confusion.
* **Actual outcome:** The participant was able to find items and update stock, and generally found the system intuitive.
* **Completed:** Yes
* **Comments:**

    * The dashboard was useful, but it could include a more direct button to the item overview.
    * The participant suggested that some actions could be hidden behind menus or secondary actions to reduce clutter
      such as KPI and category.
    * The participant also suggested that category management could fit naturally inside add/edit item flows.

### Task O3 — Manage stock correctly

* **Task description:** Increase stock, decrease stock, and try an invalid update that would make stock negative.
* **Expected outcome:** Valid stock changes work correctly, and negative stock is blocked.
* **Actual outcome:** The participant was able to work with stock controls, but did not immediately understand the
  increase/decrease stock interaction.
* **Completed:** Yes
* **Comments:**

    * The participant did not initially understand the increase/decrease inventory section, although this may partly be
      because she did not have prior experience with inventory systems.

### Task O4 — Review low-stock warnings

* **Task description:** Set a low-stock threshold for an item and check whether the item appears in the low-stock
  warning view when stock becomes low. Adjust stock so it is no longer at or below the threshold.
* **Expected outcome:** The owner can identify items that need action before they run out.
* **Actual outcome:** The participant was able to work with low-stock functionality, but the threshold logic was not
  immediately clear.
* **Completed:** Partly
* **Comments:**

    * The participant first looked in the filter controls instead of the item settings when trying to work with the
      low-stock threshold.
    * KPI information could potentially be hidden by default and shown on demand to reduce visual noise.

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

    * Dashboard

* **Which feature was missing or unclear?**

    * A more direct path from the dashboard to the item overview

* **Comments:**

    * InventoryX provided the necessary functions.
    * The dashboard view could have buttons to the item overview.

### Usability

* **Was the system easy to understand and use?**

    * Yes

* **Was it easy to find items and update stock?**

    * Yes

* **Were warnings and messages clear?**

    * Yes

* **Comments:**

    * The system was easy to use and most features were intuitive.
    * It was easy to find items and update stock.
    * The participant did not initially understand the increase/decrease inventory section, but noted that this may be
      standard for inventory systems.

### Business Fit

* **Would InventoryX be useful in your business or daily work?**

    * Yes, in a business that keeps inventory

* **Would it reduce manual work such as stock counting or spreadsheet tracking?**

    * Yes

* **Would you trust the system in real operation?**

    * Probably yes

* **Comments:**

    * If the participant had a business where inventory was relevant, the system would be useful.
    * It seemed easier than using spreadsheets for tracking.

## F. Main Issues Found

### Issue 1

* **Description:** The low-stock threshold was not immediately understood as an item-level setting.
* **Severity:** Medium
* **Related task:** O4
* **Suggested improvement:** Clarify the relationship between the threshold on items and the low-stock filtering
  controls.

### Issue 2

* **Description:** The dashboard did not provide a direct enough path to the item overview.
* **Severity:** Medium
* **Related task:** O2
* **Suggested improvement:** Add a clearer or more prominent item overview shortcut on the dashboard.

### Issue 3

* **Description:** Some information and actions compete for attention on screen.
* **Severity:** Low
* **Related task:** O2, O4
* **Suggested improvement:** Consider hiding some actions behind menus and optionally collapsing KPI information until
  the user chooses to view it.

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

* Q2: 5 - 1 = 4
* Q4: 5 - 1 = 4
* Q6: 5 - 1 = 4
* Q8: 5 - 1 = 4
* Q10: 5 - 1 = 4

#### Step 2: Add the adjusted values

3 + 4 + 3 + 4 + 3 + 4 + 4 + 4 + 3 + 4 = **37**

#### Step 3: Multiply by 2.5

37 × 2.5 = **92.5**

### SUS score

* **Participant SUS score:** 92.5
* **Notes:** This indicates excellent perceived usability. The participant found the system intuitive overall, with only
  a few discoverability and clarity issues.

## H. Final Summary

* **Overall result:** The participant completed the tested owner tasks successfully and found the system easy to
  understand and use overall.

* **Main strengths:**

    * Easy-to-use dashboard
    * Straightforward item updates
    * Good overall learnability
    * High confidence and very high SUS score

* **Main weaknesses:**

    * Low-stock threshold behavior was not immediately obvious
    * Dashboard-to-items navigation could be more direct
    * Some information and controls could be better prioritized or hidden until needed

* **Recommended improvements before next release:**

    * Clarify low-stock threshold setup versus filtering
    * Add a clearer shortcut from the dashboard to the item overview
    * Consider collapsing KPI content or secondary actions to reduce clutter
    * Review where category management belongs in the item workflow

* **Would the participant use InventoryX in practice?** Yes, likely in a relevant business context