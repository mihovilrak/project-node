# Notifications

Notifications tell you when something you are involved in changes. This page covers what triggers them and how to read and clear them.

You are never notified about your own changes.

## What you are notified about

| Notification | Sent to | When |
| --- | --- | --- |
| **Task Created** | Watchers | A task is created. |
| **Task Updated** | Watchers | A task is edited, its status or dates change. |
| **Task Status Updated** | Assignee | The task's status changes. |
| **Task Assigned** | New assignee | A task is assigned to someone else. |
| **Task Completed** | Task creator | The task moves to **Done**. |
| **New Comment** | Watchers | Someone comments on the task. |
| **Task Due Soon** | Assignee | The task is due today or tomorrow and is not Done, Cancelled or Deleted. Checked hourly. |
| **Added to Project** | Project members | Someone joins the project. |

See [Watchers](/guide/tasks#watchers) to follow a task.

## Read notifications

1. Select the bell icon in the app bar. The badge shows how many are unread.
2. Switch between **All**, **Read** and **Unread**.
3. Select a notification to mark it read and open the task or project it refers to.
4. Select **View all** to open the full **Notifications** page.

The app checks for new notifications every 60 seconds while its browser tab is visible.

## Clear notifications

1. Open the **Notifications** page (`/notifications`).
2. Select **Mark all as read**, or use the delete icon on a single notification.

Read notifications older than 30 days are archived automatically.

## Email

If your administrator has enabled email (see [Settings](/admin/settings#email-smtp)), notifications are also sent to the email address on your profile.

Email is on by default for everyone, and there is no screen to turn it off yet. Setting either `notifications_enabled` or `email_notifications_enabled` to `false` through `PUT /api/settings/user_settings` stops the emails. In-app notifications still appear.

Emails are sent within about a minute. A failed send is retried with growing delays.
