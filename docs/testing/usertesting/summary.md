# Customer Testing Summary - Inventory X
A total of 10 user tests were conducted across small business context. Most participants were able to complete key tasks such as searching for items, updating stock and managing inventory. 

Overall, the system appears easy to learn and use, but several improvement areas were identified. 

## SUS Scores 
SUS scores ranged from 45 to 92.5, with an average of **78,75**. 
This indicates generally good usability, though some issues negatively affected certain user experiences. 

## Key Findings 

### Strenghts 
- Simple and effective core functionality (search, stock updates, item management)
- High learnability and generally intuitive interface 
- Live search and sorting were especially appreciated 
- Considered relevant and useful for small businesses

### Main Weaknesses 
1. Critical access control issue
    - Employees were able to add items (shoud be restricted to owners)

2. Unclear low-stock functionality
    - Confusion between threshold and filter
    - Not intuitive to understand or use

3. Navigation and structure
    - Difficulty finding items page, edit functions, stock log
    - Dashboard lacks clear shortcuts to important actions

4. UI and feedback issues
    - Too much information in some areas (especially filters)
    - Error message not always clearly visible
    - Some unclear interactions (e.g., stock controls)


## Suggested improvements
Based on the findings, the following improvements could be considered:

1.	**Role-based permission issues**
    - Ensure that employees cannot perform owner-only actions such as adding items. This issue appeared in multiple tests and affects system trust.

2.	**Low-stock threshold and filtering cofusion**
    - Improve or simplify filtering related to low-stock
    - Remove confusing elements such as unclear reset values

3.	**Improve navigation and structure**
    - Add clearer entry points to the items page from the dashboard
    - Better separate system navigation from inventory actions

4.	**Improve UI clarity and feedback**
    - Make sure error messages are clearly visible
    - Simplify filters and reduce information overload

5.	**Enhance usability details**
    - Allow direct input of stock values
    - Improve discoverability of features like "Item History & Logs"

## Improvements Implemented After Testing
Based on the findings from the user tests, several improvements were implemented:

- The issue where employees could add items was fixed in pull request `#259`. 

- Low-stock threshold filter was renamed to "Stock filter (<=)" in pull request `#290`. "Low stock only" was renamed to "Activate stock filter" in pull request `#296`.

- The Item History & Logs was moved to a dedicated action button with tooltip for improved discoverability in pull request `#287`.

## Business Fit
Most participants stated that the system would be useful in practice and could reduce manual work.However, the system still felt somewhat unfinished and required manual data entry, reducing efficiency gains. 

## Conclusion 
The customer testing shows that InventoryX has good overall usability and strong core functionality, supported by an average SUS score of 78.75. 
Most participants were able to complete key tasks successfully, and the system was generally perceived as easy to learn and relevant for small business use.

At the same time, the testing revealed several important issues, particularly related to access control, low-stock functionality, navigation, and UI clarity. Some of these issues have already been addressed after testing, improving both system reliability and usability.

Despite these improvements, the system still has areas that could be further improved, especially in terms of usability details, feature clarity, and reducing manual work.
