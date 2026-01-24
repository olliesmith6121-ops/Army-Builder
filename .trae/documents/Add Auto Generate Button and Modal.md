I will add an "Auto Generate" button to the Army Builder toolbar that appears only when the list is empty (a new list). This button, when clicked, will open a confirmation modal with fields for Faction, Name, and Game Size.

### 1. Update `renderArmyBuilder` in `index.html`
- I will modify the HTML generation in `renderArmyBuilder` to conditionally include the "Auto Generate" button.
- Condition: `armyFormations.length === 0` (indicating a new/empty list).
- Location: Inside the `.builder-controls-row` div, likely after the points input.
- Action: `onclick="openAutoGenerateModal()"`.

### 2. Add `openAutoGenerateModal` Function
- I will add a new function `openAutoGenerateModal()` to `index.html`.
- This function will inject a modal into `modal-root`.
- The modal will contain:
    - **Faction Select**: Pre-selected with the current `selectedArmy`.
    - **Name Input**: Pre-filled with `builderMeta.name`.
    - **Points Input**: Pre-filled with `builderMeta.pointsCap`.
    - **Buttons**: "Cancel" and "Generate".

### 3. Add `handleAutoGenerateConfirm` Function (Stub)
- I will add `handleAutoGenerateConfirm()` which will be called by the "Generate" button.
- For now, this will verify the inputs and log/alert that generation would start, or call a placeholder logic.
- It will update the `builderMeta` and `selectedArmy` based on the modal inputs before proceeding.

### 4. Verification
- I will verify that the button only appears on empty lists.
- I will verify that the modal opens with the correct values.
- I will verify that clicking "Generate" triggers the confirm handler (simulated).
