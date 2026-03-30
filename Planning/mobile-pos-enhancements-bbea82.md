# Mobile POS App Enhancement Plan

Implementation plan for adding order detail views, expense management improvements, and authentication to the mobile Point of Sale application.

## Overview

This plan addresses 5 key enhancements to improve the mobile POS app's functionality:
1. Waiter order detail view with sorting
2. Expense management for Utilities and Staff Costs tabs
3. Persistent daily expense templates
4. Summary menu authentication
5. Summary waiter sales detail view

---

## Feature 1: Waiter Order Detail View

**Current State:**
- `WaitersView.js` shows waiter statistics and lists orders when expanded
- Orders show basic info: order number, customer name, total, and items breakdown
- No sorting by order number currently implemented

**Implementation:**
- **File:** `c:\projects\Point_of_sale\mobile\src\components\WaitersView.js`
- **Changes:**
  - Add sorting to paid and unpaid order lists by order number (ascending)
  - The order details are already displayed (order number, items, totals, customer name)
  - Just need to sort the arrays before rendering

**Code Changes:**
```javascript
// In WaitersView.js, update the getWaiterStats function
// Sort paidOrdersList and unpaidOrdersList by orderNumber
paidOrdersList.sort((a, b) => a.orderNumber.localeCompare(b.orderNumber))
unpaidOrdersList.sort((a, b) => a.orderNumber.localeCompare(b.orderNumber))
```

---

## Feature 2: Expense Management - Utilities & Staff Costs

**Current State:**
- `ExpensesViewNew.js` already implements the template-based expense system
- Food Supplies tab works with quantity × price inputs
- Utilities and Staff Costs tabs exist but need verification of functionality

**Implementation:**
- **File:** `c:\projects\Point_of_sale\mobile\src\components\ExpensesViewNew.js`
- **Current Implementation Analysis:**
  - The component already has category tabs for Food Supplies, Utilities, and Staff Costs
  - Templates are loaded from `expenseTemplateService`
  - Staff Costs dynamically uses waiter names as templates
  - Each template supports either single amount (Ksh) or quantity × unitCost fields
  - Auto-calculation and display of totals is already implemented
  - Category totals are shown at top and bottom

**Verification Needed:**
- Check if Utilities templates exist in the database seed
- Ensure templates are properly configured with correct units
- Test that the auto-save functionality works for all categories

**Code Changes:**
- Review `c:\projects\Point_of_sale\mobile\src\services\expenseTemplateService.js` to ensure Utilities templates are seeded
- If missing, add default Utilities templates (e.g., Electricity, Water, Gas, Internet)

---

## Feature 3: Persistent Daily Expense Templates

**Current State:**
- `ExpensesViewNew.js` already implements persistence of template inputs
- Inputs are stored in `templateInputs` state
- Day change detection clears inputs at midnight
- Auto-save functionality adds expenses when both fields are filled

**Implementation:**
- **Files:** 
  - `c:\projects\Point_of_sale\mobile\src\components\ExpensesViewNew.js`
  - `c:\projects\Point_of_sale\mobile\src\services\expenseTemplateService.js`

**Enhancement Needed:**
- Add ability to edit expense names (currently template names are fixed)
- Add ability to edit quantities after expense is created
- Consider adding an "Edit Template" modal for customizing template names

**Code Changes:**
1. Add edit functionality to the expense list items
2. Create modal for editing expense details (description, quantity, unit cost)
3. Update the expense service to support updates
4. Allow inline editing of template names (save to database)

---

## Feature 4: Summary Menu Authentication

**Current State:**
- No authentication system exists in the mobile app
- Summary view is accessible to anyone
- No user roles or permissions system

**Implementation:**
- **Files to Create/Modify:**
  - Create: `c:\projects\Point_of_sale\mobile\src\components\LoginModal.js`
  - Create: `c:\projects\Point_of_sale\mobile\src\database\models\User.js`
  - Create: `c:\projects\Point_of_sale\mobile\src\services\authService.js`
  - Modify: `c:\projects\Point_of_sale\mobile\src\screens\HomeScreen.js`
  - Modify: `c:\projects\Point_of_sale\mobile\src\database\schema.js`

**Implementation Steps:**
1. **Database Schema:**
   - Add `users` table with fields: id, username, password_hash, role, is_active
   - Seed default super admin user (username: "admin", password: configurable)

2. **Authentication Service:**
   - Create `authService.js` with login/logout functions
   - Implement simple password hashing (bcrypt or similar)
   - Store authenticated user in AsyncStorage
   - Check user role (super_admin, admin, user)

3. **Login Modal:**
   - Create modal component with username/password fields
   - Show when user tries to access Summary view without authentication
   - Validate credentials against database
   - Store session token/user info

4. **HomeScreen Integration:**
   - Check authentication status before showing Summary view
   - Show login modal if not authenticated or not super admin
   - Add logout option in header when authenticated

5. **Security Considerations:**
   - Use AsyncStorage for session persistence
   - Implement session timeout (optional)
   - Hash passwords before storing
   - Add "Remember me" option

---

## Feature 5: Summary Waiter Sales Detail View

**Current State:**
- `SummaryView.js` shows waiter sales statistics in cards
- Each waiter card shows: name, total revenue, paid revenue, unpaid revenue, order counts
- Cards are not clickable - no drill-down functionality

**Implementation:**
- **File:** `c:\projects\Point_of_sale\mobile\src\components\SummaryView.js`

**Changes Needed:**
1. Make waiter sales cards clickable (TouchableOpacity)
2. Add expandable section or modal to show order details
3. Display same order information as in WaitersView (order number, items, totals, customer name)
4. Sort orders by order number (ascending)

