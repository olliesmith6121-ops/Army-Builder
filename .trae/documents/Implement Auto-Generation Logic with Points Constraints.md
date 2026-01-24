I will implement the auto-generation logic for army lists, respecting the user's request for point increments and on-the-fly generation.

1.  **Update UI for Points Input**:
    *   Modify the `Auto Generate` modal HTML to restrict the Points Limit input to a range of **500 - 5000** with a **step of 500**.
    *   Set the default value to 2000.

2.  **Implement Auto-Generation Logic**:
    *   Create a new function `generateRandomArmy(faction, pointsCap, styleWeights)` in `index.html`.
    *   **Phase 1: Foundation (Compulsory)**:
        *   Randomly select a formation from the faction's available list.
        *   Iterate through all **Compulsory** slots of that formation.
        *   For each slot, find valid units (matching role).
        *   Select the cheapest valid unit to ensure the list is legal.
        *   Add these units to the list.
    *   **Phase 2: Expansion (Optional)**:
        *   Loop until `currentPoints >= pointsCap - tolerance` (e.g., 50 pts).
        *   Identify all available actions:
            *   **Add Unit**: Find empty **Optional** slots in current formations.
            *   **Upgrade Unit**: Find valid upgrades for existing units (e.g., "Increase Brood Size", weapon swaps).
            *   **Add Formation**: If points allow (e.g., > 500 pts remaining), consider adding a new formation.
        *   **Scoring System**:
            *   Score each potential action based on `styleWeights` (e.g., if "Air Support" style, heavily weight Flyer units).
            *   Apply a random factor to ensure variety.
            *   Filter out actions that would exceed the points cap.
        *   Execute the highest-scoring action.
        *   If no actions are possible (stuck), break the loop.

3.  **Integration**:
    *   Connect `generateRandomArmy` to the existing `handleAutoGenerateConfirm` function.
    *   Replace the current alert stub with the actual function call.
    *   Ensure the generated list is saved to state and the UI is re-rendered (`renderContent`).

4.  **Verification**:
    *   Generate lists at 500, 2000, and 5000 points.
    *   Verify that generated lists are legal (all compulsory slots filled).
    *   Verify that lists roughly adhere to the selected style (e.g., "Air Support" has more flyers).
