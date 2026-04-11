# **Project Overview: "CS Reflection & Mapping Dashboard"**

**Goal:** Build a full-stack web application for a high school Computer Science class. The app facilitates a live, interactive reflection quiz. It allows the teacher to create a session, track student progress in real-time, and analyze results. Students join via a code, answer questions, provide confidence levels, and explain their reasoning.

**Language:** The UI (User Interface) for both students and the teacher MUST be in Hebrew (RTL support is required). The code structure, variables, and comments should be in English.

**Core Requirements:**

1. **Teacher Dashboard:** Create sessions, monitor live progress, view visual analytics, and manage the question bank (add, edit, delete).  
2. **Student App:** Join with a code, navigate through the questions assigned to that specific session, and submit answers.  
3. **Data Persistence:** Store data locally (e.g., using localStorage or a local JSON file via a simple Node.js backend if a full database is not implemented yet) with support for multiple sessions (different classes).

## **1\. Data Model (JSON Structure)**

The application needs to manage the following state:

### **1.1 Global Question Bank**

A dynamic array of question objects. The app should load with a default set of 6 hardcoded questions, but the teacher can modify this bank. Each object should contain:

* id: string (e.g., "q1a", "q2")  
* title: string (e.g., "תחנה 1: תנאים ולוגיקה")  
* codeSnippet: string (Java code block)  
* questionText: string  
* options: array of strings (A, B, C, D)  
* correctAnswerIndex: integer

### **1.2 Session Object**

* **CRITICAL LOGIC:** When a new session is created, it MUST take a snapshot/copy of the current Global Question Bank and store it here. Changes to the Global Question Bank later should NOT affect existing sessions.  
* sessionId: string (A unique 5-6 character PIN/Code, e.g., "8A2B9")  
* createdAt: timestamp  
* className: string (Optional, for teacher's reference)  
* questions: array of Question objects (Snapshot from the Global Question Bank at the time of creation)  
* students: array of Student objects

### **1.3 Student Object**

* studentId: string (unique ID or just their name)  
* name: string  
* currentQuestionIndex: integer (0 to number of questions \- 1, or final index for finished)  
* answers: array of Answer objects

### **1.4 Answer Object**

* questionId: string  
* selectedOptionIndex: integer  
* confidenceLevel: integer (1-5)  
* explanation: string

## **2\. Teacher Interface (Admin Dashboard)**

The teacher area should have the following views:

### **2.1 View 1: Session Manager (Home)**

* **Action:** A button to "Create New Quiz Session" (צור מבדק חדש). This action copies the current question bank into the new session.  
* **Action:** Input field for a class name (optional).  
* **Display:** A list of existing/past sessions with their creation date, PIN code, and number of participants. Clicking a session opens the Live Dashboard.  
* **Action:** Option to export a session's data to a CSV/JSON file.  
* **Navigation:** A link/button to manage the Question Bank (View 4).

### **2.2 View 2: Live Monitoring (Lobby / Active Quiz)**

* **Header:** Prominently display the sessionId (PIN Code) for students to join.  
* **Live Roster:** A grid or list showing all connected students.  
* **Status Indicators:** Next to each student's name, show their status:  
  * "Waiting..." (טרם התחיל)  
  * "On Question X/Y" (בשאלה X מתוך Y)  
  * "Finished" (סיים) \- visually highlight finished students (e.g., green checkmark).

### **2.3 View 3: Analytics Dashboard (Post-Quiz or Live)**

* **Summary:** Total students, average score, average confidence level.  
* **Per-Question Analysis (The Core):** For each question in the session, display:  
  * **Accuracy:** A pie chart or progress bar showing the % of students who got it right.  
  * **Confidence vs. Accuracy:** A visual indicator. *Crucial metric: Highlight if many students answered incorrectly but had high confidence (Red Flag).*  
  * **Answer Distribution:** A bar chart showing how many students chose A, B, C, or D (to identify popular distractors).  
  * **Explanations Feed:** A scrollable list of the text explanation submitted by students for that question, preferably showing the student's name and whether they got it right or wrong.

### **2.4 View 4: Question Bank Manager**

* **Display:** A list of all questions currently in the Global Question Bank.  
* **Action (Edit):** An "Edit" button next to each question allowing the teacher to modify the title, text, code snippet, options, or correct answer index directly within the UI.  
* **Action (Delete):** A "Delete" button next to each question to remove it from the global bank.  
* **Action (Import):** An "Import Questions" button allowing the teacher to upload or paste a JSON array of new questions (matching the Question schema).  
* **Action (Download Template):** A "Download JSON Template" button that generates and downloads an empty or sample JSON array (e.g., \[ { "id": "", "title": "", "codeSnippet": "", "questionText": "", "options": \["","","",""\], "correctAnswerIndex": 0 } \]) to guide the teacher in formatting new questions correctly.  
* **Warning Text:** Clearly state that editing the bank will only affect *new* quizzes created from this point forward, not existing sessions.

## **3\. Student Interface**

The student app should be mobile-friendly and straightforward.

### **3.1 View 1: Join Screen**

* Input field for "Session Code" (קוד מבדק).  
* Input field for "Your Name" (שם התלמיד).  
* "Join" button.

### **3.2 View 2: The Quiz Flow**

* **Header:** Show progress (e.g., "שאלה 3 מתוך 6").  
* **Content:**  
  * Display the title and questionText.  
  * Display the codeSnippet in a nicely formatted code block (monospaced font, syntax highlighting if possible).  
* **Inputs:**  
  * Radio buttons or clickable cards for the 4 options.  
  * A slider or 5 clickable stars/buttons for confidenceLevel (1 \= ניחשתי, 5 \= בטוח ב-100%).  
  * A textarea for explanation (הסבר מדוע בחרת בתשובה זו).  
* **Navigation:** "Next Question" (שאלה הבאה) button. It should validate that all 3 fields (option, confidence, explanation) are filled before proceeding.

### **3.3 View 3: Completion Screen**

* A friendly "Thank You" message indicating the quiz is complete.  
* Instruct the student to look at the main board/teacher.

## **4\. Technical Constraints & Architecture**

* **RTL Support:** Ensure the CSS includes dir="rtl" on the body or main container, and text alignment is right-to-left.  
* **Real-time updates:** To achieve the "Live Monitoring" requirement, recommend using WebSockets (e.g., Socket.io) if building a custom backend, or Firebase Realtime Database / Firestore if using BaaS.  
  * *If the prompt is for a simpler local prototype first:* Simulate real-time by polling a local server or using localStorage events (if testing on the same browser).  
* **Styling:** Use a clean, modern UI framework (like Tailwind CSS, Material-UI, or Bootstrap) to make the code blocks readable and the dashboards visually appealing.

## **5\. Development Steps for the AI**

1. **Initialize:** Set up the project structure (Frontend \+ simple Backend/Storage).  
2. **Data & State Management:** Create the default Global Question Bank JSON. Implement the logic to snapshot this bank into the Session object upon creation.  
3. **Build Teacher Tools:** Implement the Question Bank Manager (View 4\) for importing, editing, deleting questions, and downloading the template.  
4. **Build Student Flow:** Implement the Join screen and the dynamic wizard for answering the session's specific snapshot of questions.  
5. **Build Teacher Dashboard:** Implement session creation and the Live Roster view.  
6. **Connect State:** Ensure student submissions update the Teacher's view (using WebSockets or polling).  
7. **Analytics:** Build the charts and data aggregation logic for the final Teacher Analytics view.