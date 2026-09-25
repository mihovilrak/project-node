# Settings

System settings control branding, email, lookups and runtime behaviour for every user. This page covers each settings area and the admin-only reports.

Everything on this page requires the **Admin** permission. Select **Settings** in the app bar; it has three tabs: **Users**, **Types & Roles** and **System**. For the **Users** tab, see [Users and roles](/admin/users-and-roles).

![Settings with the Users tab open](/screenshots/settings.png)

## System settings

1. Open **Settings** > **System**.
2. Set **App Name** and **Company Name**.
3. Set **Sender Email**, the From address of notification emails, for example `noreply@example.com`.
4. Pick the **Time Zone**.
5. Pick the **Theme**: **Light**, **Dark** or **System** (follows each user's device).
6. Select **Save Settings**.

![Settings > System](/screenshots/settings-system.png)

Changes apply at once, with no restart.

## Welcome message

The welcome message appears at the top of every user's **Home** page. Leave it empty to hide it.

1. Open **Settings** > **System** and find **Welcome Message**.
2. Write the message on the **Editor** tab. The toolbar offers bold, italic, underline and headings 1-3.
3. Check it on the **Preview** tab.
4. Select **Save Settings**.

The message is sanitised before display, so scripts and unsafe markup are dropped.

## Email (SMTP)

Notification emails need an SMTP server. Host, port and TLS are set here; the SMTP username and password stay in the server environment (`EMAIL_USER`, `EMAIL_PASSWORD` or `EMAIL_PASSWORD_FILE`). See [Configuration](/operations/configuration).

1. Open **Settings** > **System** and find **Runtime Configuration**.
2. Set **App Base URL** to the address users open, for example `https://pm.example.com`. Links in emails are built from it.
3. Turn on **Email sending enabled**.
4. Enter **SMTP Host** and **SMTP Port**.
5. Turn on **Implicit TLS (port 465)** if your server uses port 465. Leave it off for STARTTLS on port 587.
6. Set **Sender Email** in the left column.
7. Select **Save Settings**.

The notification service picks up the new values before its next batch, within about a minute.

### Send a test email

1. Save the settings first. The test uses the saved values.
2. Under **Test Email Configuration**, enter a **Test Email Address**, for example `you@example.com`.
3. Select **Send Test Email**. A green message confirms delivery; a red one shows the SMTP error.

If email sending is off, the test fails with "Email sending is disabled".

## Log level

**Runtime Configuration** also has a **Log Level** field. Saving it changes the logging level of both the API and the notification service while they run, with no restart. The API applies it at once; the notification service picks it up within about a minute. The `LOG_LEVEL` environment variable only sets the level used at start-up, until a service has read the saved value. See [Monitoring](/operations/monitoring).

## Task and activity types

Task types classify tasks (Bug, Feature and so on). Activity types classify time logs (Development, Meeting and so on).

1. Open **Settings** > **Types & Roles**.
2. Pick the **Task Types** or **Activity Types** tab.
3. Select **Add Task Type** / **Add Activity Type**, or the edit icon on an existing one.
4. Enter a **Name**, and optionally a **Description**.
5. Pick a **Color** and an icon.
6. Set **Active** and save.

To retire a type, turn **Active** off. Existing tasks and time logs keep it, but it is no longer offered and it drops out of the settings list.

To bring a type back:

1. Turn on **Show inactive** above the list.
2. Select **Reactivate** on the type.

## Roles

Roles are managed under **Settings** > **Types & Roles** > **Roles**. See [Manage roles](/admin/users-and-roles#manage-roles).

## Tags

Tags label tasks. The eight default tags cover common areas such as Frontend, Backend and Security.

1. Open **Settings** > **Types & Roles** > **Tags**.
2. Select **Add Tag**, or the edit icon on an existing tag.
3. Enter a **Name** (up to 50 characters) and a **Color** as a hex value, for example `#7B1FA2`.
4. Save.

To retire a tag, select its delete icon and confirm. The tag is deactivated, not erased. It disappears from tasks and tag pickers.

To bring a tag back, turn on **Show inactive** and select **Reactivate** on the tag. It shows again on the tasks that had it.

## Time log report

Administrators can list time logs across all users and projects through the API:

```sh
curl 'https://pm.example.com/api/admin/logs?startDate=2026-01-01&endDate=2026-01-31&limit=100' \
  -b 'connect.sid=<cookie>'
```

| Parameter | Meaning |
| --- | --- |
| `startDate`, `endDate` | Date range, `YYYY-MM-DD`. |
| `type` | Activity type id. |
| `limit` | Page size, default 50, maximum 500. |
| `offset` | Rows to skip. |

`GET /api/admin/stats` returns overall counts. Both endpoints are described in the [API reference](/api/).
