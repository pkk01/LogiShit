# Customer Support System - Quick Integration Guide

## 🚀 What's Been Implemented

Your logiShift application now has a **complete customer support system** with:

- Support ticket management
- Support agent role with admin approval
- Internal notes system
- FAQ/Knowledge base
- Customer feedback & ratings
- Real-time notifications

---

## 📋 What You Need to Do

### Step 1: Update Your App.tsx Routes

Add these routes to your main App.tsx file:

```typescript
import SupportDashboard from './pages/SupportDashboard';
import SupportTicketForm from './components/SupportTicketForm';
import TicketDetailView from './components/TicketDetailView';
import SupportFAQ from './pages/SupportFAQ';
import SupportAgentRegister from './pages/SupportAgentRegister';
import AgentDashboard from './components/AgentDashboard';
import AdminSupportManagement from './pages/AdminSupportManagement';

// Inside your Router/Routes component:
<Route path="/support" element={<SupportDashboard />} />
<Route path="/support/tickets/:ticketId" element={<TicketDetailView />} />
<Route path="/support/faq" element={<SupportFAQ />} />
<Route path="/support-agent-register" element={<SupportAgentRegister />} />
<Route path="/agent/dashboard" element={<AgentDashboard />} />
<Route path="/admin/support" element={<AdminSupportManagement />} />
```

### Step 2: Update Your Navbar (Navigation.tsx or Navbar.tsx)

Add navigation links based on user role:

```typescript
const userRole = localStorage.getItem("role");

// In your navigation component JSX:
{
  userRole === "user" && (
    <Link to="/support" className="nav-link">
      Support
    </Link>
  );
}

{
  userRole === "support_agent" && (
    <Link to="/agent/dashboard" className="nav-link">
      My Tickets
    </Link>
  );
}

{
  userRole === "admin" && (
    <Link to="/admin/support" className="nav-link">
      Support Management
    </Link>
  );
}

// Public link (for non-logged-in users to register as agent)
<Link to="/support-agent-register" className="nav-link">
  Become an Agent
</Link>;
```

### Step 3: Create Support Agent Login Page Link

Add a login option for support agents (same login page, but link to agent register):

```typescript
// In Login.tsx or similar:
<p className="text-sm text-center mt-4">
  Want to join our support team?{" "}
  <Link to="/support-agent-register" className="text-blue-600 hover:underline">
    Register as Support Agent
  </Link>
</p>
```

### Step 4: Backend - Already Done ✅

- Models added to `core/models.py`
- Serializers added to `core/serializers.py`
- Views added to `core/views.py`
- URLs added to `core/urls.py`

**Nothing to change in backend!**

---

## 🎯 Key File Locations

### Backend Files (Already Updated)

- `LS_Backend/core/models.py` - 5 new models added
- `LS_Backend/core/serializers.py` - 7 new serializers added
- `LS_Backend/core/views.py` - 13 new view classes added
- `LS_Backend/core/urls.py` - 13 new URL patterns added

### Frontend Components (New Files Created)

```
LS_Frontend/src/
├── components/
│   ├── SupportTicketForm.tsx (Create tickets)
│   ├── CustomerTicketsList.tsx (View customer tickets)
│   ├── TicketDetailView.tsx (Ticket details + internal notes)
│   └── AgentDashboard.tsx (Support agent view)
└── pages/
    ├── SupportDashboard.tsx (Main support hub)
    ├── SupportFAQ.tsx (FAQ/Knowledge base)
    ├── SupportAgentRegister.tsx (Agent registration)
    └── AdminSupportManagement.tsx (Admin support overview)
```

---

## 🔐 User Roles & Permissions

### 1. Customer (role: 'user')

**Can:**

- Create support tickets
- View their own tickets
- View ticket status and updates
- Submit feedback (rating + comment) when ticket resolved
- Browse FAQ/Knowledge base
- Get notifications on ticket changes

**Links to:**

- `/support` - Main support dashboard
- `/support/faq` - FAQ knowledge base

### 2. Support Agent (role: 'support_agent')

**Registration Process:**

1. Go to `/support-agent-register`
2. Fill registration form
3. Admin receives notification
4. Admin approves in notifications
5. Agent gets approval notification
6. Can now log in and access dashboard

**Can:**

- View all open/unassigned tickets (Agent Dashboard)
- Assign unassigned tickets to themselves
- Update ticket status (Open → In Progress → On Hold → Resolved → Closed)
- Add internal notes (invisible to customers)
- View notes from other agents
- Cannot reassign (only admins can)

**Links to:**

- `/agent/dashboard` - Their ticket dashboard
- `/support/tickets/{id}` - To handle specific tickets

### 3. Admin (role: 'admin')

**Can:**

- Approve/reject support agent registrations
- View all tickets in support management dashboard
- Reassign tickets between agents
- View all ticket details and notes
- See stats: total tickets, open, in progress, unassigned
- Receive notifications on all ticket activity

**Links to:**

- `/admin/support` - Support management dashboard
- `/admin/approve-agent/{agentId}` - Approve agents (from notifications)

