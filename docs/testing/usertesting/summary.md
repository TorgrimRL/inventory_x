# Customer Testing Summary - Inventory X
Overall, the system demonstrates good usability and learnability, but several improvement areas were identified. 

A total of 10 user tests were conducted. Most participants were able to complete key tasks such as searching for items, updating stock and managing inventory without prior training. 

The tests were conducted across different versions of the system, meaning some features were still under development. This influenced how certain features were used and evaluated. 

## SUS Scores 
SUS scores ranged from 45 to 92.5, with an average of **78.75**. 
This indicates generally good usability, although some issues negatively affected certain user experiences. 

## Key Findings 

### Strengths 
- Strong core functionality (search, stock updates, item management)
- High learnability and generally intuitive interface 
- Live search and sorting were especially appreciated 
- Considered relevant and useful for small businesses

### Main Weaknesses 
#### 1. Critical access control issue
- Employees were able to add items, which should be restricted to owners

#### 2. Unclear low-stock functionality
- Confusion between threshold and filtering logic, making the feature unintuitive to use

#### 3. Navigation, structure and discoverability
- Difficulty finding items page, edit functions, stock log
- Dashboard lacked clear shortcuts to important actions
- Unclear distinction between system navigation and inventory actions
- Some account actions were unintuitively placed (e.g., logout and "forgot password")

#### 4. UI and feedback
- Information overload in some areas, especially filters
- Error messages were not always clearly visible and sometimes required scrolling
- Limited feedback during actions such as login, saving and loading
- Some unclear interactions (e.g., stock controls) and inconsistent wording

## Suggested improvements
Based on the findings, the following improvements could be considered:

#### 1. Fix role-based permission issues
- Ensure employees cannot perform owner-only actions such as adding items.

#### 2. Simplify low-stock threshold and filtering
- Improve or simplify filtering related to low-stock
- Improve naming and remove confusing elements such as unclear reset values

#### 3. Improve navigation and structure
- Add clearer entry points to the items page from the dashboard
- Clearer separation between system navigation and inventory actions

#### 4. Improve UI clarity and feedback
- Make sure error messages are clearly visible
- Simplify filters and reduce information overload
- Provide clearer feedback during system actions 

#### 5. Enhance usability details
- Allow direct input of stock values
- Improve discoverability of features like "Item History & Logs"

## Improvements Implemented Based on User Testing
Based on the findings from the user tests, several improvements were implemented:

- Fixed permission issue where employees could add items (PR `#259`)
- Low-stock threshold filter was renamed to "Stock filter (<=)" (PR `#290`)
- The toggle used to activate the stock filter was renamed from "Low stock only" to "Activate stock filter" (PR `#296`)
- The stock filter behavior was aligned with key metrics to improve consistency: key metrics no longer change when the filter is not activated, and low-stock items are now based on each item's own threshold (PR `#298`)
- Item History & Logs was moved to a dedicated action button with tooltip for improved discoverability (PR `#287`)
- "Forgot password" was moved from the navigation bar to the login flow for better placement (PR `#293`)
- Log out was moved from the navigation bar to a user profile dropdown menu (PR `#282`)

## Business Fit
Most participants stated that the system would be useful in practice and could reduce manual work. However, the system still felt somewhat unfinished and required manual data entry, reducing efficiency gains. 

## Conclusion 
The customer testing shows that Inventory X has good overall usability and strong core functionality, supported by an average SUS score of 78.75. 
Most participants were able to complete key tasks successfully and the system was generally easy to learn and relevant for small business use.

At the same time, the testing revealed several important issues, particularly related to access control, low-stock functionality, navigation, and UI clarity. Some of these issues have already been addressed after testing, improving both system reliability and usability.

Despite these improvements, the system still has areas that should be further improved, especially in terms of usability details, feature clarity, and reducing manual work.