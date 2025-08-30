# Issue Voting API Implementation Guide

## Backend API Endpoints

### 1. **Vote on Issue**
```http
POST /api/issues/:issueId/vote
Authorization: Bearer <token>

Body:
{
  "voteType": 1  // 1 for upvote, -1 for downvote
}

Response:
{
  "success": true,
  "data": {
    "vote": {
      "user_id": "user-uuid",
      "issue_id": "issue-uuid",
      "vote_type": 1,
      "action": "added",
      "created_at": "2025-08-31T16:00:00Z"
    },
    "issueStats": {
      "upvotes": 18,
      "downvotes": 3,
      "total_score": 15,
      "user_vote": 1
    }
  }
}
```

### 2. **Remove Vote**
```http
DELETE /api/issues/:issueId/vote
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "issueStats": {
      "upvotes": 17,
      "downvotes": 3,
      "total_score": 14,
      "user_vote": null
    }
  }
}
```

## Frontend Implementation

### **IssueCard (Compact) - Upvote Only**
- ✅ Shows only upvote button with count
- ✅ Green color when user has upvoted
- ✅ Neutral color when not voted
- ✅ Clicking same vote removes it
- ✅ Shows comments count
- ✅ Shows thumbnail image

### **IssueDetailPage (Full) - Both Votes**
- ✅ Shows both upvote and downvote buttons
- ✅ Shows total vote score
- ✅ Color coding for voted state
- ✅ Remove vote functionality

### **Color Scheme**
- **Upvoted State**: Green background (bg-green-100), green border, green text
- **Not Voted State**: Transparent background, hover effects
- **Vote Count**: Bold numbers showing current vote count

### **User Experience**
- ✅ Login required to vote
- ✅ Toast notifications for vote actions
- ✅ Loading states during vote submission
- ✅ Visual feedback with filled icons when voted
- ✅ Click same vote type to remove vote

### **Permissions**
- ✅ Must be authenticated to vote
- ✅ Cannot vote on own issues (backend validation)
- ✅ Rate limiting: 100 votes per hour per user

## Validation Rules

### **Frontend Validation**
- Check user authentication before voting
- Prevent multiple rapid clicks
- Show appropriate error messages

### **Backend Validation**
- voteType must be exactly 1 (upvote) or -1 (downvote)
- User cannot vote on their own issues
- Rate limiting enforcement
- Issue must exist and be accessible

### **Business Logic**
- Voting same type twice removes the vote
- Voting different type changes the vote
- Updates user reputation system
- Tracks voting history

## Integration Notes

1. **State Management**: Both components use Zustand store for consistent state
2. **API Consistency**: Backend expects numeric values (1/-1), frontend handles conversion
3. **Error Handling**: Comprehensive error handling with user-friendly messages
4. **Performance**: Optimistic UI updates with rollback on error
5. **Accessibility**: Proper disabled states and loading indicators

The voting system is now properly implemented with:
- ✅ Clean UI with proper color states
- ✅ Simplified compact view (upvote only)
- ✅ Full detailed view (both votes)
- ✅ Consistent API integration
- ✅ Proper error handling and validation