---

## 📱 User Flows

### Creating a Support Ticket (Customer)

```
1. Customer clicks "Support" in navbar
2. Dashboard shows their previous tickets
3. Click "Create New Ticket"
4. Fill form: Subject, Category, Description
5. Optional: Link to delivery
6. Submit
7. Get confirmation
8. Agent assigned automatically
9. Customer notified when assigned
10. Can track progress and submit feedback when resolved
```

### Becoming Support Agent

```
1. Click "Become an Agent" link
2. Register with: Name, Email, Password, Phone
3. System sends notification to admin
4. Admin approves from notifications
5. Agent gets approval notification
6. Log in with credentials
7. See Agent Dashboard
8. Start handling tickets
```

### Handling Tickets (Agent)

```
1. Agent sees Agent Dashboard
2. View "My Tickets" (already assigned)
3. Or view "Unassigned" (open tickets)
4. Click on ticket to view details
5. Click "Assign to Self" for unassigned tickets
6. Status changes: Open → In Progress → On Hold → Resolved
7. Add internal notes for team
8. Mark as Resolved when done
9. Customer submits feedback
```

---

## 🔔 Notification System

### Who Gets Notified?

**When Customer Creates Ticket:**

- All support agents → "New Support Ticket: [subject]"
- All admins → "New Support Ticket: [subject]"

**When Ticket Assigned:**

- Customer → "Support Ticket Assigned"
- Agent → "Ticket Assigned to You"

**When Status Changes:**

- Customer → "[Old Status] → [New Status]"
- Admins → "Ticket Status Updated"

**When Agent Registers:**

- Admins → "New Support Agent Registration"

**When Agent Approved:**

- Agent → "Your account is approved"

---

## 📊 Dashboard Views

### Customer Support Dashboard

- List of own tickets with status badges
- Filter by status (All, Open, In Progress, On Hold, Resolved, Closed)
- Create new ticket button
- Link to FAQ

### Agent Dashboard

- List of assigned tickets
- Filter by status
- "Unassigned" button to see available tickets
- Quick action to handle each ticket
- Customer name visible

### Admin Support Management

- Stats cards: Total, Open, In Progress, Unassigned
- Full ticket table with all info
- Filter by status
- Highlight unassigned tickets
- Click to view/reassign

---

## 🎨 Styling

All components use:

- Tailwind CSS classes
- Consistent color scheme
- Status badges with colors:
  - Blue: Open
  - Yellow: In Progress
  - Orange: On Hold
  - Green: Resolved
  - Gray: Closed

---

## 🧪 Testing After Integration

1. **Create ticket as customer** ✅
2. **Receive as agent** ✅
3. **Agent assigns to self** ✅
4. **Status updates flow** ✅
5. **Internal notes visibility** ✅
6. **Admin notifications work** ✅
7. **FAQ displays correctly** ✅
8. **Feedback submission** ✅

---

## ❓ FAQ Section Pre-Population

The FAQ is empty initially. To populate with sample FAQs, use Django admin or add via API:

```bash
# Via curl or Postman:
POST /api/support/faq/
{
  "question": "What if my package arrived damaged?",
  "answer": "Please create a support ticket with category 'Damaged' and attach photos. Our team will help resolve this within 24 hours.",
  "category": "Damaged",
  "is_active": "true"
}
```

---

## 🐛 Troubleshooting

### Support endpoints return 403 Forbidden

- Ensure token is in Authorization header
- Check user role matches required role

### Agent can't see dashboard

- Check if support_agent_approved is 'true'
- Admin must approve agent first

### Notifications not showing

- Check notification routes in browser
- Verify recipient_id matches user ID
- Clear browser notifications cache

### Ticket not appearing in agent dashboard

- Ensure ticket.agent_id is set to agent's ID
- Status should be "In Progress" or "Open"

---

## 📝 Database Schema

All new tables created in MongoDB:

- `support_tickets` - Main ticket data
- `ticket_internal_notes` - Agent notes
- `support_faq` - Knowledge base
- `ticket_feedback` - Customer ratings
- User model updated with support_agent role

---

## 🎓 Next Steps

1. ✅ Integrate routes into App.tsx
2. ✅ Update navigation/navbar
3. ✅ Test user flows
4. ✅ Add FAQ entries to knowledge base
5. ✅ Set up support agent approvals process
6. ✅ Brief users on new features
7. ✅ Monitor ticket volume and agent workload

---

## 📞 Support Features Summary

| Feature                    | Status      |
| -------------------------- | ----------- |
| Ticket Creation            | ✅ Complete |
| Ticket Management          | ✅ Complete |
| Support Agent Role         | ✅ Complete |
| Admin Approval             | ✅ Complete |
| Internal Notes             | ✅ Complete |
| Feedback System            | ✅ Complete |
| FAQ Knowledge Base         | ✅ Complete |
| Notifications              | ✅ Complete |
| Status Tracking            | ✅ Complete |
| Unassigned Ticket Reassign | ✅ Complete |

---

**Ready to integrate! All backend is done. Just add routes and update navigation!** 🎉
