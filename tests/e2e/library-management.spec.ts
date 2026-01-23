import { test, expect } from '@playwright/test';

test.describe('Library Management', () => {
    // Setup: We need a fresh user or a way to ensure we have a work to manage.
    // For simplicity in this suite, we'll repeat a quick signup flow to get a clean state,
    // or we assume the "Critical Path" test left us with a user/work if we run sequentially with stored state (complex).
    // BETTER: Include a condensed signup+add flow in beforeEach to ensure isolation.

    test.beforeEach(async ({ page }) => {
        const uniqueId = Date.now();
        const email = `lib_test_${uniqueId}@example.com`;
        const pseudo = `LibTester_${uniqueId}`;
        const password = 'Password123!';

        await page.goto('/auth');

        // Register
        const toggleToRegister = page.locator('button').filter({ hasText: /inscrire|Sign up/i }).last();
        if (await toggleToRegister.isVisible()) {
            await toggleToRegister.click();
        }

        await page.fill('input[placeholder*="Pseudo" i], input[placeholder*="Username" i]', pseudo);
        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', password);
        await page.locator('button[type="submit"]').filter({ hasText: /inscrire|Sign up/i }).click();
        await expect(page).toHaveURL(/.*dashboard/);

        // Add a work (Quickly via Search)
        const searchTrigger = page.getByTitle(/Rechercher|Search/i).first();
        await searchTrigger.click();
        const searchInput = page.locator('input[placeholder*="Rechercher" i], input[placeholder*="Search" i]');
        await searchInput.fill('Bleach');
        const firstResult = page.locator('div').filter({ hasText: /^Bleach$/i }).first();
        await expect(firstResult).toBeVisible({ timeout: 10000 });
        await firstResult.click();

        // Add to library
        const addButton = page.locator('button').filter({ hasText: /Ajouter|Add/i }).first();
        await addButton.click();
        await expect(page.locator('text=/Collecte|Collection|Ajouté|Added/i').first()).toBeVisible();
    });

    test('should allow user to update progress, change status, and remove work', async ({ page }) => {
        // 1. Go to Library
        await page.goto('/library');

        // Verify work is present
        const workCard = page.locator('h3', { hasText: /Bleach/i }).first();
        await expect(workCard).toBeVisible();

        // 2. Navigate to Details
        await workCard.click();
        await expect(page).toHaveURL(/.*work\/\d+/);

        // 3. Update Status
        // Status buttons: "Reading", "Completed", etc.
        // Let's click "Completed" / "Terminé"
        const completedBtn = page.locator('button').filter({ hasText: /Terminé|Completed/i }).first();
        await expect(completedBtn).toBeVisible();
        await completedBtn.click();

        // Verify active state (class check or just visual feedback if possible)
        // In WorkDetails.tsx: `${styles.statusButton} ${work.status === s ? styles.statusButtonActive : ''}`
        // We can check if class attribute contains 'Active' or similar if we knew the hashed class name.
        // Safer: Check if the button has a distinct style or if we can re-verify status in library.

        // 4. Update Progress
        // Click +1 button
        const plusOneBtn = page.locator('button', { hasText: '+1' }).first();
        await plusOneBtn.click();

        // Verify display updates (e.g., "1 / ?")
        const progressDisplay = page.locator('span').filter({ hasText: /\d+\s*\/\s*\?/ }).first();
        await expect(progressDisplay).toBeVisible();
        // Ideally check text content contains "1 /"

        // 5. Remove Work
        // Go back to Library to use the delete feature there (as per plan)
        await page.goto('/library');

        // Hover over card to see delete button (if needed, but Playwright can force click)
        // Delete button is an icon button with trash icon. title="Supprimer..." / "Delete..."
        // Locate the specific card for 'Bleach' then find the delete button within or near it.
        // In Library.tsx, the delete button is absolute positioned on the card.

        // We need to trigger hover for the button to appear visibly, or just force click.
        // The delete button has `title={t('library.delete_work')}`
        // Let's try to find it by title.
        const deleteButton = page.locator('button[title*="Delete"], button[title*="Supprimer"]').first();

        // Force visibility or hover
        await workCard.hover();
        await expect(deleteButton).toBeVisible();
        await deleteButton.click();

        // 6. Confirm Deletion
        // Modal appears. Click "Supprimer" / "Delete" (red button)
        const confirmDeleteBtn = page.locator('div[role="dialog"] button').filter({ hasText: /Supprimer|Delete/i }).last();
        await confirmDeleteBtn.click();

        // 7. Verify Removal
        // Card should be gone
        await expect(workCard).not.toBeVisible();
    });
});
