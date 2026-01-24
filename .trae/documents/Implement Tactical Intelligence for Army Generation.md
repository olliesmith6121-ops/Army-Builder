I will enhance the auto-generation system to incorporate deep tactical intelligence based on unit capabilities.

1.  **Define Tactical Archetypes**:
    *   Create a constant `TACTICAL_ARCHETYPES` in `index.html`.
    *   Define scoring criteria for archetypes:
        *   **Hit & Run**: High Speed (>10"), High Damage, "Infiltrate", "Deep Strike", "Flyer".
        *   **Defensive Anchor**: High Wounds/Save (2+/3+), "Regenerate", "Shield", "Invulnerable".
        *   **Fire Support**: Long Range (>24"), High Dice/AP, "Barrage".
        *   **Assault Shock**: High CAF, "Furious Charge", "Rampage".

2.  **Implement Unit Analysis Logic**:
    *   Create `analyzeUnitTactics(unitId)` function.
    *   Parse unit stats (`movement`, `save`, `caf`, `wounds`) and `special_rules`.
    *   Assign a "Tactical Score" for each archetype (0-100) to every unit.
    *   Cache these scores in a global `UNIT_TACTICS` object.

3.  **Upgrade `generateRandomArmy`**:
    *   **Phase 1 (Compulsory)**:
        *   Instead of picking the cheapest, pick the unit with the highest tactical score for the selected style that fits within a "safe" budget (e.g., leaving 70% of points for the rest).
    *   **Phase 2 (Scoring)**:
        *   Replace the simple `styleWeights` logic with a dynamic score:
            *   `Base Score`: From `styleWeights` (Role preference).
            *   `Tactical Bonus`: + (Unit's Tactical Score for current Style * 2).
            *   `Synergy Bonus`: Boost if unit shares rules with existing army (e.g., all "Flyer").
    *   **Validation**: Ensure "Hit & Run" actually prioritizes speed by heavily weighting the Movement stat in the `analyzeUnitTactics` formula.

4.  **UI Integration**:
    *   No major UI changes needed; the existing "Army Tactic" dropdown will now power this deeper logic instead of just role weights.
    *   Add a "Tactical Intelligence" log to the console to show why units were picked (for debugging/user trust).

5.  **Verification**:
    *   Select "Hit & Run" and verify the list contains mostly Fast/Flyer units.
    *   Select "Defensive Anchor" and verify high-toughness units.
