# Getting started

This page covers signing in, finding your way around the app, and managing your profile.

## Sign in

1. Open the address your administrator gave you, for example `https://pm.example.com`.
2. Enter your **Username** and **Password**, then select **Login**.
3. You land on **Home**.

![The login form](/screenshots/login.png)

Your session lasts one hour and is extended every time you use the app. After an hour of inactivity you are signed out and must log in again.

::: warning Failed logins
After 5 failed attempts for the same username, the account is locked for a short time. The lock starts at 30 seconds and doubles with each further failure, up to 15 minutes. While locked, the login form shows *Too many failed login attempts. Please try again in N minute(s).* Wait for that time, then try again.

The server also limits each network address to 20 login requests per 15 minutes.
:::

If your account is deactivated or deleted, you are signed out straight away on every device.

## Home

**Home** shows:

1. The **welcome message**, if your administrator has set one (see [Settings](/admin/settings#welcome-message)).
2. **My Active Tasks**, in two columns: **Tasks I hold** and **Tasks assigned to me**. Only tasks in an open status are listed. The **Edit** and **Delete** icons on a card show only if you have the **Edit tasks** or **Delete tasks** permission.

![Home with the welcome message and My Active Tasks](/screenshots/dashboard.png)

## The app bar

The bar at the top of every page has:

| Item | What it does |
| --- | --- |
| **Home**, **Projects**, **Tasks** | Main sections. |
| **Users**, **Settings** | Admin screens. Only users with the **Admin** permission see these tabs. |
| Sun/moon icon | Switches between light and dark mode. Your choice is saved in this browser. |
| Bell icon | Opens [notifications](/guide/notifications). The badge shows the unread count. |
| Your username | Opens your profile. |
| **Logout** | Ends your session. |

The [calendar](/guide/calendar) has no tab. Open it at `/calendar`.

## Profile

Select your username in the app bar to open your profile.

The profile shows **Total Tasks**, **Completed Tasks**, **Active Projects** and **Hours Logged**, followed by your tasks and projects.

### Edit your details

1. On the profile page, select **Edit Profile**.
2. Change **First Name**, **Last Name** or **Email**.
3. Save.

### Change your password

1. On the profile page, select **Change Password**.
2. Enter your **Current Password**, then the **New Password** and **Confirm New Password**.
3. Save. Your other sessions are signed out; this one stays open.

A password needs at least 12 characters, with a lowercase letter, an uppercase letter, a digit and a special character.

## Permissions

What you can do depends on your role. If a button is missing, you probably lack the permission it needs. The [permissions matrix](/admin/users-and-roles#permissions-matrix) lists the default roles.
