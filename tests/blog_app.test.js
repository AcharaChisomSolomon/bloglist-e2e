const { test, expect, beforeEach, describe } = require('@playwright/test');

describe('Blog App', () => {
    beforeEach(async ({ page, request }) => {
        await request.post('http:localhost:3003/api/testing/reset');
        await request.post('http:localhost:3003/api/users', {
            data: {
                name: "Laaki Mluukai",
                username: "mluukai",
                password: "mluukaipassword"
            }
        })

        await page.goto("http://localhost:5173");
    });

    test("login form is shown", async ({ page }) => {
        const title = page.getByText("log in to application");
        
        await expect(title).toBeVisible();
    });

    describe('Login', () => { 
        test("succeeds with correct credentials", async ({ page }) => {
            await page.getByTestId('username').fill("mluukai");
            await page.getByTestId('password').fill("mluukaipassword");
            
            await page.getByRole('button', { name: 'login' }).click();

            const success = page.getByText('Laaki Mluukai logged in');
            await expect(success).toBeVisible();
        });
        
        test("fails with wrong credentials", async ({ page }) => { 
            await page.getByTestId('username').fill("mluukai");
            await page.getByTestId('password').fill("wrongpassword");

            await page.getByRole('button', { name: 'login' }).click();

            const locator = page.getByText('wrong username or password');
            await expect(locator).toBeVisible();
        });
    });

    describe('When logged in', () => { 
        beforeEach(async ({ page }) => { 
            await page.getByTestId('username').fill("mluukai");
            await page.getByTestId('password').fill("mluukaipassword");
            await page.getByRole('button', { name: 'login' }).click();
        });

        test('A blog can be created', async ({ page }) => { 
            await page.getByRole('button', { name: 'create new blog' }).click();
            await page.getByTestId('title').fill("A blog created by playwright");
            await page.getByTestId('author').fill("Laaki Mluukai");
            await page.getByTestId('url').fill("https://www.laakimluukai.com");

            await page.getByRole('button', { name: 'create' }).click();

            const locator = page.getByText("A blog created by playwright - Laaki Mluukai");
            await expect(locator).toBeVisible();
        });

        describe('and a blog exists', () => { 
            beforeEach(async ({ page }) => { 
                await page.getByRole('button', { name: 'create new blog' }).click();
                await page.getByTestId('title').fill("A blog created by playwright");
                await page.getByTestId('author').fill("Laaki Mluukai");
                await page.getByTestId('url').fill("https://www.laakimluukai.com");

                await page.getByRole('button', { name: 'create' }).click();
            });

            test('A blog can be liked', async ({ page }) => { 
                await page.getByRole('button', { name: 'view' }).click();
                await page.getByRole('button', { name: 'like' }).click();

                const locator = page.getByText("likes 1");
                await expect(locator).toBeVisible();
            });

            test('A blog can be deleted', async ({ page }) => { 
                await page.on('dialog', async dialog => { 
                    await dialog.accept();
                });

                await page.getByRole('button', { name: 'view' }).click();
                await page.getByRole('button', { name: 'remove' }).click();

                const locator = page.getByText("A blog created by playwright - Laaki Mluukai");
                await expect(locator).not.toBeVisible();
            });

            test('remove button is not visible for other users', async ({ page, request }) => { 
                await page.getByRole('button', { name: 'logout' }).click();

                await request.post('http:localhost:3003/api/users', {
                    data: {
                        name: "New User",
                        username: "newuser",
                        password: "newuserpassword"
                    }
                });

                await page.getByTestId('username').fill("newuser");
                await page.getByTestId('password').fill("newuserpassword");
                await page.getByRole('button', { name: 'login' }).click();

                const removeButton = page.getByRole('button', { name: 'remove' });
                await expect(removeButton).not.toBeVisible();
            });
        });
    });
});