**Code Changes:**
```javascript
// Add state for expanded waiter
const [expandedWaiter, setExpandedWaiter] = useState(null);

// Make waiter card touchable
<TouchableOpacity 
  style={styles.waiterSalesCard}
  onPress={() => setExpandedWaiter(expandedWaiter === waiter.name ? null : waiter.name)}
>

// Add expanded section showing order details
{expandedWaiter === waiter.name && (
  <View style={styles.waiterOrdersExpanded}>
    {/* Show paid orders */}
    {/* Show unpaid orders */}
    {/* Each with full order details like in WaitersView */}
  </View>
)}
```

**Order Details to Display:**
- Order number
- Customer name (if available)
- Timestamp
- Items list (name × quantity = price)
- Total amount
- Status indicator
- Action buttons (Mark Paid, Print Receipt) for unpaid orders

---

## Implementation Priority

1. **Feature 1** (Waiter order sorting) - Simple, quick win
2. **Feature 5** (Summary waiter detail view) - Moderate complexity, high value
3. **Feature 2** (Utilities/Staff Costs verification) - Verify existing functionality
4. **Feature 3** (Persistent expenses with editing) - Moderate complexity
5. **Feature 4** (Authentication) - Most complex, requires new infrastructure

---

## Technical Considerations

### Database Migrations
- Feature 4 requires new `users` table
- May need to update schema version and run migrations

### Dependencies
- Authentication may require: `bcryptjs` or `react-native-bcrypt`
- AsyncStorage: `@react-native-async-storage/async-storage` (likely already installed)

### Testing Requirements
- Test authentication flow thoroughly
- Test expense template persistence across day changes
- Test order sorting with various order numbers
- Test waiter detail expansion/collapse

### UI/UX Considerations
- Login modal should be simple and intuitive
- Order details should match existing design patterns
- Expense editing should be inline where possible
- Loading states for authentication checks

---

## Authentication Details (UPDATED)

**Remote Database Integration:**
- Fetch users from the web backend PostgreSQL database (`users` table)
- Filter users with `role = 'ADMIN'` from the UserRole enum
- The web database schema shows:
  - User model with fields: id, email, name, password (hashed), role, phone, isActive
  - UserRole enum: ADMIN, MANAGER, WAITER, CASHIER, CHEF, BARTENDER
  - Only users with role='ADMIN' should have access to Summary view

**Implementation Approach:**
1. Create API endpoint in web backend to fetch ADMIN users
2. Mobile app calls this endpoint to authenticate
3. Store authenticated session in AsyncStorage
4. Validate ADMIN role before showing Summary view

## Expense Template Structure (FROM HTML FILE)

**Food Supplies (22 items):**
1. Unga Ugali - 2 KG
2. Unga Mandazi - 2 KG
3. Unga Chapati - 2 KG
4. Rice - 1 KG
5. Sugar - 1 KG
6. Milk - 1 Litre
7. Tea leaves - Cost
8. Beef - 1 KG
9. Pilau Masala - Cost
10. Soy Sauce - Cost
11. Bulb Onions - Cost
12. Sukuma - Cost
13. Cabbage - Cost
14. Spinach - Cost
15. Managu - Cost
16. Carrot - Cost
17. Ginger - Cost
18. Garlic - Cost
19. Tomatoes - Cost
20. Ring Onions - Cost
21. Salt - Cost
22. Pili Pili - Cost

**Utilities (5 items):**
1. Electricity Bill (Tokens) - Cost
2. Charcoal - Cost
3. Cooking Gas - Cost
4. Packaging - Cost
5. Soap - Cost

**Staff Costs (8 staff members):**
1. Austine - Cost
2. Peter - Cost
3. Nyambura - Cost
4. Noora - Cost
5. Jasmine - Cost
6. Mercy - Cost
7. Charity - Cost
8. Metrine - Cost

**Note:** Items with "Cost" unit should use single amount field (Ksh). Items with weight/volume units (KG, Litre) should use quantity × unit price fields.

---

## Files to Modify

### Existing Files
1. `c:\projects\Point_of_sale\mobile\src\components\WaitersView.js` - Add order sorting
2. `c:\projects\Point_of_sale\mobile\src\components\SummaryView.js` - Add waiter detail view
3. `c:\projects\Point_of_sale\mobile\src\components\ExpensesViewNew.js` - Verify/enhance utilities
4. `c:\projects\Point_of_sale\mobile\src\screens\HomeScreen.js` - Add authentication check
5. `c:\projects\Point_of_sale\mobile\src\database\schema.js` - Add users table
6. `c:\projects\Point_of_sale\mobile\src\services\expenseTemplateService.js` - Verify utilities templates

### New Files to Create
1. `c:\projects\Point_of_sale\mobile\src\components\LoginModal.js` - Authentication UI
2. `c:\projects\Point_of_sale\mobile\src\database\models\User.js` - User model
3. `c:\projects\Point_of_sale\mobile\src\services\authService.js` - Authentication logic
4. `c:\projects\Point_of_sale\mobile\src\database\migrations\addUsersTable.js` - Database migration

---

## Estimated Effort

- **Feature 1:** 30 minutes (simple sorting)
- **Feature 2:** 1 hour (verification + potential fixes)
- **Feature 3:** 2-3 hours (editing functionality)
- **Feature 4:** 4-6 hours (full authentication system)
- **Feature 5:** 2-3 hours (expandable detail view)

**Total:** 10-14 hours of development time
