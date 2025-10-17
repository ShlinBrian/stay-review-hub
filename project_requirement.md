# Untitled

# 🏠 Flex Living – Developer Assessment

## 1. Introduction

You are tasked with building a **Reviews Dashboard** for **Flex Living**, enabling managers to assess property performance based on guest reviews.

---

## 2. Scope of Work

### 🔹 1. Hostaway Integration (Mocked)

- Integrate with the **Hostaway Reviews API** (sandboxed, no real data).
- Use the provided **JSON file** to mock realistic review data.
- **Parse and normalize** reviews by:
    - Listing
    - Review type
    - Channel
    - Date

### 🔹 2. Manager Dashboard

Build a **modern, user-friendly dashboard** where managers can:

- View **per-property performance**
- **Filter/sort** by rating, category, channel, or time
- Detect **trends** or recurring issues
- **Select reviews** for public website display
    
    Design should be **clean, intuitive**, and reflect **product management thinking**.
    

### 🔹 3. Review Display Page

- **Replicate** the Flex Living property detail layout.
- Add a **guest reviews section** showing only **approved/selected reviews**.
- Ensure **design consistency** with the Flex Living website.

### 🔹 4. Google Reviews (Exploration)

- Explore integration via **Google Places API** or similar.
- If feasible, implement a **basic integration**.
- If not feasible, document your **findings**.

---

## 3. Evaluation Criteria

Your solution will be judged on:

- Real-world **JSON data handling** and normalization
- **Code clarity** and structure
- **UX/UI** quality and reasoning
- **Dashboard insightfulness**
- **Problem-solving initiative** (handling ambiguous requirements)

---

## 4. Deliverables

Submit:

- ✅ **Source code** (frontend and backend)
- ✅ **Running version or setup instructions**
- ✅ **Brief documentation** (1–2 pages) covering:
    - Tech stack used
    - Key design and logic decisions
    - API behavior
    - Google Reviews findings

---

## 5. API Access

| Field | Value |
| --- | --- |
| **Account ID** | 61148 |
| **API Key** | `f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152` |

> ⚠️ Note: Access is sandboxed; mock data provided separately.
> 

---

## 6. Important Notes

- Implement the backend API route:
    
    ```
    GET /api/reviews/hostaway
    
    ```
    
    → Must fetch and normalize Hostaway reviews for frontend use.
    
- This endpoint will be **tested directly**.
- Approach the task like a **product owner** — prioritize usability and real-world workflow.

---

## 7. Hostaway API Example

```json
{
  "status": "success",
  "result": [
    {
      "id": 7453,
      "type": "host-to-guest",
      "status": "published",
      "rating": null,
      "publicReview": "Shane and family are wonderful! Would definitely host again :)",
      "reviewCategory": [
        {"category": "cleanliness", "rating": 10},
        {"category": "communication", "rating": 10},
        {"category": "respect_house_rules", "rating": 10}
      ],
      "submittedAt": "2020-08-21 22:45:14",
      "guestName": "Shane Finkelstein",
      "listingName": "2B N1 A - 29 Shoreditch Heights"
    }
  ]
}

```