# Tasks

Tasks are the units of work inside a project. This page covers creating tasks, updating them, and working with subtasks, files, watchers and comments.

You see the tasks of every project you can see.

## Browse tasks

1. Select **Tasks** in the app bar.
2. Sort **A-Z** / **Z-A**, switch between grid and list view, and filter with the filter panel.
3. Select a task card to open it.

Each card has **Edit** and **Delete** icons. They show only if you have **Edit tasks** or **Delete tasks**.

![The Tasks list](/screenshots/tasks.png)

## Create a task

Requires **Create tasks**.

1. Select **Create New Task** on **Tasks**, or **Create Task** on a project's **Tasks** tab.
2. Fill in the required fields: **Name**, **Project**, **Type**, **Priority**, **Status**, **Holder**, **Assignee**, **Start Date** and **Due Date**.
3. Optionally set **Description**, **Estimated Time** (hours), **Progress** (%), **Parent Task** and **Tags**.
4. Save.

The **holder** owns the task; the **assignee** does the work. The holder, the assignee and you are added as [watchers](#watchers) automatically, and the other watchers get a **Task Created** notification.

## Task fields

| Field | Values |
| --- | --- |
| Status | New, In Progress, On Hold, Review, Done, Cancelled |
| Priority | Low/Wont, Normal/Could, High/Should, Very high/Must, Urgent/ASAP |
| Type | Task, Bug, Feature, Code Review, Documentation, Testing, Research, Work Package. Admins can [add more](/admin/settings#task-and-activity-types). |
| Tags | Frontend, Backend, Database, UI/UX, API, Security, Performance, DevOps. Admins can [add more](/admin/settings#tags). |

![A task page with its details, status and subtasks](/screenshots/task-details.png)

## Change the status

Requires **Edit tasks**.

1. Open the task.
2. Select the status button in the header.
3. Pick the new status.

Watchers get a **Task Updated** notification. Moving a task to **Done** also sends **Task Completed** to the task's creator.

## Edit or delete a task

Editing requires **Edit tasks**. Deleting requires **Delete tasks**.

1. On **Tasks**, a project's **Tasks** tab or **Home**, find the task card.
2. Select **Edit** to open the form, or **Delete** to remove the task.

Changing the assignee sends the new assignee a **Task Assigned** notification.

You can also delete from the task page with the delete icon in the header. A deleted task gets the **Deleted** status and disappears from lists.

## Subtasks

Requires **Create tasks**.

1. Open the parent task.
2. Under **Subtasks**, select **Add Subtask**.
3. Fill in the form. **Parent Task** is already set.

## Files

1. Open the task and select **Upload File**.
2. Pick a file up to 10 MB. A larger file is not uploaded and the page shows "File too large (max 10 MB)".

Allowed types: images (png, jpg, jpeg, gif, webp, bmp), pdf, txt, csv, md, json, Office documents (doc, docx, xls, xlsx, ppt, pptx, odt, ods) and zip. Deleting a file requires **Delete files**.

## Watchers

Watchers get notifications when the task changes or gets a comment.

1. Open the task.
2. Select **Add Watchers** (or **Manage Watchers** if the task already has some). Requires **Edit tasks**.
3. Tick the users to watch, untick those to remove.

Anyone can stop watching a task by removing themselves from the watcher list.

## Comments

1. Open the task and type in **Add a comment...**.
2. Post it. Comments are limited to **400 characters**; the counter under the box shows how many you have used.

Only the author of a comment can edit or delete it. Administrators can edit or delete any comment.
